import ToastManager from '../utils/ToastManager.js';
import {
    handleEmailInput,
    handlePasswordInput,
    handleGoogleIdInput,
} from '../events/eventHandlers.js';
import Utils from '../utils/utils.js';
export default class LoginService {
    checkLogin() {
        const userEmail = localStorage.getItem('userEmail');
        const userPassword = localStorage.getItem('userPassword');
        const sheetId = localStorage.getItem('sheetId');
        if (!userEmail || !userPassword || !sheetId) {
            $('#loginModal').modal('show');
        } else {
            this.loginUsuario(userEmail, userPassword, true);
        }
    }

    submitLogin() {
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        const sheetUrl = $('#sheetUrl').val().trim();
        const sheetName = $('#sheetSelector').val();

        if (!this.validateInputs(email, password, sheetUrl, sheetName)) return;
        this.toggleSpinner(true);

        const sheetId = Utils.getSheetId(sheetUrl);

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'cadastro',
                email: email,
                password: password,
                sheetId: sheetId,
                sheetName: sheetName,
            }),
            success: (response) => {
                this.toggleSpinner(false);
                if (response.status === 'success') {
                    ToastManager.showSuccess('Cadastrado com sucesso!');
                    this.storeCredentials(email, password, sheetId, sheetName);
                    $('#loginModal').modal('hide');
                } else {
                    ToastManager.showError(
                        'Erro ao cadastrar usuário: ' + response.message
                    );
                }
            },
            error: (error) => {
                this.toggleSpinner(false);
                ToastManager.showError(
                    'Erro ao enviar os dados: ' + error.responseText
                );
            },
        });
    }

    loginUsuario(userEmail, userPassword, isAutocheck = false) {
        this.toggleSpinner(true);
        const email = $('#email').val().trim() || userEmail;
        const password = $('#password').val().trim() || userPassword;

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'login',
                email: email,
                password: password,
            }),
            success: (response) => {
                this.toggleSpinner(false);
                if (!response.findEmail || response.status === 'error') {
                    if (this.wrongPassword(response.wrongPassword)) return;
                    if (!isAutocheck) {
                        this.showRegister();
                    }

                    $('#loginModal').modal('show');
                    this.clearLocalStorage();
                } else if (response.status === 'success') {
                    ToastManager.showSuccess('Login bem-sucedido!');
                    $('#loginModal').modal('hide');
                    this.storeCredentials(
                        email,
                        password,
                        response.sheetId,
                        response.sheetName
                    );
                }
            },
            error: (error) => {
                this.toggleSpinner(false);
                ToastManager.showError('Erro ao fazer login: ' + error.message);
            },
        });
    }

    validateInputs(email, password, sheetId, sheetName) {
        return (
            handleEmailInput(email) &&
            handlePasswordInput(password) &&
            handleGoogleIdInput(sheetId) &&
            handleGoogleIdInput(sheetName)
        );
    }

    storeCredentials(email, password, sheetId, sheetName) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('sheetId', sheetId);
        localStorage.setItem('sheetName', sheetName);
    }

    clearLocalStorage() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        localStorage.removeItem('sheetId');
        localStorage.removeItem('sheetName');
    }
    toggleSpinner(isLoading) {
        $('#loginText').toggleClass('d-none', isLoading);
        $('.spinner').toggleClass('d-none', !isLoading);
        $('#login, #register').prop('disabled', isLoading);
    }

    showRegister() {
        $('#login').addClass('d-none');
        $('#register').removeClass('d-none').prop('disabled', true);
        $('#sheetIdContainer').removeClass('d-none');
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
