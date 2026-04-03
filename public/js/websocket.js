// WebSocket connection for real-time updates
let socket = null;
let currentTaskId = null;

function connectWebSocket() {
    console.log('🔌 Attempting to connect WebSocket...');
    
    try {
        socket = io('/', {
            transports: ['websocket', 'polling']
        });
        
        socket.on('connect', () => {
            console.log('✅ WebSocket connected!', socket.id);
            updateConnectionStatus(true);
            
            // Check if we're on a task detail page
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch) {
                currentTaskId = parseInt(taskIdMatch[1]);
                socket.emit('join-task', currentTaskId);
                console.log(`📌 Joined task room: ${currentTaskId}`);
            } else {
                // On tasks list page, join all tasks
                socket.emit('join-task', 'all');
                console.log('📌 Joined all tasks room');
            }
        });
        
        socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            updateConnectionStatus(false);
        });
        
        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            updateConnectionStatus(false);
        });
        
        // Handle status changes
        socket.on('status-changed', (data) => {
            console.log('🔄 Status changed:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                // On task detail page, update the status dropdown
                const statusSelect = document.getElementById('inlineStatus');
                if (statusSelect && statusSelect.value !== data.newStatus) {
                    statusSelect.value = data.newStatus;
                    showNotification(`Status changed to ${data.newStatus}`, 'info');
                }
                // Refresh activity log
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
            } else if (typeof window.loadTasks === 'function') {
                // On tasks list page, reload the list
                window.loadTasks();
            }
        });
        
        // Handle priority changes
        socket.on('priority-changed', (data) => {
            console.log('📊 Priority changed:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                const prioritySelect = document.getElementById('inlinePriority');
                if (prioritySelect && prioritySelect.value !== data.newPriority) {
                    prioritySelect.value = data.newPriority;
                    showNotification(`Priority changed to ${data.newPriority}`, 'info');
                }
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
        // Handle assignee changes
        socket.on('assignee-changed', (data) => {
            console.log('👤 Assignee changed:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
                // Reload page to update assignee name
                setTimeout(() => window.location.reload(), 1000);
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
        // Handle new comments
        socket.on('comment-added', (data) => {
            console.log('💬 Comment added:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                if (typeof refreshComments === 'function') {
                    refreshComments();
                }
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
                showNotification('New comment added!', 'info');
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
        // Handle task updates (title, description, due date, category)
        socket.on('task-update', (data) => {
            console.log('📝 Task update:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
                showNotification('Task has been updated', 'info');
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
        // Handle archive events
        socket.on('task-archived', (data) => {
            console.log('📦 Task archived:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                showNotification('This task has been archived', 'warning');
                setTimeout(() => window.location.href = '/', 2000);
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
        // Handle restore events
        socket.on('task-restored', (data) => {
            console.log('🔄 Task restored:', data);
            
            const taskIdMatch = window.location.pathname.match(/\/task\/(\d+)/);
            if (taskIdMatch && parseInt(taskIdMatch[1]) === data.taskId) {
                showNotification('Task has been restored', 'success');
                if (typeof refreshActivityLog === 'function') {
                    refreshActivityLog();
                }
                if (typeof updateLastUpdated === 'function') {
                    updateLastUpdated();
                }
            } else if (typeof window.loadTasks === 'function') {
                window.loadTasks();
            }
        });
        
    } catch (error) {
        console.error('WebSocket initialization error:', error);
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(isConnected) {
    const statusDiv = document.getElementById('connectionStatus');
    if (!statusDiv) return;
    
    const dot = statusDiv.querySelector('.status-dot');
    const textSpan = statusDiv.querySelector('span:last-child');
    
    if (isConnected) {
        dot.className = 'status-dot connected';
        textSpan.textContent = 'Live Updates Active';
        console.log('🟢 WebSocket status updated to: Connected');
    } else {
        dot.className = 'status-dot disconnected';
        textSpan.textContent = 'Disconnected';
        console.log('🔴 WebSocket status updated to: Disconnected');
        
        // Try to reconnect after 5 seconds
        setTimeout(() => {
            if (!socket || !socket.connected) {
                console.log('🔄 Attempting to reconnect WebSocket...');
                connectWebSocket();
            }
        }, 5000);
    }
}

function showNotification(message, type) {
    // Check if we're on task detail page and function exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
            color: ${type === 'warning' ? '#333' : 'white'};
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize WebSocket when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectWebSocket);
} else {
    connectWebSocket();
}