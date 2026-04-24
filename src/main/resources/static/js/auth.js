/**
 * auth.js - Gestión de sesión y seguridad local
 * Corregido: Manejo de errores para evitar bloqueo en "Verificando"
 */

document.addEventListener('DOMContentLoaded', function() {
    const isLoginPage = document.querySelector('#loginForm');

    if (isLoginPage) {
        initLoginPage();
        initLoginForm();
        checkRememberedUser();
    } else {
        checkAuthentication();
    }
});

// Inicializar datos dinámicos de la página de login
function initLoginPage() {
    const settings = loadAppSettings();
    
    // Actualizar nombre del negocio
    const appName = document.getElementById('appName');
    if (appName) appName.textContent = settings.businessName || 'CyberManager';
    
    // Actualizar versión
    const appVersion = document.getElementById('appVersion');
    if (appVersion) appVersion.textContent = `Versión ${settings.version || '1.0.0'}`;
    
    // Actualizar copyright con año actual
    const appCopyright = document.getElementById('appCopyright');
    if (appCopyright) appCopyright.textContent = `© ${new Date().getFullYear()} ${settings.businessName || 'CyberManager'} - Todos los derechos reservados`;
}

// Cargar configuración guardada o usar valores por defecto
function loadAppSettings() {
    try {
        const saved = localStorage.getItem('cyberSettings');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Error al cargar configuración:', e);
    }
    
    // Valores por defecto
    return {
        businessName: 'CyberManager',
        version: '1.0.0',
        costPerHour: 10,
        currencySymbol: '$',
        language: 'es',
        autoLogout: 30
    };
}

// Función auxiliar para mostrar mensajes sin que rompa el código
function displayMessage(type, text) {
    try {
        // Intenta usar el sistema de CyberManager si existe
        if (window.CyberManager && CyberManager.ui && CyberManager.ui.showMessage) {
            CyberManager.ui.showMessage(type, text);
        } else if (window.CyberManager && CyberManager.showMessage) {
            CyberManager.showMessage(type, text);
        } else {
            alert(text);
        }
    } catch (e) {
        alert(text);
    }
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            displayMessage('error', 'Por favor complete todos los campos');
            return;
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // UI State
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        submitBtn.disabled = true;
        
        simulateLogin(username, password).then(isValid => {
            if (isValid) {
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('loginTime', new Date().toISOString());
                
                displayMessage('success', `¡Bienvenido, ${username}!`);
                
                setTimeout(() => {
                    // Si no hay redirección guardada, ir a dashboard.html
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'dashboard.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                }, 800);
            } else {
                displayMessage('error', 'Credenciales inválidas. Intente con admin / admin123');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }).catch(err => {
            console.error("Error en login:", err);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
}

function simulateLogin(username, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const validUsers = [
                { user: 'admin', pass: 'admin123' },
                { user: 'operador', pass: 'operador123' }
            ];
            
            const match = validUsers.find(u => 
                u.user === username.toLowerCase() && 
                u.pass === password
            );
            resolve(!!match);
        }, 1000);
    });
}

function checkAuthentication() {
    const auth = sessionStorage.getItem('isAuthenticated');
    
    if (auth !== 'true') {
        const path = window.location.pathname.split('/').pop();
        if (path && path !== 'index.html' && path !== '') {
            sessionStorage.setItem('redirectAfterLogin', path);
        }
        window.location.href = 'index.html';
        return;
    }
    
    updateUserInfo();
    setupInactivityTimer();
}

function logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

function setupInactivityTimer() {
    let timeout;
    const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }, 30 * 60 * 1000); 
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        .forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();
}

function updateUserInfo() {
    const user = sessionStorage.getItem('username');
    const displayNames = document.querySelectorAll('.user-details h4, .user-info span');
    if (user && displayNames.length > 0) {
        displayNames.forEach(el => el.textContent = user.charAt(0).toUpperCase() + user.slice(1));
    }
}

function checkRememberedUser() {
    const user = localStorage.getItem('rememberedUser');
    const userField = document.getElementById('username');
    const rememberCheckbox = document.getElementById('rememberMe');
    
    if (user && userField) {
        userField.value = user;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

window.logout = logout;