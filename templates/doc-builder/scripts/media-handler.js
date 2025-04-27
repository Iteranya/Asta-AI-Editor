

export function setupImagePasteHandler() {
  const markdownInput = document.getElementById('markdown-input');
  
  const slug = document.getElementById('slug-container').textContent
  console.log("The current slug: "+slug)

  markdownInput.addEventListener('paste', async (event) => {
    if (event.clipboardData && event.clipboardData.items) {
      const items = event.clipboardData.items;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          event.preventDefault();
          
          const file = items[i].getAsFile();
          if (!file) continue;
          
          const timestamp = new Date().getTime();
          const filename = `pasted_image_${timestamp}.${file.name.split('.').pop() || 'png'}`;
          
          // Build final filename with slug if exists
          const finalFilename = slug ? `${slug}/${filename}` : filename;
          const uploadEndpoint = slug ? '/files' : '/media';

          try {
            showNotification('Uploading image...', 'info');
            
            const formData = new FormData();
            formData.append('file', new File([file], finalFilename, { type: file.type }));
            
            const response = await fetch(uploadEndpoint, {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              throw new Error('Failed to upload image');
            }
            
            const data = await response.json();
            
            const cursorPos = markdownInput.selectionStart;
            const imageMarkdown = `![${filename}](${uploadEndpoint}/${data.filename})`;
            
            const textBefore = markdownInput.value.substring(0, cursorPos);
            const textAfter = markdownInput.value.substring(cursorPos);
            markdownInput.value = textBefore + imageMarkdown + textAfter;
            
            markdownInput.selectionStart = markdownInput.selectionEnd = cursorPos + imageMarkdown.length;
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