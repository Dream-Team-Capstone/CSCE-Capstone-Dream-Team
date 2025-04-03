// Helper function for screen reader announcements
function announceToScreenReader(message) {
    console.log('Screen reader announcement:', message);
    
    // Create or get the live region
    let liveRegion = document.getElementById('blockly-screen-reader-announcer');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'blockly-screen-reader-announcer';
        liveRegion.setAttribute('aria-live', 'assertive');
        liveRegion.setAttribute('role', 'status');
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0,0,0,0)';
        document.body.appendChild(liveRegion);
    }
    
    // Update the message
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

// Export the workspace initialization function
export function initializeWorkspace() {
    // Define custom blocks first
    defineCustomBlocks();

    // Initialize Blockly workspace
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
            scaleSpeed: 1.2
        }
    });

    // code generation listener
    workspace.addChangeListener(generateCode);

    // Set up all handlers
    setupViewToggle();
    setupThemeHandlers();
    setupRunButton();
    setupTutorial(workspace);
    setupSettingsSynchronization();
    applyFontSizes();

    // workspace navigation setup
    setTimeout(() => {
        setupWorkspaceNavigation();
        setupWorkspaceAccessibility();
        verifyAndFixAccessibility();
        setupBlockMovementAccessibility(workspace);
    }, 1000);

    // movement listener for all blocks
    workspace.addChangeListener(function(event) {
        if (event.type === Blockly.Events.BLOCK_MOVE) {
            const block = workspace.getBlockById(event.blockId);
            if (block) {
                tryConnectToNearbyBlocks(block, workspace);
            }
        }
    });

    // Enable auto-connect for the workspace
    enableAutoConnect(workspace);

    // debug logging for block movements
    workspace.addChangeListener(event => {
        if (event.type === Blockly.Events.BLOCK_MOVE) {
            console.log('Block moved:', event.blockId);
            const block = workspace.getBlockById(event.blockId);
            if (block) {
                console.log('Block position:', {
                    x: block.getRelativeToSurfaceXY().x,
                    y: block.getRelativeToSurfaceXY().y
                });
            }
        }
    });

    // Set up flyout accessibility
    setupFlyoutAccessibility();

    // Wait a bit before setting up accessibility
    setTimeout(setupFlyoutAccessibility, 2000);

    // continuous connection checking
    setupConnectionChecking(workspace);

    // Set up block accessibility
    setupBlockAccessibility(workspace);

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

    // event listeners
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

    // keyboard navigation for the code output
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

// setupTutorial function
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
    
    const toolboxContainer = document.querySelector('.blocklyToolboxContents');
    if (!toolboxContainer) return;

    toolboxContainer.setAttribute('role', 'tree');
    toolboxContainer.setAttribute('aria-label', 'Block categories');

    const categoryContainers = document.querySelectorAll('.blocklyToolboxCategory');
    categoryContainers.forEach((container, index) => {
        // Set up container attributes
        container.setAttribute('role', 'treeitem');
        container.setAttribute('aria-expanded', 'false');
        container.setAttribute('aria-level', '1');
        container.setAttribute('aria-posinset', (index + 1).toString());
        container.setAttribute('aria-setsize', categoryContainers.length.toString());
        
        const treeRow = container.querySelector('.blocklyTreeRow');
        const label = container.querySelector('.blocklyTreeLabel');
        
        if (treeRow && label) {
            // Ensure the row is clickable
            treeRow.style.pointerEvents = 'auto';
            treeRow.style.cursor = 'pointer';
            
            // Set up labeling
            const labelId = `category-${index}-label`;
            label.id = labelId;
            container.setAttribute('aria-labelledby', labelId);
            
            // Make focusable
            treeRow.setAttribute('tabindex', '0');
            
            // Remove any existing listeners
            const newRow = treeRow.cloneNode(true);
            treeRow.parentNode.replaceChild(newRow, treeRow);
            
            // Add click handler
            newRow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCategoryClick(container);
            });
            
            // Add keyboard handler
            newRow.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategoryClick(container);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextCategory = categoryContainers[index + 1];
                        if (nextCategory) {
                            nextCategory.querySelector('.blocklyTreeRow')?.focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevCategory = categoryContainers[index - 1];
                        if (prevCategory) {
                            prevCategory.querySelector('.blocklyTreeRow')?.focus();
                        }
                        break;
                }
            });
        }
    });

    // Set up flyout
    const flyout = document.querySelector('.blocklyFlyout');
    if (flyout) {
        flyout.setAttribute('role', 'region');
        flyout.setAttribute('aria-label', 'Available blocks');
    }

    // Add flyout accessibility setup
    setupFlyoutAccessibility();

    // Set up observer for flyout changes
    const flyoutObserver = new MutationObserver(() => {
        setupFlyoutAccessibility();
    });

    if (flyout) {
        flyoutObserver.observe(flyout, {
            childList: true,
            subtree: true
        });
    }
}

