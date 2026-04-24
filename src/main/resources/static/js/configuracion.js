// js/configuracion.js - Gestión centralizada de ajustes del sistema

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar configuraciones guardadas o usar valores por defecto
    loadSettings();
    
    // 2. Inicializar el Dark Mode (ya existente)
    initDarkMode();

    // 3. Escuchar el envío del formulario de configuración
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAllSettings();
        });
    }
});

// Valores por defecto del sistema
const defaultSettings = {
    businessName: "CyberManager",
    costPerHour: 10.00,
    currencySymbol: "$",
    language: "es",
    autoLogout: 30, // minutos
    allowNegativeStock: false,
    footerText: "CyberManager v1.0.0 | © 2023"
};

function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Carga los datos de localStorage a los inputs del formulario
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('cyberSettings')) || defaultSettings;

    // Mapeo de IDs de inputs a valores guardados
    const fields = {
        'businessName': saved.businessName,
        'costPerHour': saved.costPerHour,
        'currencySymbol': saved.currencySymbol,
        'footerText': saved.footerText,
        'autoLogout': saved.autoLogout,
        'allowNegativeStock': saved.allowNegativeStock
    };

    // Llenar los campos si existen en el HTML
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    }

    // Aplicar cambios visuales inmediatos (como el nombre en el logo)
    applyBranding(saved.businessName);
}

function saveAllSettings() {
    // Recolectar datos de los inputs
    const newSettings = {
        businessName: document.getElementById('businessName')?.value || defaultSettings.businessName,
        costPerHour: parseFloat(document.getElementById('costPerHour')?.value) || defaultSettings.costPerHour,
        currencySymbol: document.getElementById('currencySymbol')?.value || defaultSettings.currencySymbol,
        footerText: document.getElementById('footerText')?.value || defaultSettings.footerText,
        autoLogout: parseInt(document.getElementById('autoLogout')?.value) || defaultSettings.autoLogout,
        allowNegativeStock: document.getElementById('allowNegativeStock')?.checked || false
    };

    // Guardar en localStorage
    localStorage.setItem('cyberSettings', JSON.stringify(newSettings));

    // Aplicar cambios visuales
    applyBranding(newSettings.businessName);
    
    // Notificar al usuario (usando CyberManager de main.js)
    if (window.CyberManager) {
        CyberManager.showMessage('success', 'Configuraciones guardadas y aplicadas correctamente');
    } else {
        alert("¡Configuraciones guardadas!");
    }
}

function applyBranding(name) {
    // Cambiar el nombre en la barra lateral/header
    const logoText = document.querySelector('.logo h2');
    if (logoText) logoText.textContent = name;
    
    // Cambiar el título de la pestaña del navegador
    document.title = `${name} - Sistema de Gestión`;
}

// 4. Exportar configuración para que otros archivos (sesiones.js, ventas.js) la usen
window.getSystemSettings = function() {
    return JSON.parse(localStorage.getItem('cyberSettings')) || defaultSettings;
};