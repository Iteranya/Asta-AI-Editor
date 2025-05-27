// main.js
// Main entry point that initializes all modules

import { MarkdownEditor, toggleSidebar } from './editor-core.js';
import { NotificationSystem } from './notification-system.js';
import { ScrollSynchronizer } from './scroll-sync.js';
import { AiGenerator } from './ai-integration.js';
import { setupImagePasteHandler } from './media-handler.js';
import { ButtonHandlers } from './button-handler.js';

// Global variable to track unsaved changes
let hasUnsavedChanges = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the editor
    const editor = new MarkdownEditor();
    
    // Initialize scroll synchronization
    const inputElement = document.getElementById('markdown-input');
    const outputElement = document.getElementById('markdown-output');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const side_panel = document.getElementById('sidebar-textarea');
    const slug = document.getElementById('slug-container').textContent;
    
    setupImagePasteHandler();
    
    // Set up unsaved changes warning
    setupUnsavedChangesWarning(inputElement, side_panel);

    // Initialize buttons
    initializeButtons(slug, inputElement, side_panel);

    // Initialize AI generation
    const aiGenerator = new AiGenerator(editor);
    sidebarToggle.addEventListener('click', toggleSidebar);
    console.log('Markdown editor initialized successfully!');
});

function setupUnsavedChangesWarning(inputElement, sidePanel) {
    // Track changes in markdown input
    inputElement.addEventListener('input', () => {
        hasUnsavedChanges = true;
    });

    // Track changes in sidebar panel
    sidePanel.addEventListener('input', () => {
        hasUnsavedChanges = true;
    });

    // Warn before page unload
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });
}

function markAsSaved() {
    hasUnsavedChanges = false;
}

function initializeButtons(slug, inputElement, sidePanel) {
    const actionButton = document.getElementById('action-button');
    const projectButton = document.getElementById('project-button');
    const latexButton = document.getElementById('latex-button');

    // Handle action button
    if (actionButton) {
        if (slug == null || slug == "") {
            actionButton.style.display = 'none';
            projectButton.style.display = 'none';
            latexButton.style.display = 'none';
        } else {
            actionButton.addEventListener('click', () => 
                ButtonHandlers.handleActionButton(slug, inputElement.value, sidePanel.value)
            );
        }
    }

    // Handle project button with save tracking
    if (projectButton) {
        projectButton.addEventListener('click', async () => {
            try {
                await ButtonHandlers.handleProjectButton(slug, inputElement.value, sidePanel.value);
                markAsSaved();
            } catch (error) {
                console.error('Project save failed:', error);
            }
        });
    }

    // Handle latex button
    if (latexButton) {
        latexButton.addEventListener('click', () => 
            ButtonHandlers.handleLatexButton(slug, inputElement.value, sidePanel.value)
        );
    }
}