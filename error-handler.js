'''// error-handler.js
class ErrorHandler {
    static show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger the animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove the toast after a few seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove from DOM after transition ends
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
    
    static handleFirebaseError(error) {
        console.error("Firebase Error:", error.code, error.message);
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email. Please check your credentials or sign up.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'This email is already registered. Please log in.',
            'auth/invalid-email': 'The email address is not valid.',
            'auth/weak-password': 'The password is too weak. It must be at least 6 characters long.',
            'auth/requires-recent-login': 'This action is sensitive and requires recent authentication. Please log in again.',
            'permission-denied': 'You do not have permission to perform this action.',
            'not-found': 'The requested data could not be found.',
            'unavailable': 'The service is currently unavailable. Please try again later.'
        };
        
        const message = errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
        this.show(message, 'error');
    }
}
'''