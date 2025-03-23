// Helper function for screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Export the workspace initialization function
export function initializeWorkspace() {
    // Define custom blocks first
    defineCustomBlocks();

    // Initialize Blockly workspace with the toolbox and specific container
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: BLOCKLY_TOOLBOX,
        horizontalLayout: false,
        toolboxContainer: 'toolbox-container',
        scrollbars: true,
        trashcan: true,
        sounds: true,
        grid: {
            spacing: 20,
            length: 20,
            colour: '#f5f5f5',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            wheelOptions: {
                passive: true
            }
        },
        move: {
            scrollbars: true,
            drag: true,
            wheel: true,
            wheelOptions: {
                passive: true
            }
        },
        accessibilityMode: true,
        keyboardNav: true,
        eventOptions: {
            passive: true
        }
    });

    // Enable keyboard navigation if available
    if (Blockly.navigation) {
        Blockly.navigation.enableKeyboardAccessibility();
    }

    // Add code generation listener
    workspace.addChangeListener(generateCode);

    // Set up all handlers
    setupViewToggle();
    setupThemeHandlers();
    setupRunButton();
    setupTutorial(workspace);
    setupSettingsSynchronization();
    applyFontSizes();

    // Initial accessibility setup with a delay
    setTimeout(verifyAndFixAccessibility, 1000);

    // Add workspace accessibility setup with a delay to ensure elements are loaded
    setTimeout(setupWorkspaceAccessibility, 1000);

    // Add observer to maintain accessibility attributes
    const observer = new MutationObserver(() => {
        verifyAndFixAccessibility();
        setupWorkspaceAccessibility();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return workspace;
}

// Helper function for code generation
function generateCode() {
    try {
        const workspace = Blockly.getMainWorkspace();
        const code = Blockly.Python.workspaceToCode(workspace);
        document.getElementById('output').textContent = code || "No code generated.";
    } catch (e) {
        document.getElementById('output').textContent = "Error generating code: " + e.message;
    }
}

// Setup view toggle functionality
function setupViewToggle() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const outputPane = document.getElementById('code-pane');
    const blocklyDiv = document.getElementById('blocklyDiv');
    const viewModeLabel = document.getElementById('viewModeLabel');

    // Set initial state of code-pane and blocklyDiv
    outputPane.style.display = 'none';
    blocklyDiv.style.display = 'block';
    viewModeLabel.textContent = 'Block View';

    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function() {
            const isCodeView = this.checked;
            
            if (isCodeView) {
                outputPane.style.display = 'block';
                blocklyDiv.style.display = 'none';
                viewModeLabel.textContent = 'Code View';
            } else {
                outputPane.style.display = 'none';
                blocklyDiv.style.display = 'block';
                viewModeLabel.textContent = 'Block View';
            }
            
            // Update ARIA states
            this.setAttribute('aria-checked', isCodeView);
            this.setAttribute('aria-label', `Switch to ${isCodeView ? 'block' : 'code'} view`);
            
            announceToScreenReader(`Switched to ${isCodeView ? 'code' : 'block'} view`);
        });
    }
}

// Setup theme handlers
function setupThemeHandlers() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');

    // Set initial theme state
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const isHighContrast = localStorage.getItem('highContrast') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    if (isHighContrast) {
        document.body.classList.add('high-contrast');
        highContrastToggle.checked = true;
    }

    // Apply theme to Blockly workspace
    applyThemeToBlockly();

    // Add event listeners
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            handleThemeChange('darkMode', this.checked);
        });
    }

    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', function() {
            handleThemeChange('highContrast', this.checked);
        });
    }
}

// Handle theme changes
function handleThemeChange(themeType, isEnabled) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');

    if (themeType === 'darkMode') {
        if (isEnabled) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('high-contrast');
            localStorage.setItem('darkMode', 'true');
            localStorage.setItem('highContrast', 'false');
            highContrastToggle.checked = false;
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    } else if (themeType === 'highContrast') {
        if (isEnabled) {
            document.body.classList.add('high-contrast');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('highContrast', 'true');
            localStorage.setItem('darkMode', 'false');
            darkModeToggle.checked = false;
        } else {
            document.body.classList.remove('high-contrast');
            localStorage.setItem('highContrast', 'false');
        }
    }

    applyThemeToBlockly();
}