// Make sure this function is defined BEFORE it's used in event listeners
function handleCategoryClick(category) {
    const workspace = Blockly.getMainWorkspace();
    if (!workspace || !workspace.toolbox_) return;

    try {
        // Find the category name for screen reader announcement
        const label = category.querySelector('.blocklyTreeLabel');
        const categoryName = label ? label.textContent : 'category';

        // Let Blockly handle the selection
        const toolbox = workspace.toolbox_;
        const categoryId = category.getAttribute('id');
        const toolboxItem = toolbox.getToolboxItemById(categoryId);
        
        if (toolboxItem) {
            // This will handle both selection and deselection of categories
            toolbox.setSelectedItem(toolboxItem);
            announceToScreenReader(`${categoryName} category selected. Blocks available.`);
        }
    } catch (err) {
        console.error('Error selecting category:', err);
    }
}

// Also add this helper function if not already present
function handleFlyoutBlockKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handleFlyoutBlockClick(this);
    }
}

// Update the handleFlyoutBlockClick function
function handleFlyoutBlockClick(event) {
    const blockElement = event.target.closest('[data-id]');
    if (!blockElement) {
        console.log('No block element found');
        return;
    }

    console.log('Found parent block:', blockElement);

    // Get the actual block type from the Blockly block
    const blockType = blockElement.getAttribute('type') || 
                     blockElement.querySelector('.blocklyText')?.getAttribute('data-type');

    if (!blockType) {
        console.error('Could not determine block type');
        return;
    }

    console.log('Creating block of type:', blockType);

    try {
        const workspace = Blockly.getMainWorkspace();
        const newBlock = workspace.newBlock(blockType);
        newBlock.initSvg();
        newBlock.render();

        // Position the block near the click location
        const mouseXY = Blockly.utils.mouseToSvg(event, workspace.getParentSvg());
        const workspaceXY = workspace.getOriginOffsetInPixels();
        newBlock.moveBy(mouseXY.x - workspaceXY.x, mouseXY.y - workspaceXY.y);

        // Make the block accessible
        makeBlockAccessible(newBlock);

        announceToScreenReader(`Created new ${getBlockDescription(newBlock)}`);
    } catch (error) {
        console.error('Error creating block:', error);
        announceToScreenReader('Failed to create block');
    }
}

function enableAutoConnect(workspace) {
    // Remove any existing move listeners
    if (workspace.moveListener) {
        workspace.removeChangeListener(workspace.moveListener);
    }

    // Add new move listener
    workspace.moveListener = function(event) {
        if (event.type === Blockly.Events.BLOCK_MOVE) {
            const movedBlock = workspace.getBlockById(event.blockId);
            if (movedBlock) {
                checkAndConnectBlocks(movedBlock, workspace);
            }
        }
    };

    workspace.addChangeListener(workspace.moveListener);
}

// helper function to check if connections are compatible
function canConnect(connection1, connection2) {
    if (!connection1 || !connection2) return false;
    
    try {
        // First try Blockly's built-in compatibility check if available
        if (typeof connection1.canConnectWithReason === 'function') {
            return connection1.canConnectWithReason(connection2) === 0;
        }
        
        // Fallback: Check connection types
        // Type mapping: 1 = output, 2 = previous, 3 = input, 4 = next
        const type1 = connection1.type;
        const type2 = connection2.type;
        
        // Valid combinations:
        // output (1) -> input (3)
        // input (3) -> output (1)
        // previous (2) -> next (4)
        // next (4) -> previous (2)
        return (
            (type1 === 1 && type2 === 3) ||
            (type1 === 3 && type2 === 1) ||
            (type1 === 2 && type2 === 4) ||
            (type1 === 4 && type2 === 2)
        );
    } catch (err) {
        console.error('Error checking connection compatibility:', err);
        return false;
    }
}

