// js/equipos.js - Gestión dinámica de inventario de hardware conectada a Spring Boot

const API_EQUIPOS = '/api/equipos';
let equipos = [];

document.addEventListener('DOMContentLoaded', function() {
    initEquipmentPage();
});

async function initEquipmentPage() {
    // 1. Cargar y renderizar datos reales
    await cargarEquipos();
    
    // refresca continuamente
    setInterval(cargarEquipos, 10000); // cada 10 segundos para no saturar

    // 2. Referencias a elementos del DOM
    const addEquipmentBtn = document.getElementById('addEquipmentBtn');
    const modal = document.getElementById('equipoModal');
    const equipmentForm = document.getElementById('equipoForm');
    
    // 3. Abrir Modal para Nuevo Equipo
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', () => {
            delete modal.dataset.editId;
            const modalTitle = modal.querySelector('.modal-header h3');
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-desktop"></i> Nuevo Equipo';
            equipmentForm.reset();
            modal.classList.add('show');
        });
    }

    // 4. Cerrar Modales
    document.querySelectorAll('.close-modal, #cancelModal').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('show'));
    });

    // 5. Guardar / Editar Equipo
    if (equipmentForm) {
        equipmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarEquipo();
        });
    }

    // Toggle de vista (Grid/Lista)
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

window.deleteEquipo = async function(id) {
    if (confirm(`¿Seguro que deseas eliminar el equipo con ID ${id}?`)) {
        try {
            const response = await fetch(`${API_EQUIPOS}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await cargarEquipos();
                CyberManager.showMessage('success', 'Equipo eliminado');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    }
};

window.editarEquipo = function(id) {
    const equipo = equipos.find(e => e.id == id);
    if (!equipo) return;

    const modal = document.getElementById('equipoModal');
    const modalTitle = modal.querySelector('.modal-header h3');
    
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Equipo';
    
    document.getElementById('nombreEquipo').value = equipo.nombre;
    document.getElementById('tipoEquipo').value = equipo.tipo;
    document.getElementById('estadoEquipo').value = equipo.estado;
    document.getElementById('tarifaEquipo').value = equipo.precioHora || '';

    modal.dataset.editId = id;
    modal.classList.add('show');
};

function renderEquipos() {
    // Renderizar Grid
    const grid = document.getElementById('equiposGrid');
    if (grid) {
        grid.innerHTML = equipos.map(e => `
            <div class="equipo-card ${e.estado.toLowerCase()}">
                <div class="equipo-header">
                    <div class="equipo-info">
                        <h3>${e.nombre}</h3>
                        <div class="equipo-id">ID: ${e.id}</div>
                    </div>
                    <div class="equipo-status ${e.estado.toLowerCase()}">${e.estado}</div>
                </div>
                
                <div class="equipo-details">
                    <div class="detail-row">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">${e.tipo.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tarifa:</span>
                        <span class="detail-value">$${(e.precioHora || 0).toFixed(2)} / hr</span>
                    </div>
                </div>
                
                <div class="equipo-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editarEquipo(${e.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipo(${e.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Actualizar estadísticas sencillas
    const totalEl = document.getElementById('totalEquipos');
    if (totalEl) totalEl.textContent = equipos.length;
}

function initViewToggle() {
    const viewGridBtn = document.getElementById('viewGrid');
    const viewListBtn = document.getElementById('viewList');
    const grid = document.getElementById('equiposGrid');
    const list = document.getElementById('equiposList');

    if (viewGridBtn && viewListBtn) {
        viewGridBtn.addEventListener('click', () => {
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            if (grid) grid.style.display = 'grid';
            if (list) list.style.display = 'none';
        });

        viewListBtn.addEventListener('click', () => {
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            if (grid) grid.style.display = 'none';
            if (list) list.style.display = 'block';
        });
    }
}
