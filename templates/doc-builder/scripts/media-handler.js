

export function setupImagePasteHandler() {
    const markdownInput = document.getElementById('markdown-input');
    
    markdownInput.addEventListener('paste', async (event) => {
      // Check if the pasted content has items (for file content)
      if (event.clipboardData && event.clipboardData.items) {
        const items = event.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          // Check if the item is an image
          if (items[i].type.indexOf('image') !== -1) {
            // Prevent default paste behavior for images
            event.preventDefault();
            
            // Get the file from clipboard
            const file = items[i].getAsFile();
            if (!file) continue;
            
            // Create a unique filename with timestamp
            const timestamp = new Date().getTime();
            const filename = `pasted_image_${timestamp}.${file.name.split('.').pop() || 'png'}`;
            
            try {
              // Show loading state
              showNotification('Uploading image...', 'info');
              
              // Create a FormData object to send the file
              const formData = new FormData();
              formData.append('file', new File([file], filename, { type: file.type }));
              
              // Upload the file using the API
              const response = await fetch('/media/', {
                method: 'POST',
                body: formData
              });
              
              if (!response.ok) {
                throw new Error('Failed to upload image');
              }
              
              const data = await response.json();
              
              // Get cursor position
              const cursorPos = markdownInput.selectionStart;
              
              // Create markdown image link
              const imageMarkdown = `![${filename}](/media/${data.filename})`;
              
              // Insert at cursor position
              const textBefore = markdownInput.value.substring(0, cursorPos);
              const textAfter = markdownInput.value.substring(cursorPos);
              markdownInput.value = textBefore + imageMarkdown + textAfter;
              
              // Update cursor position
              markdownInput.selectionStart = markdownInput.selectionEnd = cursorPos + imageMarkdown.length;
              
              // Trigger input event to update preview
              markdownInput.dispatchEvent(new Event('input'));
              
              showNotification('Image uploaded successfully!', 'success');
            } catch (error) {
              console.error('Error uploading image:', error);
              showNotification('Failed to upload image: ' + error.message, 'error');
            }
          }
        }
      }
    });
  }

  function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 3000);
  }