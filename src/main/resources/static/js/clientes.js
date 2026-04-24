// js/clientes.js - Gestión dinámica de clientes

// 1. "Base de datos" simulada de clientes
let clientes = [
    { id: 'CLI-001', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0101', tipo: 'frecuente', estado: 'activo', deuda: 0.00, registro: '2023-10-15' },
    { id: 'CLI-002', nombre: 'María García', email: 'maria@email.com', telefono: '555-0202', tipo: 'estudiante', estado: 'moroso', deuda: 45.50, registro: '2023-11-02' },
    { id: 'CLI-003', nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-0303', tipo: 'ocasional', estado: 'inactivo', deuda: 0.00, registro: '2023-08-20' },
    { id: 'CLI-004', nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-0404', tipo: 'frecuente', estado: 'activo', deuda: 12.00, registro: '2023-12-01' }
];

document.addEventListener('DOMContentLoaded', function() {
    initClientesPage();
});

function initClientesPage() {
    renderClientes(); // Dibujar clientes al iniciar
    updateClienteStats();
    
    initViewToggleClientes();
    initClienteModal();
    initFiltersClientes();
    // La búsqueda se integra aquí
    const searchInput = document.querySelector('.search-container input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => filterClientesByName(e.target.value));
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
        // Render en Grid (Tarjetas)
        const card = document.createElement('div');
        card.className = `cliente-card ${cliente.estado}`;
        card.innerHTML = `
            <div class="cliente-header">
                <div class="cliente-avatar"><i class="fas fa-user"></i></div>
                <div class="cliente-info-main">
                    <h3>${cliente.nombre}</h3>
                    <span class="cliente-id">${cliente.id}</span>
                </div>
                <span class="cliente-status ${cliente.estado}">${cliente.estado.toUpperCase()}</span>
            </div>
            <div class="cliente-details">
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${cliente.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">${cliente.tipo}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Deuda:</span>
                    <span class="detail-value" style="${cliente.deuda > 0 ? 'color: var(--danger-color); font-weight: bold' : ''}">
                        $${cliente.deuda.toFixed(2)}
                    </span>
                </div>
            </div>
            <div class="cliente-actions">
                <button class="btn-icon btn-editar-cliente" title="Editar" onclick="editarCliente('${cliente.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-historial" title="Historial"><i class="fas fa-history"></i></button>
                ${cliente.deuda > 0 ? `<button class="btn-icon btn-cobrar" title="Cobrar Deuda" onclick="cobrarDeuda('${cliente.id}')"><i class="fas fa-dollar-sign"></i></button>` : ''}
                <button class="btn-icon btn-eliminar-cliente" title="Eliminar" onclick="eliminarCliente('${cliente.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);

        // Render en Lista (Tabla)
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td><strong>${cliente.nombre}</strong></td>
            <td>${cliente.email}</td>
            <td><span class="badge-${cliente.tipo}">${cliente.tipo}</span></td>
            <td><span class="status-indicator ${cliente.estado}"></span> ${cliente.estado}</td>
            <td class="${cliente.deuda > 0 ? 'text-danger' : ''}">$${cliente.deuda.toFixed(2)}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editarCliente('${cliente.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="eliminarCliente('${cliente.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 3. Lógica de Cobro Relacionada
window.cobrarDeuda = function(id) {
    const cliente = clientes.find(c => c.id === id);
    if (cliente && CyberManager.confirmAction(`¿Confirmar cobro de $${cliente.deuda} a ${cliente.nombre}?`)) {
        cliente.deuda = 0;
        cliente.estado = 'activo';
        CyberManager.showMessage('success', 'Pago procesado y cuenta saldada');
        renderClientes();
        updateClienteStats();
    }
};

// 4. Búsqueda y Filtros Reales
function filterClientesByName(query) {
    const filtrados = clientes.filter(c => 
        c.nombre.toLowerCase().includes(query.toLowerCase()) || 
        c.id.toLowerCase().includes(query.toLowerCase())
    );
    renderClientes(filtrados);
}

function initFiltersClientes() {
    const applyBtn = document.getElementById('applyFiltersClientes');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const estado = document.getElementById('filterEstado').value;
            const tipo = document.getElementById('filterTipo').value;

            const filtrados = clientes.filter(c => {
                return (!estado || c.estado === estado) && (!tipo || c.tipo === tipo);
            });

            renderClientes(filtrados);
            CyberManager.showMessage('info', `Se encontraron ${filtrados.length} clientes`);
        });
    }
}

// 5. Estadísticas calculadas desde los datos
function updateClienteStats() {
    const stats = {
        total: clientes.length,
        activos: clientes.filter(c => c.estado === 'activo').length,
        inactivos: clientes.filter(c => c.estado === 'inactivo').length,
        morosos: clientes.filter(c => c.estado === 'moroso').length
    };

    document.querySelector('.stat-cliente.total .stat-value').textContent = stats.total;
    document.querySelector('.stat-cliente.activos .stat-value').textContent = stats.activos;
    document.querySelector('.stat-cliente.inactivos .stat-value').textContent = stats.inactivos;
    document.querySelector('.stat-cliente.morosos .stat-value').textContent = stats.morosos;
    
    // Actualizar badge del nav de clientes
    const navBadge = document.getElementById('navClientesBadge');
    if (navBadge) {
        navBadge.textContent = stats.total;
    }
    
    // Actualizar tabla summary
    const totalClientesEl = document.getElementById('totalClientesTable');
    if (totalClientesEl) {
        totalClientesEl.textContent = `(${stats.total})`;
    }
    
    // Actualizar summary badges
    const activosCountEl = document.getElementById('activosCount');
    const inactivosCountEl = document.getElementById('inactivosCount');
    const morososCountEl = document.getElementById('morososCount');
    
    if (activosCountEl) activosCountEl.textContent = `${stats.activos} Activos`;
    if (inactivosCountEl) inactivosCountEl.textContent = `${stats.inactivos} Inactivos`;
    if (morososCountEl) morososCountEl.textContent = `${stats.morosos} Morosos`;
}

// 6. Eliminar Cliente del "Sistema"
window.eliminarCliente = function(id) {
    if (CyberManager.confirmAction('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
        clientes = clientes.filter(c => c.id !== id);
        renderClientes();
        updateClienteStats();
        CyberManager.showMessage('success', 'Cliente eliminado del sistema');
    }
};

// 7. Editar Cliente
window.editarCliente = function(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    const modal = document.getElementById('clienteModal');
    const form = document.getElementById('clienteForm');
    const modalTitle = modal.querySelector('.modal-header h3');

    // Cambiar título a Editar
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Cliente';

    // Llenar el formulario con los datos del cliente
    document.getElementById('nombreCliente').value = cliente.nombre;
    document.getElementById('emailCliente').value = cliente.email;
    document.getElementById('telefonoCliente').value = cliente.telefono;
    document.getElementById('tipoCliente').value = cliente.tipo;
    document.getElementById('estadoCliente').value = cliente.estado;

    // Mostrar modal
    modal.classList.add('show');

    // Cambiar evento del formulario a actualización
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        cliente.nombre = document.getElementById('nombreCliente').value;
        cliente.email = document.getElementById('emailCliente').value;
        cliente.telefono = document.getElementById('telefonoCliente').value;
        cliente.tipo = document.getElementById('tipoCliente').value;
        cliente.estado = document.getElementById('estadoCliente').value;

        renderClientes();
        updateClienteStats();
        
        modal.classList.remove('show');
        newForm.reset();
        
        // Restaurar título original
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Registro de Nuevo Cliente';
        
        CyberManager.showMessage('success', 'Cliente actualizado correctamente');
    });
};

// Guardar nuevo cliente (Conexión con el formulario)
function initClienteModal() {
    const modal = document.getElementById('clienteModal');
    const form = document.getElementById('clienteForm');
    const addBtn = document.getElementById('addClienteBtn');
    const closeBtn = document.getElementById('closeClienteModal');
    const cancelBtn = document.getElementById('cancelClienteModal');

    // Abrir modal para nuevo cliente
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const modalTitle = modal.querySelector('.modal-header h3');
            modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Registro de Nuevo Cliente';
            form.reset();
            modal.classList.add('show');
        });
    }

    // Cerrar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            form.reset();
        });
    }

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nuevoCliente = {
                id: `CLI-${String(clientes.length + 1).padStart(3, '0')}`,
                nombre: document.getElementById('nombreCliente').value,
                email: document.getElementById('emailCliente').value,
                telefono: document.getElementById('telefonoCliente').value,
                tipo: document.getElementById('tipoCliente').value,
                estado: document.getElementById('estadoCliente').value,
                deuda: 0.00,
                registro: new Date().toISOString().split('T')[0]
            };

            clientes.push(nuevoCliente);
            renderClientes();
            updateClienteStats();
            
            modal.classList.remove('show');
            form.reset();
            CyberManager.showMessage('success', 'Nuevo cliente registrado con éxito');
        });
    }
}

// 8. Vista de toggle entre Grid y Lista
function initViewToggleClientes() {
    const gridBtn = document.getElementById('viewGridClientes');
    const listBtn = document.getElementById('viewListClientes');
    const gridView = document.getElementById('clientesGrid');
    const listView = document.getElementById('clientesList');

    if (gridBtn && listBtn && gridView && listView) {
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