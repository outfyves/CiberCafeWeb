/**
 * configuracion.js - Gestión de ajustes del sistema conectada a la Base de Datos
 */

const API_CONFIG = '/api/configuracion';

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

async function initSettingsPage() {
    // 1. Cargar configuraciones desde la DB
    await loadSettingsFromDB();
    
    initDarkMode();

    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettingsToDB();
        });
    }
}

async function loadSettingsFromDB() {
    try {
        const response = await fetch(API_CONFIG);
        const settings = await response.json();
        
        // Mapear claves de la DB a IDs de inputs
        const fields = [
            'businessName', 
            'costPerHour', 
            'currencySymbol', 
            'autoLogout'
        ];

        fields.forEach(id => {
            const element = document.getElementById(id);
            if (element && settings[id] !== undefined) {
                element.value = settings[id];
            }
        });

        if (settings.businessName) {
            applyBranding(settings.businessName);
        }
    } catch (e) {
        console.error("Error al cargar configuración desde DB:", e);
    }
}

async function saveSettingsToDB() {
    const payload = {
        businessName: document.getElementById('businessName')?.value || "CyberManager",
        costPerHour: document.getElementById('costPerHour')?.value || "2000",
        currencySymbol: document.getElementById('currencySymbol')?.value || "$",
        autoLogout: document.getElementById('autoLogout')?.value || "30"
    };

    try {
        const response = await fetch(API_CONFIG, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            applyBranding(payload.businessName);
            CyberManager.ui.showMessage('success', 'Configuraciones guardadas en la base de datos');
        }
    } catch (e) {
        console.error("Error al guardar en DB:", e);
        CyberManager.ui.showMessage('error', 'Error al conectar con el servidor');
    }
}

function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Sincronizar estado inicial del toggle
    if (localStorage.getItem('theme') === 'dark') {
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (window.CyberManager) {
            CyberManager.applyTheme();
        } else {
            document.body.classList.toggle('dark-mode', isDark);
        }
    });
}

function applyBranding(name) {
    const logoText = document.querySelector('.logo h2');
    if (logoText) logoText.textContent = name;
    document.title = `${name} - Configuración`;
}
