// js/equipos.js - Gestión dinámica de inventario de hardware

document.addEventListener('DOMContentLoaded', function() {
    initEquipmentPage();
});

// Clave para el localStorage
const EQUIPOS_STORAGE_KEY = 'cyberEquipos';

// Datos iniciales por si el storage está vacío
const initialEquipos = [
    { id: 'PC-01', nombre: 'Gaming Master 1', tipo: 'pc-gaming', zona: 'zona-a', estado: 'disponible', tarifa: 5.00, especificaciones: 'RTX 3060, 16GB RAM' },
    { id: 'PC-02', nombre: 'Gaming Master 2', tipo: 'pc-gaming', zona: 'zona-a', estado: 'ocupado', tarifa: 5.00, especificaciones: 'RTX 3060, 16GB RAM' },
    { id: 'PC-03', nombre: 'Oficina Pro 1', tipo: 'pc-oficina', zona: 'zona-b', estado: 'mantenimiento', tarifa: 2.00, especificaciones: 'i5, 8GB RAM' }
];

function initEquipmentPage() {
    // 1. Cargar y renderizar datos
    renderEquipos();
    // refresca continuamente en caso de que sesiones modifiquen el estado
    setInterval(renderEquipos, 5000); // cada 5 segundos

    // 2. Referencias a elementos del DOM
    const addEquipmentBtn = document.getElementById('addEquipmentBtn');
    const modal = document.getElementById('equipoModal');
    const equipmentForm = document.getElementById('equipoForm');
    const searchInput = document.querySelector('.search-container input');
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const filterLocation = document.getElementById('filterLocation');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // 3. Abrir Modal para Nuevo Equipo
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', () => {
            const modalTitle = modal.querySelector('.modal-header h3');
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-desktop"></i> Nuevo Equipo';
            equipmentForm.reset();
            document.getElementById('codigoEquipo').disabled = false;
            // tarifa input quedará vacía tras reset; nada más que hacer
            modal.classList.add('show');
        });
    }
    // 4. Cerrar Modales
    document.querySelectorAll('.close-modal, #cancelModal').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('show'));
    });

    // 5. Guardar / Editar Equipo
    if (equipmentForm) {
        equipmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEquipo();
        });
    }

    // 6. Buscador en tiempo real
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEquipos(e.target.value, filterStatus.value);
        });
    }

    // 7. Filtro por estado
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            renderEquipos(searchInput?.value || '', filterStatus.value);
        });
    }

    // 8. Aplicar filtros
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            renderEquipos(searchInput?.value || '', filterStatus?.value || '');
        });
    }

    // 9. Limpiar filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterStatus) filterStatus.value = '';
            if (filterType) filterType.value = '';
            if (filterLocation) filterLocation.value = '';
            renderEquipos();
        });
    }

    // 10. Toggle de vista (Grid/Lista)
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

// --- FUNCIONES DE LÓGICA ---

function getEquipos() {
    const stored = localStorage.getItem(EQUIPOS_STORAGE_KEY);
    if (stored) {
        const list = JSON.parse(stored);
        // asegurar que cada elemento tenga tarifa (compatible con datos antiguos)
        return list.map(e => ({ ...e, tarifa: e.tarifa !== undefined ? parseFloat(e.tarifa) : 0 }));
    }
    // generar lista por defecto de 20 equipos si no hay storage
    const defaultCount = 20;
    const list = [];
    for (let i = 1; i <= defaultCount; i++) {
        list.push({
            id: `PC-${i.toString().padStart(2, '0')}`,
            nombre: `Equipo ${i}`,
            tipo: 'pc-estandar',
            zona: 'zona-a',
            estado: 'disponible',
            tarifa: 0,
            especificaciones: ''
        });
    }
    return list;
}

function saveEquipo() {
    const equipos = getEquipos();
    const id = document.getElementById('codigoEquipo').value.trim();
    
    const newEquipo = {
        id: id,
        nombre: document.getElementById('nombreEquipo').value,
        tipo: document.getElementById('tipoEquipo').value,
        zona: document.getElementById('ubicacionEquipo').value,
        estado: document.getElementById('estadoEquipo').value,
        tarifa: parseFloat(document.getElementById('tarifaEquipo').value) || 0,
        especificaciones: document.getElementById('especificaciones').value,
        observaciones: document.getElementById('observaciones').value
    };    

    const index = equipos.findIndex(e => e.id === id);

    if (index !== -1) {
        // Editar existente
        equipos[index] = newEquipo;
        CyberManager.showMessage('success', `Equipo ${id} actualizado`);
    } else {
        // Agregar nuevo
        equipos.push(newEquipo);
        CyberManager.showMessage('success', 'Equipo agregado correctamente');
    }

    localStorage.setItem(EQUIPOS_STORAGE_KEY, JSON.stringify(equipos));
    document.getElementById('equipoModal').classList.remove('show');
    renderEquipos();
}

function deleteEquipo(id) {
    if (CyberManager.confirmAction(`¿Seguro que deseas eliminar el equipo ${id}?`)) {
        const equipos = getEquipos().filter(e => e.id !== id);
        localStorage.setItem(EQUIPOS_STORAGE_KEY, JSON.stringify(equipos));
        renderEquipos();
        CyberManager.showMessage('success', 'Equipo eliminado');
    }
}

function toggleStatus(id) {
    const equipos = getEquipos();
    const index = equipos.findIndex(e => e.id === id);
    if (index !== -1) {
        const states = ['disponible', 'ocupado', 'mantenimiento'];
        let currentIdx = states.indexOf(equipos[index].estado);
        equipos[index].estado = states[(currentIdx + 1) % states.length];
        
        localStorage.setItem(EQUIPOS_STORAGE_KEY, JSON.stringify(equipos));
        renderEquipos();
    }
}

