class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = '';
        switch (type) {
            case 'success':
                icon = 'fa-circle-check';
                break;
            case 'error':
                icon = 'fa-circle-xmark';
                break;
            case 'warning':
                icon = 'fa-triangle-exclamation';
                break;
            default:
                icon = 'fa-circle-info';
        }

        notification.innerHTML = `
            <i class="fas ${icon} notification-icon"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));

        if (duration > 0) {
            setTimeout(() => this.close(notification), duration);
        }

        return notification;
    }

    close(notification) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentElement === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }

    success(message, title = '') {
        return this.show({ type: 'success', title, message });
    }

    error(message, title = '') {
        return this.show({ type: 'error', title, message });
    }

    info(message, title = '') {
        return this.show({ type: 'info', title, message });
    }

    warning(message, title = '') {
        return this.show({ type: 'warning', title, message });
    }
}

// Global notification instance
window.notifications = new NotificationSystem(); 