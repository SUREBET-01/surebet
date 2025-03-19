export default class ToastManager {
   static showError(message) {
        Toastify({
            text: message,
            duration: 5000,
            close: true,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc3a0)',
        }).showToast();
    }

    static showSuccess(message) {
        Toastify({
            text: message,
            duration: 5000,
            close: true,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
        }).showToast();
    }
}