function renderEquipos(search = '', filter = 'todos') {
    let equipos = getEquipos();

    // Aplicar Filtros
    equipos = equipos.filter(e => {
        const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) || 
                            e.id.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'todos' || e.estado === filter;
        return matchSearch && matchFilter;
    });

    // Renderizar Grid
    const grid = document.getElementById('equiposGrid');
    if (grid) {
        grid.innerHTML = equipos.map(e => `
            <div class="equipo-card ${e.estado}">
                <div class="equipo-header">
                    <div class="equipo-info">
                        <h3>${e.nombre}</h3>
                        <div class="equipo-id">${e.id}</div>
                    </div>
                    <div class="equipo-status ${e.estado}">${e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}</div>
                </div>
                
                <div class="equipo-details">
                    <div class="detail-row">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">${e.tipo.replace(/-/g, ' ').toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Zona:</span>
                        <span class="detail-value">${e.zona}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tarifa:</span>
                        <span class="detail-value">${CyberManager.utils.formatMoney(e.tarifa || 0)}</span>
                    </div>
                </div>
                
                <div class="equipo-specs">
                    <strong>Especificaciones:</strong> ${e.especificaciones}
                </div>
                
                <div class="equipo-actions">
                    ${e.estado === 'disponible' ? `
                        <button class="btn btn-primary btn-sm" onclick="toggleStatus('${e.id}')">
                            <i class="fas fa-play"></i> Activar
                        </button>
                    ` : e.estado === 'ocupado' ? `
                        <button class="btn btn-warning btn-sm" onclick="toggleStatus('${e.id}')">
                            <i class="fas fa-stop"></i> Detener
                        </button>
                    ` : `
                        <button class="btn btn-success btn-sm" onclick="toggleStatus('${e.id}')">
                            <i class="fas fa-check"></i> Reparado
                        </button>
                    `}
                    <button class="btn btn-secondary btn-sm" onclick="editarEquipo('${e.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipo('${e.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Renderizar Tabla
    const tableBody = document.getElementById('equiposTableBody');
    if (tableBody) {
        tableBody.innerHTML = equipos.map(e => `
            <tr>
                <td><strong>${e.id}</strong></td>
                <td>${e.nombre}</td>
                <td><span class="badge badge-${e.tipo}">${e.tipo.replace(/-/g, ' ')}</span></td>
                <td>${e.especificaciones}</td>
                <td><span class="status ${e.estado}">${e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}</span></td>
                <td>-</td>
                <td>-</td>
                <td>${CyberManager.utils.formatMoney(e.tarifa || 0)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editarEquipo('${e.id}')"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipo('${e.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // Actualizar estadísticas
    const allEquipos = getEquipos();
    const stats = {
        total: allEquipos.length,
        disponibles: allEquipos.filter(e => e.estado === 'disponible').length,
        ocupados: allEquipos.filter(e => e.estado === 'ocupado').length,
        mantenimiento: allEquipos.filter(e => e.estado === 'mantenimiento').length
    };

    const totalEl = document.getElementById('totalEquipos');
    const dispEl = document.getElementById('equiposDisponibles');
    const ocupEl = document.getElementById('equiposOcupados');
    const mantEl = document.getElementById('equiposMantenimiento');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (dispEl) dispEl.textContent = stats.disponibles;
    if (ocupEl) ocupEl.textContent = stats.ocupados;
    if (mantEl) mantEl.textContent = stats.mantenimiento;

    // actualizar badge del nav lateral
    const navBadge = document.getElementById('navEquiposBadge');
    if (navBadge) navBadge.textContent = stats.total;

    // Actualizar resumen de tabla
    const eqCountEl = document.getElementById('equiposCount');
    const disposCountEl = document.getElementById('disposCount');
    const ocupCountEl = document.getElementById('ocupCount');
    const mantCountEl = document.getElementById('mantCount');
    
    if (eqCountEl) eqCountEl.textContent = `(${stats.total})`;
    if (disposCountEl) disposCountEl.textContent = `${stats.disponibles} Disponibles`;
    if (ocupCountEl) ocupCountEl.textContent = `${stats.ocupados} Ocupados`;
    if (mantCountEl) mantCountEl.textContent = `${stats.mantenimiento} En mantenimiento`;
}

function editEquipo(id) {
    const equipo = getEquipos().find(e => e.id === id);
    if (!equipo) return;

    const modal = document.getElementById('equipoModal');
    const modalTitle = modal.querySelector('.modal-header h3');
    const form = document.getElementById('equipoForm');
    
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Equipo';
    
    document.getElementById('codigoEquipo').value = equipo.id;
    document.getElementById('codigoEquipo').disabled = true; // No permitir cambiar ID en edición
    document.getElementById('nombreEquipo').value = equipo.nombre;
    document.getElementById('tipoEquipo').value = equipo.tipo;
    document.getElementById('ubicacionEquipo').value = equipo.zona;
    document.getElementById('estadoEquipo').value = equipo.estado;
    document.getElementById('tarifaEquipo').value = equipo.tarifa || '';
    document.getElementById('especificaciones').value = equipo.especificaciones;
    document.getElementById('observaciones').value = equipo.observaciones || '';

    modal.classList.add('show');
}

// Alias para consistencia con el resto del proyecto
window.editarEquipo = editEquipo;
window.toggleStatus = toggleStatus;
window.deleteEquipo = deleteEquipo;