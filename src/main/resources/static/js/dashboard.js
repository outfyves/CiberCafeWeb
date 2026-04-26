/**
 * dashboard.js - Panel Principal
 * Gestiona las estadísticas y sesiones recientes del dashboard conectadas a la DB
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // 1. Ejecutar primera carga
    await updateDashboardStats();
    await renderRecentSessions();
    await updateNotifications();
    
    // 2. Intervalo de actualización (cada 10 segundos)
    setInterval(async () => {
        await updateDashboardStats();
        await renderRecentSessions();
        await updateNotifications();
    }, 10000);
    
    // 3. Inicializar gráficos si existe Chart.js
    if (typeof Chart !== 'undefined') {
        initRevenueChart();
    }
}

/**
 * Renderiza las sesiones recientes en la tabla consultando la API de Sesiones
 */
async function renderRecentSessions() {
    const tableBody = document.getElementById('recentSessionsTable');
    if (!tableBody) return;
    
    try {
        const response = await fetch('/api/sesiones');
        const sesiones = await response.json();
        
        if (sesiones.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay sesiones registradas hoy</td></tr>';
            return;
        }

        tableBody.innerHTML = sesiones.map(session => {
            const inicio = new Date(session.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let duracion = '-';
            if (session.fechaFin) {
                const diff = new Date(session.fechaFin) - new Date(session.fechaInicio);
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                duracion = `${hours}:${minutes.toString().padStart(2, '0')} h`;
            } else {
                duracion = 'En curso...';
            }

            const estadoRaw = session.estado.toLowerCase();
            const estadoClass = estadoRaw === 'activa' ? 'active' : (estadoRaw === 'finalizada' ? 'finished' : estadoRaw);
            
            return `
                <tr>
                    <td><strong>${session.cliente}</strong></td>
                    <td>${session.equipo}</td>
                    <td>${inicio}</td>
                    <td>${duracion}</td>
                    <td>$${(session.total || 0).toFixed(2)}</td>
                    <td><span class="status ${estadoClass}">${session.estado.toUpperCase()}</span></td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Error al cargar sesiones recientes:', e);
        tableBody.innerHTML = '<tr><td colspan="6">Error al conectar con el servidor</td></tr>';
    }
}

/**
 * Actualiza las estadísticas del dashboard
 */
async function updateDashboardStats() {
    // Leer ingresos reales acumulados en la sesión actual de la web
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
    
    // Obtener sesiones activas locales
    const storedSessions = (() => {
        try {
            const s = localStorage.getItem('active_sessions');
            return s ? JSON.parse(s) : {};
        } catch (e) { return {}; }
    })();

    const activeCount = Object.keys(storedSessions).length;

    // Obtener datos de equipos desde la API
    let totalEquiposCount = 0;
    let availableEquiposCount = 0;
    try {
        const response = await fetch('/api/equipos');
        const equipos = await response.json();
        totalEquiposCount = equipos.length;
        availableEquiposCount = equipos.filter(e => e.estado.toLowerCase() === 'disponible').length;
    } catch (e) {
        console.error('Error al obtener estadísticas de equipos:', e);
    }

    const sesionesActivasEl = document.getElementById('sesionesActivas');
    if (sesionesActivasEl) {
        sesionesActivasEl.textContent = `${activeCount}/${totalEquiposCount}`;
    }
    
    const navBadge = document.getElementById('navSessionsBadge');
    if (navBadge) {
        navBadge.textContent = activeCount;
    }

    // Clientes hoy
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
        equiposDisponiblesEl.textContent = `${availableEquiposCount}/${totalEquiposCount}`;
    }
}

/**
 * Actualiza las notificaciones basadas en datos reales de la base de datos
 */
async function updateNotifications() {
    let count = 0;
    const notificationList = []; // Para futuras expansiones
    
    try {
        // 1. Alerta: Equipos en mantenimiento
        const respEq = await fetch('/api/equipos');
        const equipos = await respEq.json();
        const mantCount = equipos.filter(e => e.estado.toLowerCase() === 'mantenimiento').length;
        if (mantCount > 0) count++;

        // 2. Alerta: Stock bajo (menos de 5 unidades)
        const respProd = await fetch('/api/productos');
        if (respProd.ok) {
            const productos = await respProd.json();
            const lowStock = productos.filter(p => p.stock < 5).length;
            if (lowStock > 0) count++;
        }

        // 3. Alerta: Clientes morosos
        const respCli = await fetch('/api/clientes');
        const clientes = await respCli.json();
        const morosos = clientes.filter(c => (c.estado || '').toLowerCase() === 'moroso').length;
        if (morosos > 0) count++;

    } catch (e) {
        console.warn('Error al calcular notificaciones:', e);
    }

    // Actualizar badges de notificación en el header
    const badges = document.querySelectorAll('.notifications .badge');
    badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'flex' : 'none';
        
        // Efecto visual si hay notificaciones
        if (count > 0) {
            b.parentElement.classList.add('has-notifications');
        } else {
            b.parentElement.classList.remove('has-notifications');
        }
    });
}

/**
 * Inicializa el gráfico de ingresos semanales (simulado por ahora)
 */
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Ingresos Semanales ($)',
                data: [1200, 1900, 1500, 2100, 2400, 3200, 2800],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}
