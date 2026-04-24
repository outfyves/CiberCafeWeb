/**
 * dashboard.js - Panel Principal
 * Gestiona las estadísticas y sesiones recientes del dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

// Datos simulados de sesiones recientes
const recentSessions = [
    { cliente: 'Juan Pérez', equipo: 'PC-05', inicio: '14:30', duracion: '1:15 h', costo: '$3.75', estado: 'activa' },
    { cliente: 'María García', equipo: 'PC-12', inicio: '13:45', duracion: '2:30 h', costo: '$7.50', estado: 'finalizada' },
    { cliente: 'Carlos López', equipo: 'PC-08', inicio: '12:15', duracion: '0:45 h', costo: '$2.25', estado: 'activa' },
    { cliente: 'Ana Rodríguez', equipo: 'PC-03', inicio: '11:00', duracion: '1:30 h', costo: '$4.50', estado: 'finalizada' },
    { cliente: 'Pedro Sánchez', equipo: 'PC-15', inicio: '10:20', duracion: '3:10 h', costo: '$9.50', estado: 'activa' }
];

function initDashboard() {
    // 1. Renderizar tabla de sesiones recientes
    renderRecentSessions();
    
    // 2. Actualizar estadísticas del dashboard inmediatamente y en intervalos
    updateDashboardStats();
    setInterval(updateDashboardStats, 5000); // refrescar cada 5s para reflejar cambios en localStorage
    
    // 3. Inicializar gráficos si existe Chart.js
    if (typeof Chart !== 'undefined') {
        initRevenueChart();
    }
}

/**
 * Renderiza las sesiones recientes en la tabla
 */
function renderRecentSessions() {
    const tableBody = document.getElementById('recentSessionsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = recentSessions.map(session => `
        <tr>
            <td>${session.cliente}</td>
            <td>${session.equipo}</td>
            <td>${session.inicio}</td>
            <td>${session.duracion}</td>
            <td>${session.costo}</td>
            <td><span class="status ${session.estado}">${session.estado.charAt(0).toUpperCase() + session.estado.slice(1)}</span></td>
        </tr>
    `).join('');
}

/**
 * Actualiza las estadísticas del dashboard
 */
function updateDashboardStats() {
    // Leer ingresos reales desde localStorage (guardados por sesiones.js)
    const totalIngresos = (() => {
        try {
            const revenue = localStorage.getItem('total_revenue');
            return revenue ? parseFloat(revenue) : 0;
        } catch (e) { return 0; }
    })();
    
    const ingresoHoyEl = document.getElementById('ingresoHoy');
    if (ingresoHoyEl) {
        ingresoHoyEl.textContent = `$${totalIngresos.toFixed(2)}`;
    }
    
    // Obtener sesiones almacenadas (para datos reales)
    const storedSessions = (() => {
        try {
            const s = localStorage.getItem('active_sessions');
            return s ? JSON.parse(s) : {};
        } catch (e) { return {}; }
    })();

    const activeCount = Object.keys(storedSessions).length;
    const totalEquiposStored = (() => {
        try {
            const eq = localStorage.getItem('cyberEquipos');
            return eq ? JSON.parse(eq).length : null;
        } catch (e) { return null; }
    })();
    const availableEquipos = (() => {
        try {
            const eq = localStorage.getItem('cyberEquipos');
            if (!eq) return null;
            return JSON.parse(eq).filter(e => e.estado === 'disponible').length;
        } catch (e) { return null; }
    })();

    const sesionesActivasEl = document.getElementById('sesionesActivas');
    if (sesionesActivasEl) {
        // mostrar fracción si conocemos el total de equipos, de lo contrario solo el valor
        sesionesActivasEl.textContent = totalEquiposStored !== null ?
            `${activeCount}/${totalEquiposStored}` : `${activeCount}`;
    }
    // actualizar badge del menú lateral que indica sesiones activas
    const navBadge = document.getElementById('navSessionsBadge');
    if (navBadge) {
        navBadge.textContent = activeCount;
    }

    // Clientes únicos -- leer del contador de clientes de hoy desde localStorage
    const clientesToday = (() => {
        try {
            const count = localStorage.getItem('clientes_hoy');
            return count ? parseInt(count) : 0;
        } catch (e) { return 0; }
    })();
    
    const clientesHoyEl = document.getElementById('clientesHoy');
    if (clientesHoyEl) {
        clientesHoyEl.textContent = clientesToday;
    }

    const equiposDisponiblesEl = document.getElementById('equiposDisponibles');
    if (equiposDisponiblesEl) {
        equiposDisponiblesEl.textContent =
            availableEquipos !== null && totalEquiposStored !== null ?
            `${availableEquipos}/${totalEquiposStored}` :
            (availableEquipos !== null ? availableEquipos : '0');
    }
}

/**
 * Inicializa el gráfico de ingresos semanales
 */
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const chartData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Ingresos ($)',
            data: [1200, 1900, 1500, 2100, 2400, 3200, 2800],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ingresos ($)'
                    }
                }
            }
        }
    });
}
