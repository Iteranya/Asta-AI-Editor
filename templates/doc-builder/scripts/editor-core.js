// editor-core.js
// Core editor functionality

import { configureMarked, initialMarkdown } from './markdown-config.js';

export class MarkdownEditor {
    constructor() {
        this.markdownInput = document.getElementById('markdown-input');
        this.markdownOutput = document.getElementById('markdown-output');
        
        // Initialize with placeholder content
        this.markdownInput.value = initialMarkdown;
        
        // Configure marked
        configureMarked();
        
        // Set up event listeners
        this.markdownInput.addEventListener('input', () => this.updatePreview());
        const modal = document.createElement('div');
        modal.className = 'rewrite-modal';
        modal.innerHTML = `
            <div class="rewrite-modal-content">
            <div class="rewrite-modal-header">
                <h4>Rewrite Selected Text</h4>
                <span class="close-modal">&times;</span>
            </div>
            <div class="rewrite-modal-body">
                <label for="rewrite-text">Rewrite:</label>
                <input type="text" id="rewrite-text" placeholder="Enter rewrite instructions">
                <button id="apply-rewrite">Apply</button>
            </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Handle right-click on markdown input
        this.markdownInput.addEventListener('contextmenu', (e) => {
            const selectedText = this.markdownInput.value.substring(
            this.markdownInput.selectionStart, 
            this.markdownInput.selectionEnd
            );

            // Only show modal if text is selected
            if (selectedText.trim().length > 0) {
            e.preventDefault(); // Prevent default context menu
            
            // Position modal near mouse
            const modalContent = modal.querySelector('.rewrite-modal-content');
            modal.style.display = 'block';
            
            // Position the modal near the cursor
            const rect = this.markdownInput.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            modalContent.style.left = `${x}px`;
            modalContent.style.top = `${y}px`;
            
            // Focus on input
            setTimeout(() => {
                document.getElementById('rewrite-text').focus();
            }, 10);
            }
        });

        // Close modal when clicking the X
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
            modal.style.display = 'none';
            }
        });

        // Handle apply button click
        const applyButton = document.getElementById('apply-rewrite');
        applyButton.addEventListener('click', () => {
            const rewriteText = document.getElementById('rewrite-text').value;
            const selectedText = this.markdownInput.value.substring(
            this.markdownInput.selectionStart, 
            this.markdownInput.selectionEnd
            );
            
            if (rewriteText && selectedText) {
            // Here you would integrate with your AI rewrite functionality
            // For now, we'll just create a placeholder that wraps the text with markers
            const newText = `[REWRITE: ${rewriteText}] ${selectedText} [/REWRITE]`;
            
            const start = this.markdownInput.selectionStart;
            const end = this.markdownInput.selectionEnd;
            
            // Replace the selected text
            this.markdownInput.value = 
                this.markdownInput.value.substring(0, start) + 
                newText + 
                this.markdownInput.value.substring(end);
            
            // Trigger input event to update preview
            this.markdownInput.dispatchEvent(new Event('input'));
            
            // Close the modal
            modal.style.display = 'none';
            document.getElementById('rewrite-text').value = '';
            }
        });

        // Allow pressing Enter to apply
        document.getElementById('rewrite-text').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
            e.preventDefault();
            applyButton.click();
            }
        });
        
        // Initial rendering
        this.updatePreview();
    }
    
    updatePreview() {
        const markdownText = this.markdownInput.value;
        try {
            this.markdownOutput.innerHTML = marked.parse(markdownText);
        } catch (error) {
            console.error("Error parsing Markdown:", error);
            this.markdownOutput.innerHTML = `<p style="color: var(--accent-error);">Error parsing Markdown. Please check your syntax.</p>`;
        }
    }
    
    getValue() {
        return this.markdownInput.value;
    }
    
    setValue(value) {
        this.markdownInput.value = value;
        this.updatePreview();
    }
    
    appendValue(value) {
        this.markdownInput.value += value;
        this.updatePreview();
    }
    
    scrollToBottom() {
        this.markdownInput.scrollTop = this.markdownInput.scrollHeight;
    }
}

export function toggleSidebar() {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    const sidebarToggle = document.getElementById('sidebar-toggle')
    
    const mainContent = document.getElementById('main-content');
    mainContent.classList.toggle('sidebar-collapsed', isCollapsed);

    // Update toggle button icon
    const icon = sidebarToggle.querySelector('i');
    if (isCollapsed) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
        sidebarToggle.setAttribute('aria-label', 'Expand Sidebar');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
        sidebarToggle.setAttribute('aria-label', 'Collapse Sidebar');
    }
}