function checkAndConnectBlocks(movedBlock, workspace) {
    const SNAP_RADIUS = 15;
    const otherBlocks = workspace.getAllBlocks().filter(block => block.id !== movedBlock.id);
    const connections = movedBlock.getConnections_(true);
    
    connections.forEach(connection => {
        if (connection.isConnected()) return;

        let closestConnection = null;
        let shortestDistance = SNAP_RADIUS;

        // Check each other block's connections
        otherBlocks.forEach(otherBlock => {
            const otherConnections = otherBlock.getConnections_(true);
            
            otherConnections.forEach(otherConnection => {
                if (otherConnection.isConnected()) return;

                if (canConnect(connection, otherConnection)) {
                    // Ensure both connections have valid coordinates
                    if (typeof connection.x_ === 'number' && 
                        typeof connection.y_ === 'number' &&
                        typeof otherConnection.x_ === 'number' &&
                        typeof otherConnection.y_ === 'number') {
                        
                        try {
                            const distance = Blockly.utils.Coordinate.distance(
                                connection.x_,
                                connection.y_,
                                otherConnection.x_,
                                otherConnection.y_
                            );

                            if (distance < shortestDistance) {
                                shortestDistance = distance;
                                closestConnection = otherConnection;
                            }
                        } catch (err) {
                            console.error('Error calculating distance:', err);
                        }
                    } else {
                        // Try to get coordinates from the blocks' positions
                        const sourcePos = connection.getSourceBlock().getRelativeToSurfaceXY();
                        const targetPos = otherConnection.getSourceBlock().getRelativeToSurfaceXY();
                        
                        if (sourcePos && targetPos) {
                            const distance = Math.sqrt(
                                Math.pow(sourcePos.x - targetPos.x, 2) +
                                Math.pow(sourcePos.y - targetPos.y, 2)
                            );

                            if (distance < shortestDistance) {
                                shortestDistance = distance;
                                closestConnection = otherConnection;
                            }
                        }
                    }
                }
            });
        });

        // If we found a close connection, connect them
        if (closestConnection) {
            try {
                connection.connect(closestConnection);
                console.log('Connected blocks successfully');
                
                // Announce connection to screen reader
                const sourceBlock = connection.getSourceBlock();
                const targetBlock = closestConnection.getSourceBlock();
                announceToScreenReader(`Connected ${getBlockDescription(sourceBlock)} to ${getBlockDescription(targetBlock)}`);
            } catch (error) {
                console.error('Failed to connect blocks:', error);
            }
        }
    });
}

function tryConnectToNearbyBlocks(newBlock, workspace) {
    console.log('Trying to connect block:', newBlock.type);
    
    const SNAP_RADIUS = 50;
    let bestConnection = null;
    let bestTarget = null;
    let bestDistance = SNAP_RADIUS;

    const newBlockConnections = newBlock.getConnections_(true);
    console.log('Available connections on new block:', 
        newBlockConnections.map(conn => conn.type).join(', '));

    const otherBlocks = workspace.getAllBlocks(false).filter(b => b.id !== newBlock.id);
    
    newBlockConnections.forEach(connection => {
        if (connection.isConnected()) return;

        const connectionXY = connection.x_ + ',' + connection.y_;
        console.log(`Checking connection at ${connectionXY}`);

        otherBlocks.forEach(otherBlock => {
            const otherConnections = otherBlock.getConnections_(true);
            
            otherConnections.forEach(otherConnection => {
                if (otherConnection.isConnected()) return;

                if (canConnect(connection, otherConnection)) {
                    const dx = connection.x_ - otherConnection.x_;
                    const dy = connection.y_ - otherConnection.y_;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    console.log(`Found compatible connection, distance: ${distance}`);

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestConnection = connection;
                        bestTarget = otherConnection;
                        console.log('New best connection found, distance:', distance);
                    }
                }
            });
        });
    });

    // valid connection found, connect the blocks
    if (bestConnection && bestTarget) {
        try {
            console.log('Attempting to connect blocks...');
            
            // Move block to align perfectly with connection
            const targetBlock = bestTarget.getSourceBlock();
            const dx = bestTarget.x_ - bestConnection.x_;
            const dy = bestTarget.y_ - bestConnection.y_;
            
            // Move the block to align with the connection
            newBlock.moveBy(dx, dy);
            
            // Make the connection
            bestConnection.connect(bestTarget);

            // Announce connection
            const sourceDesc = getBlockDescription(newBlock);
            const targetDesc = getBlockDescription(targetBlock);
            announceToScreenReader(`Connected ${sourceDesc} to ${targetDesc}`);
            
            console.log('Blocks connected successfully');
            return true;
        } catch (err) {
            console.error('Connection failed:', err);
            return false;
        }
    } else {
        console.log('No valid connections found');
        return false;
    }
}

// Helper function to get block description
function getBlockDescription(block) {
    if (!block) return 'unknown block';
    
    let desc = '';
    if (block.type === 'controls_if') {
        desc = 'if do';
    } else if (block.type === 'logic_boolean') {
        desc = block.getFieldValue('BOOL') ? 'true' : 'false';
    } else {
        desc = block.type.replace(/_/g, ' ');
    }
    
    return desc;
}