// Apply theme to Blockly workspace
function applyThemeToBlockly() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const isHighContrast = localStorage.getItem('highContrast') === 'true';
    const workspace = Blockly.getMainWorkspace();

    if (!workspace) return;

    let theme;
    if (isHighContrast) {
        theme = Blockly.Theme.defineTheme('highContrast', {
            'base': Blockly.Themes.Classic,
            'componentStyles': {
                'workspaceBackgroundColour': '#000',
                'toolboxBackgroundColour': '#000',
                'toolboxForegroundColour': '#fff',
                'flyoutBackgroundColour': '#000',
                'flyoutForegroundColour': '#fff',
                'flyoutOpacity': 1,
                'scrollbarColour': '#fff',
                'insertionMarkerColour': '#fff',
                'insertionMarkerOpacity': 0.3,
                'scrollbarOpacity': 0.4,
                'cursorColour': '#fff'
            }
        });
    } else if (isDarkMode) {
        theme = Blockly.Theme.defineTheme('dark', {
            'base': Blockly.Themes.Classic,
            'componentStyles': {
                'workspaceBackgroundColour': '#1e1e1e',
                'toolboxBackgroundColour': '#333',
                'toolboxForegroundColour': '#fff',
                'flyoutBackgroundColour': '#252526',
                'flyoutForegroundColour': '#ccc',
                'flyoutOpacity': 1,
                'scrollbarColour': '#797979',
                'insertionMarkerColour': '#fff',
                'insertionMarkerOpacity': 0.3,
                'scrollbarOpacity': 0.4,
                'cursorColour': '#fff'
            }
        });
    } else {
        theme = Blockly.Theme.defineTheme('default', {
            'base': Blockly.Themes.Classic,
            'componentStyles': {
                'workspaceBackgroundColour': '#ffffff',
                'toolboxBackgroundColour': '#f0f0f0',
                'toolboxForegroundColour': '#000000',
                'flyoutBackgroundColour': '#f9f9f9',
                'flyoutForegroundColour': '#000000',
                'flyoutOpacity': 1,
                'scrollbarColour': '#cccccc',
                'insertionMarkerColour': '#000000',
                'insertionMarkerOpacity': 0.3,
                'scrollbarOpacity': 0.4,
                'cursorColour': '#000000'
            }
        });
    }

    workspace.setTheme(theme);
}

// Setup run button and terminal functionality
function setupRunButton() {
    const runButton = document.getElementById('runCodeBtn');
    const terminal = document.getElementById('terminal');

    if (runButton) {
        runButton.addEventListener('click', async function() {
            const code = document.getElementById('output').textContent;

            try {
                const response = await fetch('/api/run-python', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });

                const result = await response.json();
                terminal.textContent = result.output || result.error;
            } catch (error) {
                terminal.textContent = 'Error connecting to the server.';
            }

            // Move focus to terminal so screen readers announce the update
            terminal.focus();
        });
    }

    // Add keyboard navigation for the code output
    document.getElementById('output').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            // Select all text in the output
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
}

