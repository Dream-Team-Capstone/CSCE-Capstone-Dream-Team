// Function to load and apply settings
async function loadAndApplySettings() {
    // Always clear everything first
    clearAllSettings();
    
    const isLoggedIn = document.querySelector('input[name="isLoggedIn"]')?.value === 'true';

    if (isLoggedIn) {
        try {
            const response = await fetch('/api/settings/fetch');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const settings = await response.json();
            applySettings(settings);
            updateFormControls(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fall back to sessionStorage if API call fails
            loadFromSessionStorage();
        }
    } else {
        // For non-logged in users, load from sessionStorage
        loadFromSessionStorage();
    }
}

function loadFromSessionStorage() {
    // Check if settings exist in sessionStorage
    if (sessionStorage.getItem('darkMode') !== null ||
        sessionStorage.getItem('highContrast') !== null ||
        sessionStorage.getItem('fontSize') !== null) {
        
        const settings = {
            darkMode: sessionStorage.getItem('darkMode') === 'true',
            highContrast: sessionStorage.getItem('highContrast') === 'true',
            fontSize: parseInt(sessionStorage.getItem('fontSize')) || 14
        };
        applySettings(settings);
        updateFormControls(settings);
    } else {
        // If no session settings exist, apply defaults
        const defaultSettings = getDefaultSettings();
        applySettings(defaultSettings);
        updateFormControls(defaultSettings);
    }
}

function clearAllSettings() {
    // Remove classes
    document.body.classList.remove('dark-mode', 'high-contrast');
    
    // Reset form controls to defaults if they exist
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorContrastToggle = document.getElementById('colorContrastToggle');
    const fontSizeSetting = document.getElementById('fontSizeSetting');

    if (darkModeToggle) darkModeToggle.checked = false;
    if (colorContrastToggle) colorContrastToggle.checked = false;
    if (fontSizeSetting) fontSizeSetting.value = 14;

    // Remove any inline font-size styles to allow CSS defaults
    const textElements = document.querySelectorAll('h2, h3, h4, h5, h6, p, span, li, a, button');
    textElements.forEach(element => {
        element.style.removeProperty('font-size');
    });
}

function applySettings(settings) {
    // Remove existing classes first
    document.body.classList.remove('dark-mode', 'high-contrast');
    
    // Only add classes if settings are explicitly true
    if (settings.darkMode === true) {
        document.body.classList.add('dark-mode');
    }
    if (settings.highContrast === true) {
        document.body.classList.add('high-contrast');
    }
    
    // Only apply font size if it's explicitly set
    if (settings.fontSize && settings.fontSize !== 14) {
        const textElements = document.querySelectorAll('h2, h3, h4, h5, h6, p, span, li, a, button');
        textElements.forEach(element => {
            element.style.fontSize = settings.fontSize + 'px';
        });
    }
}

function updateFormControls(settings) {
    // Only update form controls if they exist (i.e., on settings page)
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorContrastToggle = document.getElementById('colorContrastToggle');
    const fontSizeSetting = document.getElementById('fontSizeSetting');

    if (darkModeToggle) darkModeToggle.checked = settings.darkMode === true;
    if (colorContrastToggle) colorContrastToggle.checked = settings.highContrast === true;
    if (fontSizeSetting) fontSizeSetting.value = settings.fontSize || 14;
}

function getDefaultSettings() {
    return {
        darkMode: false,
        highContrast: false,
        fontSize: 14
    };
}

// Function to save settings
async function saveSettings(settings) {
    // Save to sessionStorage first
    sessionStorage.setItem('darkMode', settings.darkMode);
    sessionStorage.setItem('highContrast', settings.highContrast);
    sessionStorage.setItem('fontSize', settings.fontSize);
    
    // Apply settings immediately
    applySettings(settings);
    
    // Check if user is logged in
    const isLoggedIn = document.querySelector('input[name="isLoggedIn"]')?.value === 'true';
    
    if (isLoggedIn) {
        try {
            // If user is logged in, save to their account
            const response = await fetch('/api/save-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save settings');
            }
            
            return { success: true, message: 'Settings saved successfully!' };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, message: 'Failed to save settings to your account.' };
        }
    } else {
        return { success: true, message: 'Settings saved to this browser only. Log in to save settings to your account.' };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load and apply settings
    loadAndApplySettings();
    
    // Add event listeners for settings controls if they exist
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorContrastToggle = document.getElementById('colorContrastToggle');
    const fontSizeSetting = document.getElementById('fontSizeSetting');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            const isChecked = this.checked;
            document.body.classList.toggle('dark-mode', isChecked);
            sessionStorage.setItem('darkMode', isChecked);
        });
    }
    
    if (colorContrastToggle) {
        colorContrastToggle.addEventListener('change', function() {
            const isChecked = this.checked;
            document.body.classList.toggle('high-contrast', isChecked);
            sessionStorage.setItem('highContrast', isChecked);
        });
    }
    
    if (fontSizeSetting) {
        fontSizeSetting.addEventListener('input', function() {
            const fontSize = this.value;
            const textElements = document.querySelectorAll('h2, h3, h4, h5, h6, p, span, li, a, button');
            textElements.forEach(element => {
                element.style.fontSize = fontSize + 'px';
            });
            sessionStorage.setItem('fontSize', fontSize);
        });
    }
}); 