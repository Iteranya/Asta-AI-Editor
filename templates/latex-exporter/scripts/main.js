// main.js - Main application module
import { generatePdf, loadProject, generateLatex} from './api.js';
import { 
    showLoading, 
    displayMessage, 
    clearMessage, 
    updatePdfViewer, 
    setupInitialUI,
    updateRefreshButton
} from './ui.js';

// Constants
const PDF_TITLE = 'output.pdf';

// Initialize the application
export function initApp() {
    // Get DOM elements
    const latexEditor = document.getElementById('latex-editor');
    const pdfViewer = document.getElementById('pdf-viewer');
    const viewerPlaceholder = document.getElementById('viewer-placeholder');
    const refreshButton = document.getElementById('refresh-button');
    const loadingOverlay = document.getElementById('loading-overlay');
    const messageArea = document.getElementById('message-area');
    const slug = document.getElementById('slug-container')

    // Load Latex if any
    async function initializeProject() {
        let currentProject = await loadProject(slug.textContent);
    
        if (currentProject == null) {
            console.error("Failed to load project.");
            return;
        }
    
        if (currentProject.latex == null || currentProject.latex == "") {
            let new_latex = await generateLatex(currentProject);
            latexEditor.value = new_latex;
        } else {
            latexEditor.value = currentProject.latex;
        }
    }

        // Generate PDF handler
        function handleGeneratePdf() {
            const latexContent = latexEditor.value;
            
            generatePdf(latexContent, PDF_TITLE, {
                onStart: () => {
                    updateRefreshButton(refreshButton, true);
                    showLoading(loadingOverlay, true);
                    clearMessage(messageArea);
                },
                onSuccess: (message, pdfPath) => {
                    displayMessage(messageArea, message, 'success');
                    updatePdfViewer(viewerPlaceholder, pdfViewer, pdfPath);
                },
                onError: (errorMessage) => {
                    displayMessage(messageArea, errorMessage, 'error');
                    updatePdfViewer(viewerPlaceholder, pdfViewer);
                },
                onComplete: () => {
                    updateRefreshButton(refreshButton, false);
                    showLoading(loadingOverlay, false);
                }
            });
        }

    // Setup initial UI state
    setupInitialUI(pdfViewer, viewerPlaceholder, messageArea);
    initializeProject()

    // Register event handlers
    refreshButton.addEventListener('click', () => handleGeneratePdf());

    // Add keyboard shortcuts
    latexEditor.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleGeneratePdf();
            displayMessage(messageArea, 'Refreshing PDF (Ctrl+S)...', 'info');
        }
    });


}