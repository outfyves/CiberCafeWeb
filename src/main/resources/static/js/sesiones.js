/**
 * sesiones.js - Gestión de equipos con Formulario Integrado (Anti-Caché)
 */

document.addEventListener('DOMContentLoaded', () => {
    CyberManager.sesiones.init();
});

CyberManager.sesiones = {
    totalPCs: 20,
    costPerHour: 2000,
    sessions: {},
    totalCollected: 0,
    configPcName: null, // PC que está siendo configurado actualmente
    listaClientes: [],

    init: async function() {
        this.loadPersistentSessions();
        await this.cargarClientes();
        await this.renderPCGrid();
        this.startGlobalTimer();
        this.updateStats();

        setInterval(() => {
            if (!this.configPcName) this.renderPCGrid();
        }, 10000);
    },

    cargarClientes: async function() {
        try {
            const resp = await fetch('/api/clientes');
            if (resp.ok) this.listaClientes = await resp.json();
        } catch (e) { console.error("Error cargando clientes", e); }
    },

    loadPersistentSessions: function() {
        const savedSessions = localStorage.getItem('active_sessions');
        const savedRevenue = localStorage.getItem('total_revenue');
        if (savedSessions) this.sessions = JSON.parse(savedSessions);
        if (savedRevenue) this.totalCollected = parseFloat(savedRevenue);
    },

    saveSessions: function() {
        localStorage.setItem('active_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('total_revenue', this.totalCollected.toString());
    },

    renderPCGrid: async function() {
        const grid = document.getElementById('pcGrid');
        if (!grid) return;

        let equipos = [];
        try {
            const response = await fetch('/api/equipos');
            equipos = await response.json();
        } catch (e) { return; }

        grid.innerHTML = '';

        equipos.forEach(eq => {
            const pcName = eq.nombre;
            const session = this.sessions[pcName];
            const isActive = !!session;
            const isConfiguring = (this.configPcName === pcName);
            const estado = eq.estado.toLowerCase();

            const card = document.createElement('div');
            card.className = `pc-card ${isActive ? 'active' : ''} ${estado}`;
            
            if (isConfiguring) {
                // MODO CONFIGURACIÓN (Dentro de la tarjeta)
                card.innerHTML = `
                    <div style="padding: 10px; background: #ebedef; border-radius: 8px;">
                        <h4 style="margin-bottom:10px; color:#2c3e50;">Configurar ${pcName}</h4>
                        
                        <label style="font-size:0.8rem; font-weight:bold;">Cliente:</label>
                        <select id="inlineClient" style="width:100%; padding:5px; margin-bottom:10px; border-radius:4px; border:1px solid #ccc;">
                            <option value="Cliente General">Cliente General</option>
                            ${this.listaClientes.map(c => `<option value="${c.nombre} ${c.apellido || ''}">${c.nombre} (${c.cedula})</option>`).join('')}
                        </select>

                        <label style="font-size:0.8rem; font-weight:bold;">Modo:</label>
                        <select id="inlineMode" onchange="document.getElementById('inlineTimeInput').style.display = (this.value==='prepago'?'block':'none')" style="width:100%; padding:5px; margin-bottom:10px;">
                            <option value="libre">Tiempo Libre</option>
                            <option value="prepago">Prepago</option>
                        </select>

                        <div id="inlineTimeInput" style="display:none; margin-bottom:10px;">
                             <input type="number" id="inlineMins" placeholder="Minutos" style="width:100%; padding:5px;">
                        </div>

                        <div style="display:flex; gap:5px;">
                            <button onclick="CyberManager.sesiones.cancelConfig()" style="flex:1; background:#95a5a6; color:white; padding:8px; border-radius:4px; font-size:0.8rem;">X</button>
                            <button onclick="CyberManager.sesiones.confirmConfig('${pcName}', ${eq.id}, ${eq.precioHora})" style="flex:2; background:#27ae60; color:white; padding:8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">INICIAR</button>
                        </div>
                    </div>
                `;
            } else {
                // MODO NORMAL
                let statusText = 'LIBRE';
                let statusColor = '#2ecc71';
                if (isActive) {
                    statusText = session.isCountdown ? 'PREPAGO' : 'EN USO';
                    statusColor = '#e67e22';
                } else if (estado === 'mantenimiento') {
                    statusText = 'MANTENIMIENTO';
                    statusColor = '#e74c3c';
                }

                card.innerHTML = `
                    <div class="pc-header">
                        <span class="pc-name">${pcName}</span>
                        <span class="status-badge" style="background:${statusColor}">${statusText}</span>
                    </div>
                    <div class="pc-body">
                        <div class="timer-display" id="timer-${pcName}">00:00:00</div>
                        <div class="cost-preview" id="cost-${pcName}" style="font-weight:bold; color:#555;">$0.00</div>
                        <div style="font-size:0.75rem; color:#888; margin-top:5px;">${eq.tipo}</div>
                    </div>
                    <div class="pc-footer">
                        ${!isActive && estado === 'disponible' ? 
                            `<button class="btn-action start" onclick="CyberManager.sesiones.startConfig('${pcName}')" style="width:100%; background:#3498db; color:white; padding:10px; border-radius:6px; font-weight:bold;">INICIAR</button>` : 
                          isActive ?
                            `<button class="btn-action stop" onclick="stopSession('${pcName}', ${eq.id})" style="width:100%; background:#e67e22; color:white; padding:10px; border-radius:6px; font-weight:bold;">COBRAR</button>` :
                            `<button disabled style="width:100%; background:#ccc; color:white; padding:10px; border-radius:6px;">BLOQUEADO</button>`
                        }
                    </div>
                `;
            }
            grid.appendChild(card);
        });
        this.updateStats();
    },

    startConfig: function(pcName) {
        this.configPcName = pcName;
        this.renderPCGrid();
    },

    cancelConfig: function() {
        this.configPcName = null;
        this.renderPCGrid();
    },

    confirmConfig: async function(pcName, dbId, tarifa) {
        const client = document.getElementById('inlineClient').value;
        const mode = document.getElementById('inlineMode').value;
        let mins = 0;
        let isCountdown = false;

        if (mode === 'prepago') {
            mins = parseInt(document.getElementById('inlineMins').value);
            if (isNaN(mins) || mins <= 0) { alert("Minutos inválidos"); return; }
            isCountdown = true;
        }

        try {
            // Guardar en DB
            const resp = await fetch('/api/sesiones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente: client,
                    equipo: pcName,
                    total: isCountdown ? (mins/60)*tarifa : 0,
                    estado: 'activa'
                })
            });
            const sesionDB = await resp.json();

            // Ocupar PC
            const eqResp = await fetch(`/api/equipos/${dbId}`);
            const eq = await eqResp.json();
            eq.estado = 'OCUPADO';
            await fetch(`/api/equipos/${dbId}`, {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(eq)
            });

            // Local
            this.sessions[pcName] = {
                dbId: dbId,
                sessionDbId: sesionDB.id,
                startTime: Date.now(),
                limitMs: mins * 60000,
                isCountdown: isCountdown,
                client: client,
                rate: tarifa
            };

            this.configPcName = null;
            this.saveSessions();
            this.renderPCGrid();
            CyberManager.ui.showMessage('success', `Sesión iniciada en ${pcName}`);
        } catch (e) { console.error(e); }
    },

    startGlobalTimer: function() {
        setInterval(() => {
            let total = 0;
            for (const pc in this.sessions) {
                const s = this.sessions[pc];
                const diff = Date.now() - s.startTime;
                const timerEl = document.getElementById(`timer-${pc}`);
                const costEl = document.getElementById(`cost-${pc}`);
                
                let cost = 0;
                if (s.isCountdown) {
                    const rem = s.limitMs - diff;
                    if (timerEl) timerEl.textContent = this.formatTime(Math.max(0, rem));
                    cost = (s.limitMs / 3600000) * s.rate;
                } else {
                    if (timerEl) timerEl.textContent = this.formatTime(diff);
                    cost = (diff / 3600000) * s.rate;
                }
                if (costEl) costEl.textContent = CyberManager.utils.formatMoney(cost);
                total += cost;
            }
            const revEl = document.getElementById('pendingRevenue');
            if (revEl) revEl.textContent = CyberManager.utils.formatMoney(this.totalCollected + total);
        }, 1000);
    },

    formatTime: function(ms) {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateStats: function() {
        const active = Object.keys(this.sessions).length;
        const badge = document.getElementById('activeCountBadge');
        if (badge) badge.textContent = active;
        const text = document.getElementById('activeCountText');
        if (text) text.textContent = `${active}/20 Equipos en uso`;
    }
};

window.stopSession = (pc, dbId) => {
    const s = CyberManager.sesiones.sessions[pc];
    if (!s) return;
    const elapsed = Date.now() - s.startTime;
    const finalCost = s.isCountdown ? (s.limitMs/3600000)*s.rate : (elapsed/3600000)*s.rate;

    if (confirm(`¿Cobrar ${CyberManager.utils.formatMoney(finalCost)}?`)) {
        fetch(`/api/sesiones/${s.sessionDbId}/finalizar`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({total: finalCost})
        }).then(() => {
            return fetch(`/api/equipos/${dbId}`).then(r => r.json()).then(eq => {
                eq.estado = 'DISPONIBLE';
                return fetch(`/api/equipos/${dbId}`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(eq)
                });
            });
        }).then(() => {
            CyberManager.sesiones.totalCollected += finalCost;
            delete CyberManager.sesiones.sessions[pc];
            CyberManager.sesiones.saveSessions();
            CyberManager.sesiones.renderPCGrid();
        });
    }
};