// Add this function to load saved state
async function loadSavedState(workspace) {
    try {
        console.log('Starting to load saved state...');
        
        // Check if user is logged in
        const isLoggedIn = document.querySelector('input[name="isLoggedIn"]')?.value === 'true';
        if (!isLoggedIn) {
            console.log('User not logged in, skipping state load');
            return;
        }
        
        const response = await fetch('/api/project-tutorials/fetch');
        
        // Check content type to see if we got HTML instead of JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.log('Received HTML response instead of JSON, likely not authenticated');
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch saved state: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Full data received from server:', data);
        
        const tutorialId = document.querySelector('input[name="tutorialId"]')?.value;
        if (!tutorialId) {
            console.log('No tutorial ID provided');
            return;
        }

        // Map tutorial IDs to project numbers
        const projectMapping = {
            'hello-world': '1',
            'loops-intro': '2',
            'variables-basic': '3'
        };

        const projectNumber = projectMapping[tutorialId];
        if (!projectNumber) {
            console.log('Unknown tutorial ID:', tutorialId);
            return;
        }

        const progressField = `project${projectNumber}_progress`;

        if (data.workspace_state) {
            console.log('Found workspace state, attempting to load...');
            try {
                // Clear the workspace
                workspace.clear();
                
                // Temporarily disable events
                Blockly.Events.disable();
                
                try {
                    // Load the saved state
                    Blockly.serialization.workspaces.load(data.workspace_state, workspace);
                    
                    // Make sure all blocks are editable and movable
                    workspace.getAllBlocks(false).forEach(block => {
                        block.setEditable(true);
                        block.setMovable(true);
                        block.setDeletable(true);
                        if (block.workspace) {
                            block.initSvg();
                            block.render();
                        }
                    });
                } finally {
                    // Re-enable events
                    Blockly.Events.enable();
                }
                
                // Resize and center
                Blockly.svgResize(workspace);
                workspace.scrollCenter();
                
                // Force a complete workspace render
                workspace.render();
                
                console.log('Workspace state loaded successfully');
            } catch (e) {
                console.error('Error loading workspace state:', e);
            }
        }

        // Load tutorial progress
        if (window.tutorialGuide && data[progressField]) {
            const progress = parseFloat(data[progressField]);
            const step = Math.max(0, Math.floor((progress / 100) * 6));
            window.tutorialGuide.setStep(step);
        }
    } catch (error) {
        console.error('Error in loadSavedState:', error);
    }
}

