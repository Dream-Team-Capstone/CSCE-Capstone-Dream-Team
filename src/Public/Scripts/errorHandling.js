/**
 * Displays an accessible error message
 * @param {string} message - The error message to display
 * @param {string} containerId - The ID of the container to show the error in
 */
function showAccessibleErrorMessage(message, containerId) {
    // Create or get the error container
    let errorContainer = document.getElementById(containerId);
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = containerId;
        errorContainer.className = 'error_box';
        errorContainer.setAttribute('role', 'alert');
        errorContainer.setAttribute('aria-live', 'assertive');
        errorContainer.setAttribute('aria-atomic', 'true');
        errorContainer.setAttribute('tabindex', '-1');
        document.body.appendChild(errorContainer);
    }
    
    // Clear previous errors
    errorContainer.innerHTML = '';
    
    // Add the new error message
    const errorText = document.createElement('p');
    errorText.className = 'error_popup_text';
    errorText.textContent = message;
    errorContainer.appendChild(errorText);
    
    // Make sure the error is visible
    errorContainer.classList.remove('hidden');
    
    // Focus on the error message for screen readers
    errorContainer.focus();
    
    // Optionally, remove the error after a delay
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 6000);
}

/**
 * Highlights a form field with an error
 * @param {string} fieldId - The ID of the field with an error
 * @param {boolean} hasError - Whether the field has an error
 */
function highlightFieldError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (hasError) {
            field.classList.add('input-error');
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('input-error');
            field.setAttribute('aria-invalid', 'false');
        }
    }
} 