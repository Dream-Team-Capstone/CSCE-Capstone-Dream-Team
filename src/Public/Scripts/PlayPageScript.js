// Helper function for screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Log the announcement for debugging
    console.log('Screen reader announcement:', message);
    
    // Remove the announcement after it's read
    setTimeout(() => announcement.remove(), 1000);
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

    // Add code generation listener
    workspace.addChangeListener(generateCode);

    // Set up all handlers
    setupViewToggle();
    setupThemeHandlers();
    setupRunButton();
    setupTutorial(workspace);
    setupSettingsSynchronization();
    applyFontSizes();

    // Add workspace navigation setup
    setTimeout(() => {
        setupWorkspaceNavigation();
        setupWorkspaceAccessibility();
        verifyAndFixAccessibility();
        setupBlockMovementAccessibility(workspace);
    }, 1000);

    // Add movement listener for all blocks
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

    // Add debug logging for block movements
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

    // Wait a bit longer before setting up accessibility
    setTimeout(setupFlyoutAccessibility, 2000);

    // Add continuous connection checking
    setupConnectionChecking(workspace);

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
function handleFlyoutBlockClick(block) {
    const workspace = Blockly.getMainWorkspace();
    if (!workspace) return;

    try {
        const blockType = block.getAttribute('type') ||
                         block.getAttribute('data-type') ||
                         block.getAttribute('data-id')?.split('_')[0];

        if (!blockType) {
            console.error('Could not determine block type');
            return;
        }

        // Get a readable description of the block
        const blockText = Array.from(block.querySelectorAll('.blocklyText'))
            .map(text => text.textContent)
            .join(' ');
        const blockDescription = blockText || blockType;

        const newBlock = workspace.newBlock(blockType);
        newBlock.initSvg();
        newBlock.render();

        // Position block
        const metrics = workspace.getMetrics();
        const x = metrics.viewWidth / 2;
        const y = metrics.viewHeight / 2;
        newBlock.moveBy(x, y);

        // Make the new block accessible
        const svgRoot = newBlock.getSvgRoot();
        if (svgRoot) {
            svgRoot.setAttribute('role', 'button');
            svgRoot.setAttribute('aria-label', `${blockDescription} block. Use arrow keys to move.`);
            svgRoot.setAttribute('tabindex', '0');
        }

        // Announce block creation
        announceToScreenReader(`Added ${blockDescription} block to workspace`);

        // Try to connect to nearby blocks
        tryConnectToNearbyBlocks(newBlock, workspace);

    } catch (err) {
        console.error('Error in handleFlyoutBlockClick:', err);
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

function checkAndConnectBlocks(movedBlock, workspace) {
    const SNAP_RADIUS = 30; // Pixels - adjust this value as needed

    // Get all blocks except the moved one
    const otherBlocks = workspace.getAllBlocks().filter(block => block.id !== movedBlock.id);

    // Get all connections from the moved block
    const connections = movedBlock.getConnections_(true);
    
    connections.forEach(connection => {
        // Skip if already connected
        if (connection.isConnected()) {
            return;
        }

        let closestConnection = null;
        let shortestDistance = SNAP_RADIUS;

        // Check each other block's connections
        otherBlocks.forEach(otherBlock => {
            const otherConnections = otherBlock.getConnections_(true);
            
            otherConnections.forEach(otherConnection => {
                if (otherConnection.isConnected()) {
                    return;
                }

                // Check if connection types are compatible
                if (connection.canConnect(otherConnection)) {
                    // Get the distance between connections
                    const distance = Blockly.utils.Coordinate.distance(
                        connection.x_,
                        connection.y_,
                        otherConnection.x_,
                        otherConnection.y_
                    );

                    // Update if this is the closest valid connection
                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        closestConnection = otherConnection;
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

// Helper function to get block description
function getBlockDescription(block) {
    try {
        // Try to get text content from the block
        const texts = Array.from(block.getSvgRoot().querySelectorAll('.blocklyText'))
            .map(text => text.textContent)
            .filter(Boolean);
        
        return texts.join(' ') || 'block';
    } catch (e) {
        return 'block';
    }
}

// Update the setupFlyoutAccessibility function
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
                    handleFlyoutBlockClick(parentBlock);
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

// Add block movement and keyboard navigation support
function setupBlockMovementAccessibility(workspace) {
    let isDragging = false;
    let selectedBlock = null;
    const MOVE_DISTANCE = 20;

    // Add keyboard deletion handler directly to the workspace div
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
        const xy = block.getRelativeToSurfaceXY();
        block.moveBy(dx, dy);
        
        announceToScreenReader(`Moved ${getBlockDescription(block)} ${
            dx > 0 ? 'right' : dx < 0 ? 'left' : ''
        } ${
            dy > 0 ? 'down' : dy < 0 ? 'up' : ''
        }`);
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

    // Add workspace change listener for new blocks
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
function tryConnectToNearbyBlocks(newBlock, workspace) {
    console.log('Trying to connect block:', newBlock.type);
    
    const SNAP_RADIUS = 50; // Increased radius for easier connections
    let bestConnection = null;
    let bestTarget = null;
    let closestDistance = SNAP_RADIUS;

    // Get all connections from the new block
    const newBlockConnections = newBlock.getConnections_(true);
    console.log('Available connections on new block:', 
        newBlockConnections.map(conn => conn.type).join(', '));

    // Get all other blocks
    const otherBlocks = workspace.getAllBlocks(false).filter(b => b.id !== newBlock.id);
    
    // Try each connection on the new block
    newBlockConnections.forEach(connection => {
        // Skip if already connected
        if (connection.isConnected()) return;

        // Get connection location
        const connectionXY = connection.x_ + ',' + connection.y_;
        console.log(`Checking connection at ${connectionXY}`);

        otherBlocks.forEach(otherBlock => {
            const otherConnections = otherBlock.getConnections_(true);
            
            otherConnections.forEach(otherConnection => {
                // Skip if already connected
                if (otherConnection.isConnected()) return;

                // Check if these connections are compatible
                if (connection.canConnect(otherConnection)) {
                    // Get the distance between connections
                    const dx = connection.x_ - otherConnection.x_;
                    const dy = connection.y_ - otherConnection.y_;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    console.log(`Found compatible connection, distance: ${distance}`);

                    // Update if this is the closest valid connection
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        bestConnection = connection;
                        bestTarget = otherConnection;
                        console.log('New best connection found, distance:', distance);
                    }
                }
            });
        });
    });

    // If we found a valid connection, connect the blocks
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

// Add this function to continuously check for connections during movement
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
