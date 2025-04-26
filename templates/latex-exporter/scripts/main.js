const latexEditor = document.getElementById('latex-editor');
const pdfViewer = document.getElementById('pdf-viewer');
const pdfViewerContainer = document.getElementById('pdf-viewer-container');
const viewerPlaceholder = document.getElementById('viewer-placeholder');
const refreshButton = document.getElementById('refresh-button');
const loadingOverlay = document.getElementById('loading-overlay');
const messageArea = document.getElementById('message-area');

// Hardcoded title for the PDF file
const pdfTitle = 'output.pdf';

// --- API Interaction ---
async function generatePdf() {
    const latexContent = latexEditor.value;
    if (!latexContent.trim()) {
        displayMessage('LaTeX content cannot be empty.', 'error');
        return;
    }

    showLoading(true);
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    clearMessage(); // Clear previous messages

    try {
        const apiUrl = '/generate-pdf/'; // Assuming the API is served from the same origin

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                output_filename: pdfTitle,
                tex_content: latexContent
            })
        });


        const result = await response.json();

        if (response.ok) {
            displayMessage(result.message || 'PDF generated successfully!', 'success');
            const pdfPath = `/file/${pdfTitle}?t=${new Date().getTime()}`; 
            pdfViewer.src = pdfPath;
            viewerPlaceholder.style.display = 'none'; // Hide placeholder
            pdfViewer.style.display = 'block'; // Show iframe

        } else {
            // Handle API errors (e.g., validation errors, server errors)
            console.error('API Error:', result);
            let errorMessage = 'Failed to generate PDF.';
            if (result.detail) {
                // FastAPI validation errors often come in `detail`
                if (Array.isArray(result.detail)) {
                   errorMessage = result.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('; ');
                } else if (typeof result.detail === 'string') {
                    errorMessage = result.detail;
                }
            } else if (result.message) {
                errorMessage = result.message;
            }
            displayMessage(errorMessage, 'error');
             viewerPlaceholder.style.display = 'flex'; // Show placeholder again on error
             pdfViewer.style.display = 'none';
             pdfViewer.src = ''; // Clear src on error
        }

    } catch (error) {
        console.error('Network or Frontend Error:', error);
        displayMessage('An error occurred: ' + error.message, 'error');
         viewerPlaceholder.style.display = 'flex'; // Show placeholder again on error
         pdfViewer.style.display = 'none';
         pdfViewer.src = ''; // Clear src on error
    } finally {
        showLoading(false);
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh PDF';
    }
}

// --- UI Interaction ---
refreshButton.addEventListener('click', generatePdf);

function showLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

 let messageTimeout;
function displayMessage(message, type = 'info') {
     clearTimeout(messageTimeout); // Clear existing timeout if any
     messageArea.innerHTML = ''; // Clear previous messages immediately

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageArea.appendChild(messageElement);

    // Trigger reflow to enable transition
    void messageElement.offsetWidth;

    messageElement.classList.add('show');

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

 function clearMessage() {
    clearTimeout(messageTimeout);
    messageArea.innerHTML = '';
}

// Initial setup
pdfViewer.style.display = 'none'; // Hide iframe initially
viewerPlaceholder.style.display = 'flex'; // Show placeholder
messageArea.style.display = 'none'


// Add basic keyboard shortcut (Ctrl+S or Cmd+S) for refreshing
latexEditor.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's save action
        refreshButton.click(); // Trigger the refresh action
        displayMessage('Refreshing PDF (Ctrl+S)...', 'info');
    }
});
