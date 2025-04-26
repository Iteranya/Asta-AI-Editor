// ui.js - Handles UI-related functionality
let messageTimeout;

export function showLoading(loadingOverlay, isLoading) {
    if (isLoading) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

export function displayMessage(messageArea, message, type = 'info') {
    clearTimeout(messageTimeout);
    messageArea.innerHTML = '';

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageArea.appendChild(messageElement);

    // Trigger reflow to enable transition
    void messageElement.offsetWidth;

    messageElement.classList.add('show');
    messageArea.style.display = 'block';

    // Automatically hide the message after 5 seconds
    messageTimeout = setTimeout(() => {
        messageElement.classList.remove('show');
        // Remove the element after the transition ends
        messageElement.addEventListener('transitionend', () => {
            if (messageArea.contains(messageElement)) {
                messageArea.removeChild(messageElement);
            }
        }, { once: true });
    }, 5000);
}

export function clearMessage(messageArea) {
    clearTimeout(messageTimeout);
    messageArea.innerHTML = '';
    messageArea.style.display = 'none';
}

export function updatePdfViewer(viewerPlaceholder, pdfViewer, pdfPath = null) {
    if (pdfPath) {
        pdfViewer.src = pdfPath;
        viewerPlaceholder.style.display = 'none';
        pdfViewer.style.display = 'block';
    } else {
        viewerPlaceholder.style.display = 'flex';
        pdfViewer.style.display = 'none';
        pdfViewer.src = '';
    }
}

export function setupInitialUI(pdfViewer, viewerPlaceholder, messageArea) {
    pdfViewer.style.display = 'none';
    viewerPlaceholder.style.display = 'flex';
    messageArea.style.display = 'none';
}

export function updateRefreshButton(button, isLoading) {
    button.disabled = isLoading;
    button.innerHTML = isLoading 
        ? '<i class="fas fa-spinner fa-spin"></i> Generating...'
        : '<i class="fas fa-sync-alt"></i> Refresh PDF';
}