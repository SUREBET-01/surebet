import ToastManager from '../utils/ToastManager.js';
import {
    handleEmailInput,
    handlePasswordInput,
} from '../events/eventHandlers.js';
export default class LoginService {
    checkLogin() {
        const userEmail = localStorage.getItem('userEmail');
        const userPassword = localStorage.getItem('userPassword');
        const userId = localStorage.getItem('userId');
        if (!userEmail || !userPassword || !userId) {
            $('#loginModal').modal('show');
        } else {
            this.loginUsuario(userEmail, userPassword, true);
        }
    }

    loginUsuario(userEmail, userPassword, isAutocheck = false) {
        const email = $('#email').val() || userEmail;
        const password = $('#password').val() || userPassword;
        const userId = Date.now();
        if (!isAutocheck) {
            if (!this.validateInputsLogin(email, password)) return;
            this.toggleSpinner(true);
        }
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'login',
                userId: userId,
                email: email,
                password: password,
            }),
            success: (response) => {
                this.toggleSpinner(false);
                if (!response.findEmail || response.status === 'error') {
                    if (this.wrongPassword(response.wrongPassword)) {
                        $('#loginModal').modal('show');
                        return;
                    }

                    $('#loginModal').modal('show');
                    this.clearLocalStorage();
                } else if (response.status === 'success') {
                    ToastManager.showSuccess('Login bem-sucedido!');
                    $('#loginModal').modal('hide');
                    this.storeCredentials(
                        response.email,
                        password,
                        response.userId
                    );
                    console.log(response);
                }
            },
            error: (error) => {
                this.toggleSpinner(false);
                ToastManager.showError('Erro ao fazer login: ' + error.message);
            },
        });
    }

    validateInputsLogin(email, password) {
        return handleEmailInput(email) && handlePasswordInput(password);
    }

    storeCredentials(email, password, userId) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userId', userId);
    }

    clearLocalStorage() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        localStorage.removeItem('userId');
    }
    toggleSpinner(isLoading) {
        $('#loginText').toggleClass('d-none', isLoading);
        $('.spinner').toggleClass('d-none', !isLoading);
        $('#login, #register').prop('disabled', isLoading);
    }

    wrongPassword(wrongPassword) {
        if (wrongPassword) {
            $('#password').addClass('is-invalid');
            ToastManager.showError('Please enter a valid password.');
            return true;
        } else {
            $('#password').removeClass('is-invalid');
            return false;
        }
    }
}