// Update the setupTutorial function
function setupTutorial(workspace) {
    const tutorialId = document.querySelector('input[name="tutorialId"]')?.value;
    const isTutorialMode = document.querySelector('input[name="tutorialMode"]')?.value === 'true';
    
    console.log('Tutorial setup:', { tutorialId, isTutorialMode });

    if (isTutorialMode && tutorialId) {
        console.log('Initializing tutorial guide');
        // Initialize tutorial guide
        const guide = new TutorialGuide(workspace, tutorialId);
        window.tutorialGuide = guide;

        // Setup save progress button
        const saveProgressBtn = document.getElementById('saveProgressBtn');
        if (saveProgressBtn) {
            saveProgressBtn.addEventListener('click', async function() {
                try {
                    const workspaceState = Blockly.serialization.workspaces.save(workspace);
                    console.log('Saving workspace state:', workspaceState);
                    
                    let currentStep = 0;
                    if (window.tutorialGuide) {
                        currentStep = window.tutorialGuide.getCurrentStep() + 1;
                        console.log('Current tutorial step:', currentStep);
                    }

                    const payload = {
                        tutorialId: tutorialId,
                        currentStep: currentStep,
                        workspaceState: workspaceState
                    };

                    console.log('Sending payload:', payload);

                    const response = await fetch('/api/project-tutorials/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                    }

                    const responseData = await response.json();
                    console.log('Save response:', responseData);

                    if (responseData.status === 'success') {
                        window.location.href = '/api/project-tutorials';
                    } else {
                        alert('Failed to save progress: ' + (responseData.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error saving progress:', error);
                    alert('Error saving progress: ' + error.message);
                }
            });
        }

        // Load saved state
        loadSavedState(workspace);
    }
}

// Define custom blocks
function defineCustomBlocks() {
    if (typeof Blockly !== 'undefined') {
        // Define custom print block
        Blockly.Blocks['custom_print'] = {
            init: function() {
                this.appendValueInput('TEXT')
                    .setCheck(null)
                    .appendField('print');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(160);
                this.setTooltip('Print the specified text.');
                this.setHelpUrl('');
            }
        };

        // Define the Python generator for the custom print block
        Blockly.Python['custom_print'] = function(block) {
            var value_text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_ATOMIC);
            var code = 'print(' + value_text + ')\n';
            return code;
        };
        
        console.log('Custom blocks defined successfully');
    } else {
        console.error('Blockly is not loaded!');
    }
}

// Setup settings synchronization
function setupSettingsSynchronization() {
    // First load settings from our centralized system
    loadAndApplySettings();
    
    // Create observer for Blockly UI elements
    const observer = new MutationObserver(function(mutations) {
        const darkModeToggle = document.querySelector('.blockly-dark-mode-toggle');
        const highContrastToggle = document.querySelector('.blockly-high-contrast-toggle');
        
        if (darkModeToggle && !darkModeToggle.hasAttribute('data-observed')) {
            setupDarkModeToggle(darkModeToggle);
        }
        
        if (highContrastToggle && !highContrastToggle.hasAttribute('data-observed')) {
            setupHighContrastToggle(highContrastToggle);
        }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Helper function to setup dark mode toggle
function setupDarkModeToggle(toggle) {
    toggle.setAttribute('data-observed', 'true');
    
    const isDarkMode = sessionStorage.getItem('darkMode') === 'true';
    if (isDarkMode && toggle.checked !== isDarkMode) {
        toggle.click();
    }
    
    toggle.addEventListener('change', function() {
        const settings = {
            darkMode: this.checked,
            highContrast: document.body.classList.contains('high-contrast'),
            fontSize: parseInt(sessionStorage.getItem('fontSize')) || 14
        };
        
        saveSettings(settings).then(result => {
            if (!result.success) {
                console.error('Failed to save dark mode setting:', result.message);
            }
        });
    });
}

// Helper function to setup high contrast toggle
function setupHighContrastToggle(toggle) {
    toggle.setAttribute('data-observed', 'true');
    
    const isHighContrast = sessionStorage.getItem('highContrast') === 'true';
    if (isHighContrast && toggle.checked !== isHighContrast) {
        toggle.click();
    }
    
    toggle.addEventListener('change', function() {
        const settings = {
            darkMode: document.body.classList.contains('dark-mode'),
            highContrast: this.checked,
            fontSize: parseInt(sessionStorage.getItem('fontSize')) || 14
        };
        
        saveSettings(settings).then(result => {
            if (!result.success) {
                console.error('Failed to save high contrast setting:', result.message);
            }
        });
    });
}

// Apply font sizes to elements
function applyFontSizes() {
    const savedFontSize = localStorage.getItem('fontSize') || '14';
    document.body.style.fontSize = `${savedFontSize}px`;
    
    document.querySelectorAll('input, button, label, .Register_Button, .Form_Group, p, a, .navbar_buttons_list button, #terminal, #runCodeBtn')
        .forEach(el => {
            el.style.fontSize = `${savedFontSize}px`;
        });
}

// Export necessary functions
export { generateCode, applyThemeToBlockly, loadSavedState };

// Update the verifyAndFixAccessibility function
function verifyAndFixAccessibility() {
    console.log('Verifying accessibility settings...');
    
    // Get the toolbox container
    const toolboxContainer = document.querySelector('.blocklyToolboxContents');
    if (!toolboxContainer) return;

    // Set up the toolbox container
    toolboxContainer.setAttribute('role', 'tree');
    toolboxContainer.setAttribute('aria-label', 'Block categories');

    // Get all category containers
    const categoryContainers = document.querySelectorAll('.blocklyToolboxCategory');
    categoryContainers.forEach((container, index) => {
        // Set up the main category container
        container.setAttribute('role', 'treeitem');
        container.setAttribute('aria-level', '1');
        container.setAttribute('aria-posinset', (index + 1).toString());
        container.setAttribute('aria-setsize', categoryContainers.length.toString());
        
        // Find the tree row and label
        const treeRow = container.querySelector('.blocklyTreeRow');
        const label = container.querySelector('.blocklyTreeLabel');
        
        if (treeRow && label) {
            // Remove role from tree row as it's redundant
            treeRow.removeAttribute('role');
            
            // Set up unique IDs
            const labelId = `category-${index}-label`;
            label.id = labelId;
            
            // Connect the label to the category container
            container.setAttribute('aria-labelledby', labelId);
            
            // Make the tree row focusable but not a separate ARIA element
            treeRow.setAttribute('tabindex', '0');
            
            // Remove any other redundant ARIA attributes
            treeRow.removeAttribute('aria-labelledby');
            treeRow.removeAttribute('aria-level');
            treeRow.removeAttribute('aria-selected');
        }

        // Remove any other role attributes from child elements
        container.querySelectorAll('[role]').forEach(el => {
            if (el !== container) {
                el.removeAttribute('role');
            }
        });
    });

    // Set up flyout
    const flyout = document.querySelector('.blocklyFlyout');
    if (flyout) {
        flyout.setAttribute('role', 'region');
        flyout.setAttribute('aria-label', 'Available blocks');
    }

    // Add keyboard navigation
    categoryContainers.forEach(container => {
        const treeRow = container.querySelector('.blocklyTreeRow');
        if (treeRow) {
            treeRow.addEventListener('keydown', function(e) {
                const currentIndex = Array.from(categoryContainers).indexOf(container);
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (currentIndex < categoryContainers.length - 1) {
                            categoryContainers[currentIndex + 1]
                                .querySelector('.blocklyTreeRow')?.focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (currentIndex > 0) {
                            categoryContainers[currentIndex - 1]
                                .querySelector('.blocklyTreeRow')?.focus();
                        }
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        treeRow.click();
                        break;
                }
            });
        }
    });
}

// Add this new function
function setupWorkspaceAccessibility() {
    // Get workspace elements
    const trashcan = document.querySelector('.blocklyTrash');
    const zoomControls = document.querySelector('.blocklyZoom');
    const horizontalScrollbar = document.querySelector('.blocklyScrollbarHorizontal');
    const verticalScrollbar = document.querySelector('.blocklyScrollbarVertical');

    // Setup trashcan
    if (trashcan) {
        trashcan.setAttribute('role', 'button');
        trashcan.setAttribute('aria-label', 'Trash can. Drag blocks here to delete them');
        trashcan.setAttribute('tabindex', '0');
        
        // Make the image decorative
        const trashImage = trashcan.querySelector('image');
        if (trashImage) {
            trashImage.setAttribute('aria-hidden', 'true');
        }
    }

    // Setup zoom controls
    if (zoomControls) {
        const zoomInButton = zoomControls.querySelector('.blocklyZoomInButton');
        const zoomOutButton = zoomControls.querySelector('.blocklyZoomOutButton');
        const zoomResetButton = zoomControls.querySelector('.blocklyZoomResetButton');

        if (zoomInButton) {
            zoomInButton.setAttribute('role', 'button');
            zoomInButton.setAttribute('aria-label', 'Zoom in');
            zoomInButton.setAttribute('tabindex', '0');
        }

        if (zoomOutButton) {
            zoomOutButton.setAttribute('role', 'button');
            zoomOutButton.setAttribute('aria-label', 'Zoom out');
            zoomOutButton.setAttribute('tabindex', '0');
        }

        if (zoomResetButton) {
            zoomResetButton.setAttribute('role', 'button');
            zoomResetButton.setAttribute('aria-label', 'Reset zoom');
            zoomResetButton.setAttribute('tabindex', '0');
        }
    }

    // Setup scrollbars
    if (horizontalScrollbar) {
        horizontalScrollbar.setAttribute('role', 'scrollbar');
        horizontalScrollbar.setAttribute('aria-label', 'Horizontal workspace scroll');
        horizontalScrollbar.setAttribute('aria-orientation', 'horizontal');
        horizontalScrollbar.setAttribute('tabindex', '0');
    }

    if (verticalScrollbar) {
        verticalScrollbar.setAttribute('role', 'scrollbar');
        verticalScrollbar.setAttribute('aria-label', 'Vertical workspace scroll');
        verticalScrollbar.setAttribute('aria-orientation', 'vertical');
        verticalScrollbar.setAttribute('tabindex', '0');
    }
}
