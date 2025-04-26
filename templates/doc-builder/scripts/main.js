// main.js
// Main entry point that initializes all modules

import { MarkdownEditor,toggleSidebar } from './editor-core.js';
import { ScrollSynchronizer } from './scroll-sync.js';
import { AiGenerator } from './ai-integration.js';
import { setupImagePasteHandler } from './media-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the editor
    const editor = new MarkdownEditor();
    
    // Initialize scroll synchronization
    const inputElement = document.getElementById('markdown-input');
    const outputElement = document.getElementById('markdown-output');
    const sidebarToggle = document.getElementById('sidebar-toggle')
    setupImagePasteHandler();
    
    // Initialize AI generation
    const aiGenerator = new AiGenerator(editor);
    sidebarToggle.addEventListener('click', toggleSidebar);
    console.log('Markdown editor initialized successfully!');
});