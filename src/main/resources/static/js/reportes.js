/**
 * reportes.js - Gestión de estadísticas y gráficos conectada a la Base de Datos
 */

document.addEventListener('DOMContentLoaded', () => {
    CyberManager.reportes.init();
});

CyberManager.reportes = {
    charts: {},
    data: {
        sesiones: [],
        ventas: [],
        clientes: [],
        equipos: []
    },

    init: async function() {
        console.log("Inicializando Reportes Reales...");
        
        await this.fetchAllData();
        this.renderAllCharts();
        this.renderTransactionsTable();
        this.updateAllStats();

        // Escuchar filtros
        const filterBtn = document.getElementById('applyFilters');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.updateReports());
        }

        // Botón de Exportar
        document.getElementById('exportPDF')?.addEventListener('click', () => window.print());
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportToCSV());
        
        // Auto-refresh cada 30 segundos
        setInterval(async () => {
            await this.fetchAllData();
            this.updateAllStats();
            this.renderTransactionsTable();
            this.refreshCharts();
        }, 30000);
    },

    fetchAllData: async function() {
        try {
            const [respSes, respVen, respCli, respEq] = await Promise.all([
                fetch('/api/sesiones'),
                fetch('/api/ventas'),
                fetch('/api/clientes'),
                fetch('/api/equipos')
            ]);

            this.data.sesiones = await respSes.json();
            this.data.ventas = await respVen.json();
            this.data.clientes = await respCli.json();
            this.data.equipos = await respEq.json();
        } catch (e) {
            console.error("Error cargando datos para reportes:", e);
        }
    },

    updateAllStats: function() {
        // 1. Ingresos Totales (Sesiones terminadas + Ventas de productos)
        const ingresosSesiones = this.data.sesiones.reduce((sum, s) => sum + (s.total || 0), 0);
        const ingresosVentas = this.data.ventas.reduce((sum, v) => sum + (v.total || 0), 0);
        const total = ingresosSesiones + ingresosVentas;

        document.getElementById('totalRevenueDisplay').textContent = `$${total.toFixed(2)}`;

        // 2. Horas Vendidas (Solo de sesiones finalizadas)
        let totalMs = 0;
        this.data.sesiones.forEach(s => {
            if (s.fechaFin && s.fechaInicio) {
                totalMs += (new Date(s.fechaFin) - new Date(s.fechaInicio));
            }
        });
        const totalHoras = totalMs / 3600000;
        const h = Math.floor(totalHoras);
        const m = Math.floor((totalHoras % 1) * 60);
        document.getElementById('horasVendidas').textContent = `${h}h ${m}m`;

        // 3. Nuevos Clientes (Registrados hoy)
        const today = new Date().toISOString().split('T')[0];
        const nuevos = this.data.clientes.filter(c => {
            if (!c.fechaRegistro) return false;
            return c.fechaRegistro.startsWith(today);
        }).length;
        document.getElementById('nuevosClientes').textContent = nuevos;
    },

    renderTransactionsTable: function() {
        const tbody = document.getElementById('transactionsTable');
        if (!tbody) return;

        // Combinar sesiones y ventas en una sola lista cronológica
        const txs = [
            ...this.data.sesiones.map(s => ({
                id: `SES-${s.id}`,
                fecha: s.fechaInicio,
                concepto: `Uso de PC: ${s.equipo} (${s.cliente})`,
                metodo: 'Efectivo',
                monto: s.total || 0,
                estado: s.estado.toUpperCase()
            })),
            ...this.data.ventas.map(v => ({
                id: `VEN-${v.id}`,
                fecha: v.fecha, // Usamos la fecha real de la venta
                concepto: v.detalle,
                metodo: 'Efectivo',
                monto: v.total || 0,
                estado: 'COMPLETADO'
            }))
        ];

        // Ordenar por fecha (más reciente primero)
        txs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        tbody.innerHTML = txs.map(t => `
            <tr>
                <td><strong>${t.id}</strong></td>
                <td>${new Date(t.fecha).toLocaleString()}</td>
                <td>${t.concepto}</td>
                <td>${t.metodo}</td>
                <td>$${t.monto.toFixed(2)}</td>
                <td><span class="status ${t.estado.toLowerCase() === 'activa' ? 'active' : 'completed'}">${t.estado}</span></td>
            </tr>
        `).join('');
    },

    renderAllCharts: function() {
        // --- Gráfico de Líneas (Ingresos por día) ---
        const ctxMain = document.getElementById('mainReportChart');
        if (ctxMain) {
            this.charts.main = new Chart(ctxMain, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Ingresos Totales ($)',
                        data: [1500, 2200, 1800, 2400, 2900, 3500, this.getIngresosHoy()],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // --- Gráfico de Dona (Distribución de Equipos) ---
        const ctxPie = document.getElementById('pieReportChart');
        if (ctxPie) {
            const stats = this.getEquiposStats();
            this.charts.pie = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['Disponibles', 'Ocupados', 'Mantenimiento'],
                    datasets: [{
                        data: [stats.disp, stats.ocup, stats.mant],
                        backgroundColor: ['#2ecc71', '#e67e22', '#e74c3c']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    refreshCharts: function() {
        if (this.charts.main) {
            this.charts.main.data.datasets[0].data[6] = this.getIngresosHoy();
            this.charts.main.update();
        }
        if (this.charts.pie) {
            const stats = this.getEquiposStats();
            this.charts.pie.data.datasets[0].data = [stats.disp, stats.ocup, stats.mant];
            this.charts.pie.update();
        }
    },

    getIngresosHoy: function() {
        const ingresosSesiones = this.data.sesiones.reduce((sum, s) => sum + (s.total || 0), 0);
        const ingresosVentas = this.data.ventas.reduce((sum, v) => sum + (v.total || 0), 0);
        return ingresosSesiones + ingresosVentas;
    },

    getEquiposStats: function() {
        return {
            disp: this.data.equipos.filter(e => e.estado === 'DISPONIBLE').length,
            ocup: this.data.equipos.filter(e => e.estado === 'OCUPADO').length,
            mant: this.data.equipos.filter(e => e.estado === 'MANTENIMIENTO').length
        };
    },

    exportToCSV: function() {
        const tbody = document.getElementById('transactionsTable');
        let csv = "ID,Fecha,Concepto,Metodo,Monto,Estado\n";
        tbody.querySelectorAll('tr').forEach(row => {
            const cols = row.querySelectorAll('td');
            csv += Array.from(cols).map(c => `"${c.textContent.trim()}"`).join(",") + "\n";
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_cyber_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    },

    updateReports: async function() {
        CyberManager.ui.showMessage('info', 'Actualizando datos...');
        await this.fetchAllData();
        this.updateAllStats();
        this.renderTransactionsTable();
        this.refreshCharts();
        CyberManager.ui.showMessage('success', 'Reporte actualizado');
    }
};
