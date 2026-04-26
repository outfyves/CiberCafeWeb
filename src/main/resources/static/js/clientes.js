// js/clientes.js - Gestión dinámica de clientes conectada a Spring Boot API

const API_URL = '/api/clientes';
let clientes = [];

document.addEventListener('DOMContentLoaded', function() {
    initClientesPage();
});

async function initClientesPage() {
    await cargarClientes(); // Cargar desde la base de datos
    updateClienteStats();
    
    initViewToggleClientes();
    initClienteModal();
    initFiltersClientes();
    
    const searchInput = document.querySelector('.search-container input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => filterClientesByName(e.target.value));
    }
}

// 1. Cargar clientes desde la API
async function cargarClientes() {
    try {
        const response = await fetch(API_URL);
        clientes = await response.json();
        renderClientes();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        CyberManager.showMessage('error', 'No se pudo conectar con el servidor');
    }
}

// 2. Función para renderizar los clientes en el Grid y la Lista
function renderClientes(dataFiltrada = clientes) {
    const grid = document.getElementById('clientesGrid');
    const tableBody = document.querySelector('#clientesList tbody');
    
    if(!grid || !tableBody) return;

    grid.innerHTML = '';
    tableBody.innerHTML = '';

    dataFiltrada.forEach(cliente => {
        const estado = (cliente.estado || 'activo').toLowerCase();
        const card = document.createElement('div');
        card.className = `cliente-card ${estado}`;
        card.innerHTML = `
            <div class="cliente-header">
                <div class="cliente-avatar"><i class="fas fa-user"></i></div>
                <div class="cliente-info-main">
                    <h3>${cliente.nombre} ${cliente.apellido || ''}</h3>
                    <span class="cliente-id">ID: ${cliente.id}</span>
                </div>
                <span class="cliente-status ${estado}">${estado.toUpperCase()}</span>
            </div>
            <div class="cliente-details">
                <div class="detail-item">
                    <span class="detail-label">Cédula:</span>
                    <span class="detail-value">${cliente.cedula}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${cliente.correo}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teléfono:</span>
                    <span class="detail-value">${cliente.telefono}</span>
                </div>
            </div>
            <div class="cliente-actions">
                <button class="btn-icon btn-editar-cliente" title="Editar" onclick="editarCliente(${cliente.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-eliminar-cliente" title="Eliminar" onclick="eliminarCliente(${cliente.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td><strong>${cliente.nombre} ${cliente.apellido || ''}</strong></td>
            <td>${cliente.cedula}</td>
            <td>${cliente.correo}</td>
            <td>${cliente.telefono}</td>
            <td><span class="status-indicator ${estado}"></span> ${estado.charAt(0).toUpperCase() + estado.slice(1)}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editarCliente(${cliente.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="eliminarCliente(${cliente.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    updateClienteStats();
}

// 3. Búsqueda y Filtros
function filterClientesByName(query) {
    const filtrados = clientes.filter(c => 
        (c.nombre && c.nombre.toLowerCase().includes(query.toLowerCase())) || 
        (c.cedula && c.cedula.includes(query))
    );
    renderClientes(filtrados);
}

function initFiltersClientes() {
    const applyBtn = document.getElementById('applyFiltersClientes');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const estadoFiltro = document.getElementById('filterEstado').value.toLowerCase();
            const filtrados = estadoFiltro ? clientes.filter(c => (c.estado || 'activo').toLowerCase() === estadoFiltro) : clientes;
            renderClientes(filtrados);
        });
    }
}

// 4. Estadísticas
function updateClienteStats() {
    const stats = {
        total: clientes.length,
        activos: clientes.filter(c => (c.estado || 'activo').toLowerCase() === 'activo').length,
        inactivos: clientes.filter(c => (c.estado || 'activo').toLowerCase() === 'inactivo').length,
        morosos: clientes.filter(c => (c.estado || 'activo').toLowerCase() === 'moroso').length
    };

    const totalEl = document.querySelector('.stat-cliente.total .stat-value');
    if(totalEl) totalEl.textContent = stats.total;
    
    const activosEl = document.querySelector('.stat-cliente.activos .stat-value');
    if(activosEl) activosEl.textContent = stats.activos;

    const inactivosEl = document.querySelector('.stat-cliente.inactivos .stat-value');
    if(inactivosEl) inactivosEl.textContent = stats.inactivos;

    const morososEl = document.querySelector('.stat-cliente.morosos .stat-value');
    if(morososEl) morososEl.textContent = stats.morosos;

    // Badge lateral
    const badge = document.getElementById('navClientesBadge');
    if (badge) badge.textContent = stats.total;
}

// 5. Eliminar Cliente Real
window.eliminarCliente = async function(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await cargarClientes();
                CyberManager.showMessage('success', 'Cliente eliminado de la base de datos');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            CyberManager.showMessage('error', 'Error al eliminar cliente');
        }
    }
};

// 6. Editar y Guardar
window.editarCliente = function(id) {
    const cliente = clientes.find(c => c.id == id);
    if (!cliente) return;

    const modal = document.getElementById('clienteModal');
    const form = document.getElementById('clienteForm');
    
    // Llenar campos
    document.getElementById('cedulaCliente').value = cliente.cedula || '';
    document.getElementById('nombreCliente').value = cliente.nombre || '';
    document.getElementById('emailCliente').value = cliente.correo || '';
    document.getElementById('telefonoCliente').value = cliente.telefono || '';
    document.getElementById('estadoCliente').value = (cliente.estado || 'activo').toLowerCase();
    
    modal.dataset.editId = id;
    modal.classList.add('show');
};

function initClienteModal() {
    const modal = document.getElementById('clienteModal');
    const form = document.getElementById('clienteForm');
    const addBtn = document.getElementById('addClienteBtn');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            delete modal.dataset.editId;
            form.reset();
            modal.classList.add('show');
        });
    }

    // Botones de cierre
    document.querySelectorAll('#closeClienteModal, #cancelClienteModal').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('show'));
    });

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = modal.dataset.editId;
            const clienteData = {
                cedula: document.getElementById('cedulaCliente').value,
                nombre: document.getElementById('nombreCliente').value,
                apellido: "", // Campo opcional
                correo: document.getElementById('emailCliente').value,
                telefono: document.getElementById('telefonoCliente').value,
                estado: document.getElementById('estadoCliente').value
            };

            try {
                const method = id ? 'PUT' : 'POST';
                const url = id ? `${API_URL}/${id}` : API_URL;

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clienteData)
                });

                if (response.ok) {
                    await cargarClientes();
                    modal.classList.remove('show');
                    form.reset();
                    CyberManager.showMessage('success', id ? 'Cliente actualizado' : 'Cliente registrado');
                }
            } catch (error) {
                console.error('Error al guardar:', error);
                CyberManager.showMessage('error', 'Error al conectar con el servidor');
            }
        });
    }
}

function initViewToggleClientes() {
    const gridBtn = document.getElementById('viewGridClientes');
    const listBtn = document.getElementById('viewListClientes');
    const gridView = document.getElementById('clientesGrid');
    const listView = document.getElementById('clientesList');

    if (gridBtn && listBtn) {
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            gridView.style.display = 'grid';
            listView.style.display = 'none';
        });

        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            gridView.style.display = 'none';
            listView.style.display = 'block';
        });
    }
}
