/**
 * sesiones.js - Control de tiempo y renta de equipos
 * Correcciones: Actualización de stats, suma de ingresos y liberación de equipos.
 */

document.addEventListener('DOMContentLoaded', () => {
    CyberManager.sesiones.init();
});

CyberManager.sesiones = {
    totalPCs: 20,
    costPerHour: 2.00, // se sustituye por configuración en init
    sessions: {},
    totalCollected: 0, // Dinero histórico del día

    init: function() {
        this.loadConfig(); // cargar costo por hora desde configuracion
        this.loadPersistentSessions();
        this.renderPCGrid();
        this.startGlobalTimer();
        this.updateStats(); // Primera actualización de estadísticas

        // Escuchar cambios en almacenamiento para sincronizar tarifa/estado si se editan equipos
        window.addEventListener('storage', (e) => {
            if (e.key === 'cyberEquipos') {
                this.renderPCGrid();
                this.updateStats();
            }
        });
    },

    loadConfig: function() {
        try {
            const settings = window.getSystemSettings ? window.getSystemSettings() : {};
            if (settings.costPerHour) {
                this.costPerHour = parseFloat(settings.costPerHour);
            }
        } catch (e) {
            console.warn('No se pudo cargar configuración de sesiones:', e);
        }
    },

    loadPersistentSessions: function() {
        const savedSessions = localStorage.getItem('active_sessions');
        const savedRevenue = localStorage.getItem('total_revenue');
        
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
            // ensure each session has a rate (fallback a costo general)
            for (const k in this.sessions) {
                if (this.sessions[k].rate === undefined) {
                    this.sessions[k].rate = this.costPerHour;
                }
            }
        }
        if (savedRevenue) this.totalCollected = parseFloat(savedRevenue);
    },

    saveSessions: function() {
        localStorage.setItem('active_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('total_revenue', this.totalCollected.toString());
    },

    renderPCGrid: function() {
        const grid = document.getElementById('pcGrid');
        if (!grid) return;

        // load current equipment states in case they have changed elsewhere
        let equipos = [];
        try {
            equipos = JSON.parse(localStorage.getItem('cyberEquipos') || '[]');
        } catch (e) { /* ignore parsing errors */ }

        grid.innerHTML = '';

        for (let i = 1; i <= this.totalPCs; i++) {
            const pcId = `PC-${i.toString().padStart(2, '0')}`;
            const session = this.sessions[pcId];
            const isActive = !!session;
            const eq = equipos.find(e => e.id === pcId) || { estado: 'disponible' };
            const estadoEquipo = eq.estado;

            // determine display values based on session and equipment state
            let statusText = 'LIBRE';
            let statusColor = '#2ecc71';
            if (isActive) {
                statusText = session.isCountdown ? 'PREPAGO' : 'EN USO';
                statusColor = '#e67e22';
            } else if (estadoEquipo === 'mantenimiento') {
                statusText = 'MANTENIMIENTO';
                statusColor = '#e74c3c';
            }

            const card = document.createElement('div');
            card.className = `pc-card ${isActive ? 'active' : ''} ${session?.isCountdown ? 'countdown-mode' : ''} ${estadoEquipo}`;
            card.id = `card-${pcId}`;
            card.innerHTML = `
                <div class="pc-header">
                    <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                    <span class="pc-name">${pcId}</span>
                    <span class="pc-rate" style="font-size:0.8rem; color:#555; margin-left:8px;">${CyberManager.utils.formatMoney(eq.tarifa || this.costPerHour)}/h</span>
                    <span class="status-badge" style="background:${statusColor}">
                        ${statusText}
                    </span>
                </div>
                <div class="pc-body">
                    <div class="timer-container">
                        <span class="timer-label">${session?.isCountdown ? 'RESTANTE' : 'TIEMPO'}</span>
                        <div class="timer-display" id="timer-${pcId}">00:00:00</div>
                    </div>
                    <div class="cost-container">
                        <span class="cost-label">${session?.isCountdown ? 'PAGADO' : 'POR COBRAR'}</span>
                        <div class="cost-preview" id="cost-${pcId}">${CyberManager.utils.formatMoney(0)}</div>
                    </div>
                </div>
                <div class="pc-footer">
                    ${!isActive && estadoEquipo !== 'mantenimiento' ? 
                        `<button class="btn-action start" onclick="startSession('${pcId}')">
                            <i class="fas fa-play"></i> INICIAR
                         </button>` : !isActive && estadoEquipo === 'mantenimiento' ?
                        `<button class="btn-action" disabled>
                            <i class="fas fa-wrench"></i> MANTENIMIENTO
                         </button>` : 
                        `<button class="btn-action stop" onclick="stopSession('${pcId}')">
                            <i class="fas fa-hand-holding-usd"></i> COBRAR
                         </button>`
                    }
                </div>
            `;
            grid.appendChild(card);
        }
    },

    start: function(pcId) {
        // primero verificar estado del equipo en el inventario y obtener tarifa
        let tarifaEquipo = this.costPerHour;
        try {
            const equipos = JSON.parse(localStorage.getItem('cyberEquipos') || '[]');
            const eq = equipos.find(e => e.id === pcId);
            if (eq) {
                if (eq.estado === 'mantenimiento') {
                    CyberManager.ui.showMessage('error', `No se puede iniciar sesión: ${pcId} está en mantenimiento.`);
                    return;
                }
                if (eq.estado === 'ocupado') {
                    CyberManager.ui.showMessage('error', `El equipo ${pcId} ya figura como ocupado en inventario.`);
                    return;
                }
                if (eq.tarifa !== undefined) {
                    tarifaEquipo = parseFloat(eq.tarifa) || tarifaEquipo;
                }
            }
        } catch (e) { /* ignorar error de parsing */ }

        const clientName = prompt(`Nombre del cliente para ${pcId}:`, "Cliente General");
        if (clientName === null) return;

        const mode = confirm("¿Es tiempo PREPAGADO (Tiempo Fijo)?\n\nOK = Tiempo Fijo (Prepago)\nCancelar = Tiempo Libre");
        
        let limitMs = 0;
        let isCountdown = false;

        if (mode) {
            const minutes = parseInt(prompt("¿Cuántos minutos va a pagar?", "60"));
            if (isNaN(minutes) || minutes <= 0) return;
            limitMs = minutes * 60000;
            isCountdown = true;
        }

        this.sessions[pcId] = {
            startTime: Date.now(),
            limitMs: limitMs,
            isCountdown: isCountdown,
            client: clientName,
            active: true,
            rate: tarifaEquipo // tarifa/hora para esta sesión
        };

        // marcar equipo como ocupado en el inventario
        try {
            const equipos = JSON.parse(localStorage.getItem('cyberEquipos') || '[]');
            const idx = equipos.findIndex(e => e.id === pcId);
            if (idx !== -1) {
                equipos[idx].estado = 'ocupado';
                localStorage.setItem('cyberEquipos', JSON.stringify(equipos));
            }
        } catch (e) { console.warn('no se pudo actualizar estado de equipo:', e); }
        // si la página de equipos está abierta, renderizar de nuevo
        if (typeof renderEquipos === 'function') renderEquipos();

        // incrementar el contador de clientes del día
        try {
            const clientesToday = parseInt(localStorage.getItem('clientes_hoy') || '0');
            localStorage.setItem('clientes_hoy', (clientesToday + 1).toString());
        } catch (e) { console.warn('no se pudo actualizar contador de clientes:', e); }

        this.saveSessions();
        this.renderPCGrid();
        this.updateStats();
        CyberManager.ui.showMessage('success', `Sesión iniciada en ${pcId}`);
    },

    stop: function(pcId) {
        const session = this.sessions[pcId];
        if (!session) return;

        const elapsedMs = Date.now() - session.startTime;
        let finalCost = 0;
        const rate = session.rate || this.costPerHour;

        if (session.isCountdown) {
            finalCost = (session.limitMs / 3600000) * rate;
        } else {
            finalCost = (elapsedMs / 3600000) * rate;
        }
        
        const confirmMsg = `¿Cobrar ${CyberManager.utils.formatMoney(finalCost)} y liberar el equipo ${pcId}?`;

        if (confirm(confirmMsg)) {
            // 1. Sumar al ingreso total del día
            this.totalCollected += finalCost;
            
            // 2. Eliminar sesión
            delete this.sessions[pcId];

            // también liberar equipo en inventario
            try {
                const equipos = JSON.parse(localStorage.getItem('cyberEquipos') || '[]');
                const idx = equipos.findIndex(e => e.id === pcId);
                if (idx !== -1) {
                    equipos[idx].estado = 'disponible';
                    localStorage.setItem('cyberEquipos', JSON.stringify(equipos));
                }
            } catch (e) { console.warn('no se pudo liberar equipo:', e); }
            if (typeof renderEquipos === 'function') renderEquipos();
            
            // 3. Persistir y Refrescar
            this.saveSessions();
            this.renderPCGrid();
            this.updateStats();
            
            CyberManager.ui.showMessage('success', `Venta registrada: +${CyberManager.utils.formatMoney(finalCost)}`);
        }
    },

    startGlobalTimer: function() {
        setInterval(() => {
            let currentEstimatedRevenue = 0;

            for (const pcId in this.sessions) {
                const session = this.sessions[pcId];
                const diff = Date.now() - session.startTime;
                
                const timerEl = document.getElementById(`timer-${pcId}`);
                const costEl = document.getElementById(`cost-${pcId}`);
                
                let sessionCost = 0;
                const rate = session.rate || this.costPerHour;

                if (session.isCountdown) {
                    const remaining = session.limitMs - diff;
                    sessionCost = (session.limitMs / 3600000) * rate;
                    if (timerEl) {
                        timerEl.textContent = this.formatTime(Math.max(0, remaining));
                        if (remaining <= 0) timerEl.classList.add('timer-finished');
                    }
                } else {
                    sessionCost = (diff / 3600000) * rate;
                    if (timerEl) timerEl.textContent = this.formatTime(diff);
                }

                if (costEl) costEl.textContent = CyberManager.utils.formatMoney(sessionCost);
                currentEstimatedRevenue += sessionCost;
            }

            // Actualizar el "Ingreso Estimado" en tiempo real en la tarjeta superior
            const pendingRevenueEl = document.getElementById('pendingRevenue');
            if (pendingRevenueEl) {
                pendingRevenueEl.textContent = CyberManager.utils.formatMoney(this.totalCollected + currentEstimatedRevenue);
            }
        }, 1000);
    },

    formatTime: function(ms) {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateStats: function() {
        const activeCount = Object.keys(this.sessions).length;
        
        // Actualizar Badge de la barra lateral
        const badge = document.getElementById('activeCountBadge');
        if (badge) badge.textContent = activeCount;

        // Actualizar texto en la tarjeta de estadísticas ("X/20 Equipos")
        const activeText = document.getElementById('activeCountText');
        if (activeText) activeText.textContent = `${activeCount}/${this.totalPCs} Equipos en uso`;

        // Actualizar el acumulado histórico en la UI
        const pendingRevenueEl = document.getElementById('pendingRevenue');
        if (pendingRevenueEl) {
            pendingRevenueEl.textContent = CyberManager.utils.formatMoney(this.totalCollected);
        }
    }
};

// Exportar funciones de sesiones al scope global para usar en onclick
window.startSession = (pcId) => CyberManager.sesiones.start(pcId);
window.stopSession = (pcId) => CyberManager.sesiones.stop(pcId);