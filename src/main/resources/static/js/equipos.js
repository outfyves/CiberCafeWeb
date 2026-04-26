// js/equipos.js - Gestión dinámica de inventario de hardware conectada a Spring Boot

const API_EQUIPOS = '/api/equipos';
let equipos = [];

document.addEventListener('DOMContentLoaded', function() {
    initEquipmentPage();
});

async function initEquipmentPage() {
    await cargarEquipos();
    setInterval(cargarEquipos, 15000);

    const addEquipmentBtn = document.getElementById('addEquipmentBtn');
    const modal = document.getElementById('equipoModal');
    const equipmentForm = document.getElementById('equipoForm');
    
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', () => {
            delete modal.dataset.editId;
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-desktop"></i> Nuevo Equipo';
            equipmentForm.reset();
            modal.classList.add('show');
        });
    }

    document.querySelectorAll('.close-modal, #cancelModal').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('show'));
    });

    if (equipmentForm) {
        equipmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarEquipo();
        });
    }

    // Filtros
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyRealFilters();
        });
    }

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('filterStatus').value = '';
            document.getElementById('filterType').value = '';
            renderEquipos(equipos);
        });
    }

    initViewToggle();
}

async function cargarEquipos() {
    try {
        const response = await fetch(API_EQUIPOS);
        equipos = await response.json();
        renderEquipos();
    } catch (error) {
        console.error('Error al cargar equipos:', error);
    }
}

async function guardarEquipo() {
    const modal = document.getElementById('equipoModal');
    const id = modal.dataset.editId;
    
    const equipoData = {
        nombre: document.getElementById('nombreEquipo').value,
        tipo: document.getElementById('tipoEquipo').value,
        estado: document.getElementById('estadoEquipo').value,
        precioHora: parseFloat(document.getElementById('tarifaEquipo').value) || 0
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_EQUIPOS}/${id}` : API_EQUIPOS;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipoData)
        });

        if (response.ok) {
            await cargarEquipos();
            modal.classList.remove('show');
            CyberManager.showMessage('success', id ? 'Equipo actualizado' : 'Equipo agregado');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        CyberManager.showMessage('error', 'Error al conectar con el servidor');
    }
}

function applyRealFilters() {
    const status = document.getElementById('filterStatus').value;
    const type = document.getElementById('filterType').value;

    const filtrados = equipos.filter(eq => {
        const matchStatus = status === '' || eq.estado === status;
        const matchType = type === '' || eq.tipo.includes(type);
        return matchStatus && matchType;
    });

    renderEquipos(filtrados);
}

window.editarEquipo = function(id) {
    const equipo = equipos.find(e => e.id == id);
    if (!equipo) return;

    const modal = document.getElementById('equipoModal');
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Equipo';
    
    document.getElementById('nombreEquipo').value = equipo.nombre;
    document.getElementById('tipoEquipo').value = equipo.tipo || '';
    document.getElementById('estadoEquipo').value = equipo.estado;
    document.getElementById('tarifaEquipo').value = equipo.precioHora || '';

    modal.dataset.editId = id;
    modal.classList.add('show');
};

function renderEquipos(data = equipos) {
    const grid = document.getElementById('equiposGrid');
    if (grid) {
        grid.innerHTML = data.map(e => `
            <div class="equipo-card ${e.estado.toLowerCase()}">
                <div class="equipo-header">
                    <div class="equipo-info">
                        <h3>${e.nombre}</h3>
                        <div class="equipo-id">ID: ${e.id}</div>
                    </div>
                    <div class="equipo-status ${e.estado.toLowerCase()}">${e.estado}</div>
                </div>
                <div class="equipo-details">
                    <div class="detail-row"><span class="detail-label">Tipo:</span> <span class="detail-value">${e.tipo}</span></div>
                    <div class="detail-row"><span class="detail-label">Tarifa:</span> <span class="detail-value">$${(e.precioHora || 0).toFixed(2)}/h</span></div>
                </div>
                <div class="equipo-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editarEquipo(${e.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipo(${e.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    updateStats(data);
}

function updateStats(data = equipos) {
    const total = data.length;
    const disp = data.filter(e => e.estado === 'DISPONIBLE').length;
    const ocup = data.filter(e => e.estado === 'OCUPADO').length;
    const mant = data.filter(e => e.estado === 'MANTENIMIENTO').length;

    document.getElementById('totalEquipos').textContent = total;
    document.getElementById('equiposDisponibles').textContent = disp;
    document.getElementById('equiposOcupados').textContent = ocup;
    document.getElementById('equiposMantenimiento').textContent = mant;

    const updateBar = (selector, val, t) => {
        const bar = document.querySelector(selector);
        if (bar) bar.style.width = t > 0 ? `${(val/t)*100}%` : '0%';
    };

    updateBar('.stat-equipo.total .usage-fill', total, total);
    updateBar('.stat-equipo.disponible .usage-fill', disp, total);
    updateBar('.stat-equipo.ocupado .usage-fill', ocup, total);
    updateBar('.stat-equipo.mantenimiento .usage-fill', mant, total);
}

function initViewToggle() {
    const vg = document.getElementById('viewGrid');
    const vl = document.getElementById('viewList');
    const grid = document.getElementById('equiposGrid');
    const list = document.getElementById('equiposList');

    if (vg && vl) {
        vg.onclick = () => { vg.classList.add('active'); vl.classList.remove('active'); grid.style.display='grid'; list.style.display='none'; };
        vl.onclick = () => { vl.classList.add('active'); vg.classList.remove('active'); grid.style.display='none'; list.style.display='block'; };
    }
}