function setupFlyoutAccessibility() {
    console.log('=== SETUP STARTING ===');

    function findParentBlock(element) {
        let current = element;
        while (current) {
            // Check for both draggable blocks and flyout blocks
            if (current.classList.contains('blocklyDraggable') || 
                current.classList.contains('blocklyFlyoutBlock')) {
                console.log('Found parent block:', current);
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    function makeBlockClickable(element) {
        // Make element clickable
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'pointer';

        // Set better ARIA attributes
        if (element.classList.contains('blocklyFlyoutBlock') || 
            element.classList.contains('blocklyDraggable')) {
            // For the main block element
            element.setAttribute('role', 'button');
            
            // Get block description
            const blockText = Array.from(element.querySelectorAll('.blocklyText'))
                .map(text => text.textContent)
                .join(' ');
            
            element.setAttribute('aria-label', `${blockText} block. Press Enter or Space to add to workspace`);
        } else if (element.classList.contains('blocklyText')) {
            // For text elements within blocks
            element.setAttribute('role', 'button');
            element.setAttribute('aria-label', `${element.textContent} block. Press Enter or Space to add to workspace`);
        }

        // Add click handler if not already added
        if (!element.hasAttribute('data-click-handler')) {
            element.setAttribute('data-click-handler', 'true');
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const parentBlock = findParentBlock(e.target);
                if (parentBlock) {
                    handleFlyoutBlockClick(e);
                }
            });
        }
    }

    function processFlyoutBlocks() {
        console.log('Processing flyout blocks...');

        // Try multiple selectors to find blocks
        const selectors = [
            '.blocklyFlyoutBlock',
            '.blocklyFlyout .blocklyDraggable',
            '.blocklyFlyout g[data-id]'
        ];

        let foundBlocks = false;
        selectors.forEach(selector => {
            const blocks = document.querySelectorAll(selector);
            console.log(`Found ${blocks.length} blocks with selector "${selector}"`);
            
            blocks.forEach(block => {
                foundBlocks = true;
                makeBlockClickable(block);
                
                // Also make text elements clickable
                block.querySelectorAll('.blocklyText').forEach(text => {
                    makeBlockClickable(text);
                });
            });
        });

        // If no blocks found, try again soon
        if (!foundBlocks) {
            setTimeout(processFlyoutBlocks, 100);
        }
    }

    // Watch for category clicks to process blocks
    function setupCategoryObserver() {
        const toolbox = document.querySelector('.blocklyToolboxDiv');
        if (!toolbox) {
            setTimeout(setupCategoryObserver, 100);
            return;
        }

        console.log('Setting up category observer');
        
        // Make categories clickable
        const categories = toolbox.querySelectorAll('.blocklyTreeRow');
        categories.forEach(category => {
            category.addEventListener('click', () => {
                console.log('Category clicked, processing blocks...');
                // Wait a moment for flyout to populate
                setTimeout(processFlyoutBlocks, 100);
            });
        });

        // Also observe the flyout for changes
        const flyout = document.querySelector('.blocklyFlyout');
        if (flyout) {
            const observer = new MutationObserver((mutations) => {
                console.log('Flyout changed, processing blocks...');
                processFlyoutBlocks();
            });

            observer.observe(flyout, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

    // Start the setup
    setupCategoryObserver();
}

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

function setupBlockMovementAccessibility(workspace) {
    let isDragging = false;
    let selectedBlock = null;
    const MOVE_DISTANCE = 20;

    // keyboard deletion handler directly to the workspace div
    const workspaceDiv = document.getElementById('blocklyDiv');
    if (workspaceDiv) {
        workspaceDiv.addEventListener('keydown', handleBlockKeyboard);
    }

    function handleBlockKeyboard(e) {
        const selectedBlock = Blockly.selected;
        if (!selectedBlock) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            try {
                // Get block description before deletion
                const blockDesc = getBlockDescription(selectedBlock);
                
                // Delete the block
                selectedBlock.dispose(true);
                
                // Announce deletion
                announceToScreenReader(`Deleted ${blockDesc}`);
            } catch (err) {
                console.error('Error deleting block:', err);
                announceToScreenReader('Failed to delete block');
            }
        }
    }

    // Make blocks focusable and add keyboard support
    function makeBlocksFocusable() {
        const blocks = workspace.getAllBlocks(false);
        blocks.forEach(block => {
            const svgRoot = block.getSvgRoot();
            if (svgRoot) {
                // Make block interactive
                svgRoot.setAttribute('tabindex', '0');
                svgRoot.setAttribute('role', 'button');
                svgRoot.setAttribute('aria-label', `${getBlockDescription(block)}. Press Space to move, Delete to remove.`);
                
                // Add keyboard handler
                svgRoot.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleBlockInteraction(block);
                    } else if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault();
                        const blockDesc = getBlockDescription(block);
                        block.dispose(true);
                        announceToScreenReader(`Deleted ${blockDesc}`);
                    }
                });

                // Add click handler
                svgRoot.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleBlockInteraction(block);
                });
            }
        });
    }

    // Handle block interaction (both click and keyboard)
    function handleBlockInteraction(block) {
        if (!block) return;
        
        // Toggle dragging state
        isDragging = !isDragging;
        selectedBlock = isDragging ? block : null;
        
        if (isDragging) {
            // Block is now being moved
            block.select();
            announceToScreenReader(`${getBlockDescription(block)} selected. Use arrow keys to move. Press Space again to place block.`);
            
            // Add temporary keyboard handler for movement
            document.addEventListener('keydown', handleMovement);
        } else {
            // Block is being placed
            announceToScreenReader(`${getBlockDescription(block)} placed`);
            
            // Remove temporary keyboard handler
            document.removeEventListener('keydown', handleMovement);
        }
    }

    // Handle block movement with arrow keys
    function handleMovement(e) {
        if (!selectedBlock || !isDragging) return;

        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowUp':
                dy = -MOVE_DISTANCE;
                break;
            case 'ArrowDown':
                dy = MOVE_DISTANCE;
                break;
            case 'ArrowLeft':
                dx = -MOVE_DISTANCE;
                break;
            case 'ArrowRight':
                dx = MOVE_DISTANCE;
                break;
            default:
                return;
        }

        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            moveBlock(selectedBlock, dx, dy);
        }
    }

    // Move block and announce position
    function moveBlock(block, dx, dy) {
        if (!block) {
            console.log('No block to move');
            return;
        }

        try {
            // Use Blockly's built-in moveBy method
            block.moveBy(dx, dy);
            
            // Announce movement
            const direction = 
                dx > 0 ? 'right' :
                dx < 0 ? 'left' :
                dy > 0 ? 'down' :
                'up';
            announceToScreenReader(`Moved ${getBlockDescription(block)} ${direction}`);
        } catch (err) {
            console.error('Move failed:', err);
            announceToScreenReader('Failed to move block');
        }
    }

    // Get readable block description
    function getBlockDescription(block) {
        let desc = block.type.replace(/_/g, ' ');
        const inputs = block.inputList || [];
        const inputValues = inputs
            .map(input => input.fieldRow
                .map(field => field.getText())
                .join(' '))
            .filter(text => text)
            .join(', ');
        
        return inputValues ? `${desc} with values: ${inputValues}` : desc;
    }

    // workspace change listener for new blocks
    workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_CREATE) {
            setTimeout(makeBlocksFocusable, 100);
        }
    });

    // Initial setup
    setTimeout(makeBlocksFocusable, 1000);
}

