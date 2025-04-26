// notification-system.js
// System for displaying temporary notifications

export class NotificationSystem {
    /**
     * Shows a temporary notification message.
     * @param {string} message - The message to display.
     * @param {'success' | 'error'} type - The type of notification.
     */
    static show(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message; // Use innerHTML to allow basic formatting like icons
        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto-hide after a delay
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            // Remove from DOM after fade out animation
            setTimeout(() => notification.remove(), 300);
        }, 3000); // Show for 3 seconds
    }
}