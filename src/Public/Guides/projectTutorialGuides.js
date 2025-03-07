// Define all tutorial steps in an object, organized by tutorial ID
const tutorialSteps = {
    'hello-world': [
        {
            title: 'Welcome to "Hello World!"',
            instruction: 'Let\'s create your first program...',
            validation: () => true
        },
        {
            title: 'Add Print Block',
            instruction: '1. Click the "Text" category.\n2. Drag the "print" block to the workspace.',
            validation: (workspace) => {
                return workspace.getAllBlocks().some(block => block.type === 'text_print');
            }
        },
        {
            title: 'Add Text Block',
            instruction: '3. Click the "Text" category. \n4. Drag the " " block to the workspace.', 
            validation: (workspace) => {
                return workspace.getAllBlocks().some(block => block.type === 'text');
            }
        },
        {
            title: 'Add Text to the Block',
            instruction: '5. Click the "Text" block. \n6. Type "Hello World!" in the text field.',
            validation: (workspace) => {
                const blocks = workspace.getAllBlocks();
                return blocks.some(block => 
                    block.type === 'text' && 
                    block.getFieldValue('TEXT') === 'Hello World!'
                );  
            }
        },
        {
            title: 'Connect the Blocks',
            instruction: '7. Connect the "Text" block to the "print" block.',
            validation: (workspace) => {
                return workspace.getAllBlocks().some(block => block.type === 'text_print');
            }
        }, 
        {
            title: 'See Python Code',
            instruction: '8. Click the toggle switch located under the navigation bar. This will show the Python code that corresponds to your blocks.',
            validation: (workspace) => {
                return workspace.getAllBlocks().some(block => block.type === 'text_print');
            }
        }
    ],
    'loops-intro': [
        {
            title: 'Introduction to Loops',
            instruction: 'We\'ll learn how to repeat actions...',
            validation: () => true
        },
        // more loop tutorial steps
    ],
    'variables-basic': [
        {
            title: 'Understanding Variables',
            instruction: 'Let\'s learn about storing data...',
            validation: () => true
        },
        // more variable tutorial steps
    ]
    // more tutorials can be added here
};

class TutorialGuide {
    constructor(workspace, tutorialId) {
        this.workspace = workspace;
        this.tutorialId = tutorialId;
        this.currentStep = 0;
        this.steps = tutorialSteps[tutorialId];
        this.setupTutorialUI();
        
        // Make the tutorial guide instance globally accessible
        window.tutorialGuide = this;
    }

    setupTutorialUI() {
        // Create tutorial overlay
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'false');
        overlay.setAttribute('aria-labelledby', 'step-title');
        overlay.setAttribute('aria-describedby', 'step-instruction');
        overlay.innerHTML = `
            <div class="tutorial-content">
                <h2 id="step-title" tabindex="0" aria-live="polite"></h2>
                <p id="step-instruction" tabindex="0" role="status" aria-live="polite"></p>
                <button id="next-step" 
                    aria-label="Next Tutorial Step"
                    role="button">Next</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Set up event listeners
        document.getElementById('next-step').addEventListener('click', () => this.validateAndProgress());
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Allow Tab key to navigate out of the tutorial
            if (e.key === 'Tab') {
                // No need to prevent default - allow focus to move naturally
                // This ensures VoiceOver can navigate to other elements
            }
        });
        
        // Show first step
        this.showCurrentStep();
        
        // Don't force focus to the overlay - allow natural tab order
        // This helps VoiceOver users navigate the page normally
    }

    showCurrentStep() {
        const step = this.steps[this.currentStep];
        document.getElementById('step-title').textContent = step.title;
        document.getElementById('step-instruction').textContent = step.instruction;
        
        // Announce changes to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}: ${step.title}`;
        document.body.appendChild(announcement);
        
        // Remove the announcement after it's been read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 3000);
    }

    validateAndProgress() {
        const currentStep = this.steps[this.currentStep];
        if (currentStep.validation(this.workspace)) {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.showCurrentStep();
            } else {
                this.currentStep = this.steps.length - 1; // Ensure we don't exceed the last step
                this.completeTutorial();
            }
            // Calculate progress as a percentage of total steps
            const progress = Math.min(Math.round((this.currentStep / (this.steps.length - 1)) * 100), 100);
            console.log('Tutorial step updated to:', this.currentStep);
        }
    }

    completeTutorial() {
        document.getElementById('tutorial-overlay').innerHTML = `
            <div class="tutorial-content" role="dialog" aria-live="polite">
                <h2 id="step-title" aria-label="Tutorial Complete">Congratulations!</h2>
                <p id="step-instruction" role="status" aria-label="Completion Message">You've completed the Hello World tutorial!</p>
                <button id="return-to-projects" 
                    aria-label="Return to projects page"
                    role="button">Return to Projects</button>
            </div>
        `;
        
        // Add event listener for the return button
        document.getElementById('return-to-projects').addEventListener('click', () => {
            window.location.href = '/api/project-tutorials';
        });
    }

    // Add a getter for the current step
    getCurrentStep() {
        return this.currentStep;
    }

    setStep(step) {
        if (step >= 0 && step < this.steps.length) {
            this.currentStep = step;
            this.showCurrentStep();
        }
    }
}