function setupWorkspaceNavigation() {
    // 1. Skip Links
    const skipLinks = document.querySelector('.skip-links');
    if (skipLinks) {
        skipLinks.querySelectorAll('a').forEach((link, index) => {
            link.setAttribute('tabindex', '1');
        });
    }

    // 2. Main Workspace Area
    const blocklyDiv = document.querySelector('#blocklyDiv');
    if (blocklyDiv) {
        blocklyDiv.setAttribute('tabindex', '10');
        blocklyDiv.setAttribute('role', 'application');
        blocklyDiv.setAttribute('aria-label', 'Block programming workspace');
    }

    // 3. Block Categories Tree
    const toolbox = document.querySelector('.blocklyToolboxContents');
    if (toolbox) {
        toolbox.setAttribute('tabindex', '20');
        toolbox.setAttribute('role', 'tree');
        toolbox.setAttribute('aria-label', 'Block categories');
    }

    // 4. Run Button
    const runButton = document.getElementById('runCodeBtn');
    if (runButton) {
        runButton.setAttribute('tabindex', '30');
    }

    // 5. Terminal
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.setAttribute('tabindex', '40');
        terminal.setAttribute('role', 'region');
        terminal.setAttribute('aria-label', 'Terminal output');
    }

    // 6. Navigation Menu
    const navButtons = document.querySelectorAll('.navbar_buttons_list button, .navbar_buttons_list a');
    navButtons.forEach((button, index) => {
        button.setAttribute('tabindex', `${50 + index}`);
    });

    // 7. Workspace Controls (at the end)
    const controls = {
        trashcan: document.querySelector('.blocklyTrash'),
        verticalScroll: document.querySelector('.blocklyScrollbarVertical'),
        horizontalScroll: document.querySelector('.blocklyScrollbarHorizontal')
    };

    Object.entries(controls).forEach(([key, element], index) => {
        if (element) {
            element.setAttribute('tabindex', `${90 + index}`);
        }
    });
}

// function to continuously check for connections during movement
function setupConnectionChecking(workspace) {
    let movingBlock = null;
    let checkInterval = null;

    workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_MOVE) {
            const block = workspace.getBlockById(event.blockId);
            
            if (block) {
                // Clear existing interval
                if (checkInterval) {
                    clearInterval(checkInterval);
                }

                // Start checking for connections
                movingBlock = block;
                checkInterval = setInterval(() => {
                    if (movingBlock) {
                        tryConnectToNearbyBlocks(movingBlock, workspace);
                    }
                }, 100); // Check every 100ms

                // Stop checking after a short delay when movement stops
                setTimeout(() => {
                    if (checkInterval) {
                        clearInterval(checkInterval);
                        checkInterval = null;
                    }
                    movingBlock = null;
                }, 500);
            }
        }
    });
}

