/**
 * CyberManager - Core JS
 * Funciones globales y utilidades comunes
 */

const CyberManager = {
    // --- Configuración y Estado ---
    config: {
        currency: 'MXN',
        locale: 'es-MX',
        inactivityTimeout: 30 // minutos
    },

    // --- Inicialización Principal ---
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applyTheme(); // Aplicar Modo Oscuro si está activo
            this.components.dateTime();
            this.components.sidebar();
            this.components.passwordToggle();
            this.components.search();
            this.components.notifications();
            this.updateGlobalNotifications(); // Cargar notificaciones reales
            this.ui.animateElements();
            this.ui.initTooltips();
            this.applyBranding(); // actualizar nombre y título según configuración

            // Refrescar notificaciones cada 30s
            setInterval(() => this.updateGlobalNotifications(), 30000);
        });
    },

    // --- Aplicar Tema (Modo Oscuro) ---
    applyTheme: function() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },

    // --- Notificaciones Globales desde DB ---
    updateGlobalNotifications: async function() {
        let count = 0;
        try {
            // 1. Equipos en mantenimiento
            const respEq = await fetch('/api/equipos');
            const equipos = await respEq.json();
            const mantCount = equipos.filter(e => e.estado.toLowerCase() === 'mantenimiento').length;
            if (mantCount > 0) count++;

            // Actualizar Badge de Equipos en la barra lateral
            const totalEquipos = equipos.length;
            const availableEquipos = equipos.filter(e => e.estado.toLowerCase() === 'disponible').length;
            const navEquiposBadge = document.getElementById('navEquiposBadge');
            if (navEquiposBadge) {
                navEquiposBadge.textContent = `${availableEquipos}/${totalEquipos}`;
            }

            // 2. Stock bajo de productos
            const respProd = await fetch('/api/productos');
            if (respProd.ok) {
                const productos = await respProd.json();
                const lowStock = productos.filter(p => p.stock < 5).length;
                if (lowStock > 0) count++;
            }

            // 3. Clientes morosos
            const respCli = await fetch('/api/clientes');
            const clientes = await respCli.json();
            const morosos = clientes.filter(c => (c.estado || '').toLowerCase() === 'moroso').length;
            if (morosos > 0) count++;
        } catch (e) {
            console.warn('Error al actualizar notificaciones globales:', e);
        }

        const badges = document.querySelectorAll('.notifications .badge');
        badges.forEach(b => {
            b.textContent = count;
            b.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    // --- Branding global desde DB ---
    applyBranding: async function() {
        try {
            const resp = await fetch('/api/configuracion');
            const settings = await resp.json();
            const name = settings.businessName || 'CyberManager';
            const logoText = document.querySelector('.logo h2');
            if (logoText) logoText.textContent = name;
            document.title = `${name} - Sistema de Gestión`;
        } catch (e) {
            console.warn('Error aplicando branding:', e);
        }
    },

    // --- Componentes de Interfaz ---
    components: {
        // Reloj en tiempo real
        dateTime: function() {
            const el = document.getElementById('currentDateTime');
            if (!el) return;

            const update = () => {
                const now = new Date();
                el.textContent = now.toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', 
                    day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            };
            update();
            setInterval(update, 60000);
        },

        // Sidebar Colapsable y Estado Activo
        sidebar: function() {
            const btn = document.getElementById('toggleSidebar');
            const sidebar = document.querySelector('.sidebar');
            const main = document.querySelector('.main-content');
            
            // Marcar enlace activo automáticamente
            const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
            document.querySelectorAll('.sidebar-menu ul li a').forEach(link => {
                const linkPath = link.getAttribute('href');
                if (linkPath === currentPath) {
                    link.parentElement.classList.add('active');
                } else {
                    link.parentElement.classList.remove('active');
                }
            });

            if (!btn || !sidebar) return;

            btn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                if (main) main.classList.toggle('expanded');
                
                const icon = btn.querySelector('i');
                icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-bars' : 'fas fa-times';
            });
        },

        // Mostrar/Ocultar Password
        passwordToggle: function() {
            const btn = document.getElementById('togglePassword');
            const input = document.getElementById('password');
            if (!btn || !input) return;

            btn.addEventListener('click', () => {
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                btn.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        },

        // Buscador Global
        search: function() {
            const input = document.querySelector('.search-container input');
            const icon = document.querySelector('.search-container i');
            if (!input) return;

            const handleSearch = () => {
                const query = input.value.trim();
                if (query) {
                    console.log(`Buscando: ${query}`);
                    // Lógica de filtrado o redirección aquí
                    CyberManager.ui.showMessage('info', `Buscando: ${query}...`);
                }
            };

            input.addEventListener('keyup', (e) => e.key === 'Enter' && handleSearch());
            if (icon) icon.addEventListener('click', handleSearch);
        },

        // Sistema de Notificaciones
        notifications: function() {
            const btn = document.querySelector('.notifications');
            if (!btn) return;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationsPanel(btn);
            });
        },

        toggleNotificationsPanel: function(anchor) {
            let panel = document.getElementById('notificationsPanel');
            if (panel) {
                panel.remove();
                return;
            }

            panel = document.createElement('div');
            panel.id = 'notificationsPanel';
            panel.className = 'notifications-panel active'; // Asegúrate de tener CSS para .active
            panel.innerHTML = `
                <div class="notifications-header">
                    <h4>Notificaciones</h4>
                    <button class="close-notifications">&times;</button>
                </div>
                <div class="notifications-list">
                    <div class="notification-item unread">
                        <i class="fas fa-desktop text-warning"></i>
                        <div class="n-info"><p>PC-07: Mantenimiento pendiente</p><span>Hace 2h</span></div>
                    </div>
                    <div class="notification-item">
                        <i class="fas fa-check-circle text-success"></i>
                        <div class="n-info"><p>Cierre de caja exitoso</p><span>Ayer</span></div>
                    </div>
                </div>
                <div class="notifications-footer">
                    <button class="mark-all-read">Marcar leídas</button>
                </div>
            `;
            document.body.appendChild(panel);

            // Posicionamiento dinámico si es necesario o vía CSS
            
            // Cerrar al clic fuera
            const close = () => { panel.remove(); document.removeEventListener('click', close); };
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target)) close();
            });
        }
    },

    // --- Utilidades de UI ---
    ui: {
        animateElements: function() {
            const items = document.querySelectorAll('.fade-in, .stat-card, .action-card');
            items.forEach((el, i) => {
                el.style.animationDelay = `${i * 0.05}s`;
                el.classList.add('animate-ready'); // Define esta clase en tu CSS
            });
        },

        initTooltips: function() {
            const targets = document.querySelectorAll('[data-tooltip]');
            targets.forEach(t => {
                t.addEventListener('mouseenter', (e) => {
                    const tip = document.createElement('div');
                    tip.className = 'custom-tooltip';
                    tip.textContent = t.dataset.tooltip;
                    document.body.appendChild(tip);
                    
                    const rect = t.getBoundingClientRect();
                    tip.style.top = `${rect.top - 35}px`;
                    tip.style.left = `${rect.left + (rect.width/2)}px`;
                    t._tip = tip;
                });
                t.addEventListener('mouseleave', () => t._tip?.remove());
            });
        },

        showMessage: function(type, message) {
            const container = document.getElementById('messageContainer') || (() => {
                const c = document.createElement('div');
                c.id = 'messageContainer';
                document.body.appendChild(c);
                return c;
            })();

            const msg = document.createElement('div');
            msg.className = `alert alert-${type} slide-in`;
            msg.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
            container.appendChild(msg);

            setTimeout(() => {
                msg.classList.add('fade-out');
                setTimeout(() => msg.remove(), 500);
            }, 4000);
        }
    },

    // --- Formateadores ---
    utils: {
        formatMoney: (n) => {
            // usar símbolo personalizado si está definido en configuración
            let symbol = '$';
            try {
                const settings = window.getSystemSettings ? window.getSystemSettings() : null;
                if (settings && settings.currencySymbol) {
                    symbol = settings.currencySymbol;
                }
            } catch (e) { /* ignore */ }
            const num = parseFloat(n) || 0;
            // simple formateo manual para no depender de locales con símbolo
            return symbol + num.toFixed(2);
        },
        formatDate: (d) => new Date(d).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })
    },

    // --- Métodos Globales (Alias para facilitar uso) ---
    showMessage: function(type, message) {
        return this.ui.showMessage(type, message);
    },

    confirmAction: function(message) {
        return confirm(message);
    }
};

// Iniciar sistema
CyberManager.init();