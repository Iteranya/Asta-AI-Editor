// main.js
// Main entry point that initializes all modules

import { MarkdownEditor,toggleSidebar } from './editor-core.js';
import { NotificationSystem } from './notification-system.js';
import { ScrollSynchronizer } from './scroll-sync.js';
import { AiGenerator } from './ai-integration.js';
import { setupImagePasteHandler } from './media-handler.js';
import { updateProject,getProject } from './db-integration.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the editor
    const editor = new MarkdownEditor();
    
    // Initialize scroll synchronization
    const inputElement = document.getElementById('markdown-input');
    const outputElement = document.getElementById('markdown-output');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const side_panel =  document.getElementById('sidebar-textarea');
    const slug = document.getElementById('slug-container').textContent;
    setupImagePasteHandler();

    const actionButton = document.getElementById('action-button');

    if (actionButton) {
        if (slug == null || slug.trim() === "") {
            actionButton.style.display = 'none'; // Hide the button
        } else {
            actionButton.addEventListener('click', function() {
                getProject(slug)
                    .then(project_data => {
                        project_data.ai_notes = side_panel.value;
                        project_data.markdown = inputElement.value;
                        updateProject(slug, project_data)
                            .then(result => {
                                console.log(result)
                                NotificationSystem.show('Project updated successfully!', 'success');
                            })
                            .catch(error => {
                                console.error("Error updating project:", error);
                                NotificationSystem.show(`Failed to update project: ${error.message}`, 'error');
                            });
                    })
                    .catch(error => {
                        console.error("Error fetching project:", error);
                        NotificationSystem.show(`Failed to load project: ${error.message}`, 'error');
                    });
            });
        }
    }

    
    // Initialize AI generation
    const aiGenerator = new AiGenerator(editor);
    sidebarToggle.addEventListener('click', toggleSidebar);
    console.log('Markdown editor initialized successfully!');
});