function setupBlockAccessibility(workspace) {
    let selectedBlock = null;
    const MOVE_DISTANCE = 10;

    function selectBlock(block) {
        console.log('Selecting block:', block);
        selectedBlock = block;
        
        const svg = block.getSvgRoot();
        if (svg) {
            svg.classList.add('blocklySelected');
            svg.setAttribute('aria-selected', 'true');
            svg.focus();
        }
        
        // Store the selected block globally
        workspace.selectedBlock = block;
        
        announceToScreenReader(`Selected ${getBlockDescription(block)}. Use arrow keys to move, press C to connect with nearby blocks.`);
    }

    function handleKeyboard(e, block) {
        console.log('Keyboard event:', {
            key: e.key,
            keyCode: e.keyCode,
            code: e.code,
            type: e.type
        });

        // Ensure we have the correct block
        const activeBlock = block || workspace.selectedBlock;
        if (!activeBlock) {
            console.log('No block selected for keyboard event');
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'c':
                e.preventDefault();
                e.stopPropagation();
                console.log('C key pressed, attempting connection for block:', activeBlock.type);
                tryConnectWithScreenReader(activeBlock);
                break;
            case 'arrowleft':
                e.preventDefault();
                moveBlock(activeBlock, -MOVE_DISTANCE, 0);
                break;
            case 'arrowright':
                e.preventDefault();
                moveBlock(activeBlock, MOVE_DISTANCE, 0);
                break;
            case 'arrowup':
                e.preventDefault();
                moveBlock(activeBlock, 0, -MOVE_DISTANCE);
                break;
            case 'arrowdown':
                e.preventDefault();
                moveBlock(activeBlock, 0, MOVE_DISTANCE);
                break;
        }
    }

    function connectBlocks(block) {
        console.log('Attempting to connect block:', block.type);
        
        const workspace = block.workspace;
        const allBlocks = workspace.getAllBlocks(false);
        
        if (block.type === 'controls_if') {
            // If block looking for boolean input
            const ifInput = block.getInput('IF0');
            if (!ifInput || !ifInput.connection) {
                announceToScreenReader('Could not find connection point on if block');
                return;
            }

            // Find boolean blocks
            const booleanBlocks = allBlocks.filter(b => 
                b.type === 'logic_boolean' && 
                b.outputConnection &&
                !b.outputConnection.isConnected() &&
                b !== block
            );

            console.log('Found boolean blocks:', booleanBlocks.length);

            if (booleanBlocks.length > 0) {
                let closestBlock = null;
                let minDistance = Infinity;

                // Get if block position
                const ifPos = block.getRelativeToSurfaceXY();
                const ifConnPos = {
                    x: ifPos.x + ifInput.connection.x_,
                    y: ifPos.y + ifInput.connection.y_
                };

                // Find closest boolean block
                booleanBlocks.forEach(boolBlock => {
                    const boolPos = boolBlock.getRelativeToSurfaceXY();
                    const boolConnPos = {
                        x: boolPos.x + boolBlock.outputConnection.x_,
                        y: boolPos.y + boolBlock.outputConnection.y_
                    };

                    const distance = Math.sqrt(
                        Math.pow(ifConnPos.x - boolConnPos.x, 2) +
                        Math.pow(ifConnPos.y - boolConnPos.y, 2)
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestBlock = boolBlock;
                    }
                });

                if (closestBlock && minDistance < 150) {
                    try {
                        // Move boolean block to connect
                        const boolPos = closestBlock.getRelativeToSurfaceXY();
                        const targetX = ifPos.x + ifInput.connection.x_ - closestBlock.outputConnection.x_;
                        const targetY = ifPos.y + ifInput.connection.y_ - closestBlock.outputConnection.y_;
                        
                        closestBlock.moveBy(targetX - boolPos.x, targetY - boolPos.y);
                        
                        // Make the connection
                        ifInput.connection.connect(closestBlock.outputConnection);
                        announceToScreenReader('Connected true/false block to if block');
                    } catch (err) {
                        console.error('Connection failed:', err);
                        announceToScreenReader('Failed to connect blocks');
                    }
                } else {
                    announceToScreenReader('No compatible blocks found nearby. Move blocks closer together.');
                }
            } else {
                announceToScreenReader('No true/false blocks found to connect');
            }
        } else if (block.type === 'logic_boolean') {
            // Boolean block looking for if block
            const ifBlocks = allBlocks.filter(b => 
                b.type === 'controls_if' &&
                b.getInput('IF0') &&
                b.getInput('IF0').connection &&
                !b.getInput('IF0').connection.isConnected() &&
                b !== block
            );

            console.log('Found if blocks:', ifBlocks.length);

            if (ifBlocks.length > 0) {
                let closestBlock = null;
                let minDistance = Infinity;

                // Get boolean block position
                const boolPos = block.getRelativeToSurfaceXY();
                const boolConnPos = {
                    x: boolPos.x + block.outputConnection.x_,
                    y: boolPos.y + block.outputConnection.y_
                };

                // Find closest if block
                ifBlocks.forEach(ifBlock => {
                    const ifPos = ifBlock.getRelativeToSurfaceXY();
                    const ifInput = ifBlock.getInput('IF0');
                    const ifConnPos = {
                        x: ifPos.x + ifInput.connection.x_,
                        y: ifPos.y + ifInput.connection.y_
                    };

                    const distance = Math.sqrt(
                        Math.pow(boolConnPos.x - ifConnPos.x, 2) +
                        Math.pow(boolConnPos.y - ifConnPos.y, 2)
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestBlock = ifBlock;
                    }
                });

                if (closestBlock && minDistance < 150) {
                    try {
                        const ifBlock = closestBlock;
                        const ifPos = ifBlock.getRelativeToSurfaceXY();
                        const ifInput = ifBlock.getInput('IF0');
                        
                        // Move boolean block to connect
                        const targetX = ifPos.x + ifInput.connection.x_ - block.outputConnection.x_;
                        const targetY = ifPos.y + ifInput.connection.y_ - block.outputConnection.y_;
                        
                        block.moveBy(targetX - boolPos.x, targetY - boolPos.y);
                        
                        // Make the connection
                        block.outputConnection.connect(ifInput.connection);
                        announceToScreenReader('Connected to if block');
                    } catch (err) {
                        console.error('Connection failed:', err);
                        announceToScreenReader('Failed to connect blocks');
                    }
                } else {
                    announceToScreenReader('No compatible blocks found nearby. Move blocks closer together.');
                }
            } else {
                announceToScreenReader('No if blocks found to connect to');
            }
        }
    }

    // Make block accessible
    function makeBlockAccessible(block) {
        if (!block || !block.getSvgRoot) return;
        
        const svgRoot = block.getSvgRoot();
        if (!svgRoot) return;
        
        // Skip if already processed
        if (svgRoot.hasAttribute('data-accessible')) return;
        
        // Mark as processed
        svgRoot.setAttribute('data-accessible', 'true');
        
        // Make block focusable
        svgRoot.setAttribute('tabindex', '0');
        svgRoot.setAttribute('role', 'button');
        
        // Create descriptive label
        let ariaLabel = getBlockDescription(block);
        ariaLabel += '. Use arrow keys to move, C to connect with nearby blocks.';
        svgRoot.setAttribute('aria-label', ariaLabel);
        
        // Add keyboard handler
        svgRoot.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            switch (e.key.toLowerCase()) {
                case 'c':
                    tryConnectWithScreenReader(block);
                    break;
                case 'arrowleft':
                    moveBlock(block, -20, 0);
                    break;
                case 'arrowright':
                    moveBlock(block, 20, 0);
                    break;
                case 'arrowup':
                    moveBlock(block, 0, -20);
                    break;
                case 'arrowdown':
                    moveBlock(block, 0, 20);
                    break;
            }
        });
    }

    function tryConnectWithScreenReader(block) {
        if (!block || !block.workspace) return false;
        
        console.log('Attempting screen reader connection for block:', block.type);
        
        const workspace = block.workspace;
        const CONNECT_RANGE = 150; // pixels
        
        // Get all blocks except the current one
        const otherBlocks = workspace.getAllBlocks(false).filter(b => b.id !== block.id);
        
        let bestConnection = null;
        let bestTarget = null;
        let bestTargetBlock = null;
        let bestDistance = CONNECT_RANGE;

        // Get all connections from the current block
        const blockConnections = block.getConnections_(true);
        const blockPos = block.getRelativeToSurfaceXY();
        
        // Add detailed logging for math blocks
        if (block.type.startsWith('math_')) {
            console.log('Math block connections:', {
                type: block.type,
                connections: blockConnections.map(conn => ({
                    type: conn.type,
                    name: conn.name,
                    sourceBlock: conn.getSourceBlock().type,
                    targetBlock: conn.targetBlock ? conn.targetBlock.type : null
                }))
            });
        }
        
        // Check each connection on the current block
        blockConnections.forEach(connection => {
            if (connection.isConnected()) return;
            
            otherBlocks.forEach(otherBlock => {
                const otherConnections = otherBlock.getConnections_(true);
                const otherBlockPos = otherBlock.getRelativeToSurfaceXY();
                
                otherConnections.forEach(otherConnection => {
                    if (otherConnection.isConnected()) return;
                    
                    // Special handling for math blocks
                    let canConnect = false;
                    if (block.type.startsWith('math_')) {
                        // Math blocks can connect to:
                        // 1. Other math operations (output to input)
                        // 2. Print blocks (output to input)
                        // 3. Variable blocks (output to input)
                        if (otherBlock.type.startsWith('math_') || 
                            otherBlock.type === 'text_print' || 
                            otherBlock.type.startsWith('variables_')) {
                            canConnect = (connection.type === Blockly.OUTPUT_VALUE && 
                                        otherConnection.type === Blockly.INPUT_VALUE);
                        }
                    } else if (otherBlock.type.startsWith('math_')) {
                        // Other blocks can connect to math blocks if they have input connections
                        canConnect = (connection.type === Blockly.INPUT_VALUE && 
                                    otherConnection.type === Blockly.OUTPUT_VALUE);
                    } else {
                        // Use Blockly's connection checker for other blocks
                        const checker = workspace.connectionChecker;
                        canConnect = checker && checker.canConnect(connection, otherConnection, false);
                    }
                    
                    if (canConnect) {
                        // Get connection positions
                        const connPos = connection.getOffsetInBlock();
                        const otherConnPos = otherConnection.getOffsetInBlock();
                        
                        // Calculate distance between connection points
                        const dx = (otherBlockPos.x + otherConnPos.x) - (blockPos.x + connPos.x);
                        const dy = (otherBlockPos.y + otherConnPos.y) - (blockPos.y + connPos.y);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Add detailed logging for math block connection attempts
                        if (block.type.startsWith('math_') || otherBlock.type.startsWith('math_')) {
                            console.log('Math connection attempt:', {
                                sourceBlock: block.type,
                                targetBlock: otherBlock.type,
                                sourceConnType: connection.type,
                                targetConnType: otherConnection.type,
                                distance: distance,
                                canConnect: canConnect
                            });
                        }
                        
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            bestConnection = connection;
                            bestTarget = otherConnection;
                            bestTargetBlock = otherBlock;
                        }
                    }
                });
            });
        });

        // valid connection found, make it
        if (bestConnection && bestTarget && bestTargetBlock) {
            try {
                // Move blocks into position
                const targetPos = bestTargetBlock.getRelativeToSurfaceXY();
                const blockPos = block.getRelativeToSurfaceXY();
                
                // Get connection positions
                const connPos = bestConnection.getOffsetInBlock();
                const otherConnPos = bestTarget.getOffsetInBlock();
                
                // Calculate the offset needed to align the connections
                const dx = (targetPos.x + otherConnPos.x) - (blockPos.x + connPos.x);
                const dy = (targetPos.y + otherConnPos.y) - (blockPos.y + connPos.y);
                
                // Move the block
                block.moveBy(dx, dy);
                
                // Make the connection
                bestConnection.connect(bestTarget);
                
                announceToScreenReader(`Connected ${getBlockDescription(block)} to ${getBlockDescription(bestTargetBlock)}`);
                return true;
            } catch (err) {
                console.error('Failed to connect blocks:', err);
                announceToScreenReader('Failed to connect blocks');
                return false;
            }
        }
        
        announceToScreenReader('No compatible blocks found nearby. Move blocks closer together.');
        return false;
    }

    // Helper function to move blocks
    function moveBlock(block, dx, dy) {
        if (!block) return;
        
        try {
            block.moveBy(dx, dy);
            const direction = 
                dx > 0 ? 'right' :
                dx < 0 ? 'left' :
                dy > 0 ? 'down' :
                'up';
            announceToScreenReader(`Moved ${getBlockDescription(block)} ${direction}`);
        } catch (err) {
            console.error('Move failed:', err);
            announceToScreenReader('Failed to move block');
        }
    }

    // Initialize
    workspace.getAllBlocks(false).forEach(makeBlockAccessible);

    // Listen for new blocks
    workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_CREATE) {
            const block = workspace.getBlockById(event.blockId);
            if (block) makeBlockAccessible(block);
        }
    });
}

//helper function to update block positions after movement
function updateBlockPosition(block) {
    if (!block) return;
    
    const workspace = block.workspace;
    
    // Update the block's position in the workspace
    workspace.recordDragTargets();
    
    // Update connections
    if (block.outputConnection) {
        block.outputConnection.setOffsetInBlock(block.outputConnection.x_, block.outputConnection.y_);
    }
    
    // Update inputs
    block.inputList.forEach(input => {
        if (input.connection) {
            input.connection.setOffsetInBlock(input.connection.x_, input.connection.y_);
        }
    });
}

// function to handle block creation
function handleBlockCreation(workspace, block) {
    // Make the new block accessible
    makeBlockAccessible(block);
}
