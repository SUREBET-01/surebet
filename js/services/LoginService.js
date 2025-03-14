import ToastManager from '../utils/ToastManager.js';
import {
    handleEmailInput,
    handlePasswordInput,
    handleGoogleIdInput,
} from '../events/eventHandlers.js';
import Validation from '../utils/Validation.js';

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

        const email = $('#email').val();
        const password = $('#password').val();
        const sheetId = $('#sheetId').val();
        const sheetName = $('#sheetSelector').val();

        if (
            !handleEmailInput(email) ||
            !handlePasswordInput(password) ||
            !handleGoogleIdInput(sheetId) ||
            !handleGoogleIdInput(sheetName)
        )
            return;
            this.showSpinner();

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwryZxhplBkvuvPBQF45zAvmc7MChMQMUkjUozY5feFabKPJY-aj9DrBhpgiA0djM48/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'cadastro',
                email: email,
                password: password,
                sheetId: sheetId,
            }),
            success: (response) => {
                if (response.status === 'success') {
                    ToastManager.showSuccess('Cadastrado com successo! ');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userPassword', password);
                    localStorage.setItem('sheetId', sheetId);
                    localStorage.setItem('sheetName', sheetName);
                    $('#loginModal').modal('hide');
                } else {
                    ToastManager.showError(
                        'Erro ao cadastrar usuário: ' + response.message
                    );
                }
                this.hideSpinner();
            },
            error: (error) => {
                ToastManager.showError(
                    'Erro ao enviar os dados: ' + error.responseText
                );
                this.hideSpinner();
            },
        });
    }
    loginUsuario(userEmail, userPassword, isAutocheck = false) {
        this.showSpinner();
        const email = $('#email').val().trim() || userEmail;
        const password = $('#password').val() || userPassword;
        const isValidemail = handleEmailInput(email);
        const isValidPassword = handlePasswordInput(password);

        if (!isValidemail || !isValidPassword) return;

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwryZxhplBkvuvPBQF45zAvmc7MChMQMUkjUozY5feFabKPJY-aj9DrBhpgiA0djM48/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'login',
                email: email,
                password: password,
            }),
            success: (response) => {
                if (!response.findEmail) {
                    if (!isAutocheck) {
                        this.showRegister();
                    }
                    this.hideSpinner();
                    $('#loginModal').modal('show');
                    localStorage.setItem('userEmail', '');
                    localStorage.setItem('userPassword', '');
                    localStorage.setItem('sheetId', '');
                }
                if (response.status === 'success') {
                    ToastManager.showSuccess('Login bem-sucedido!');
                    $('#loginModal').modal('hide');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userPassword', password);
                    localStorage.setItem('sheetId', response.sheetId);
                }
            },
            error: (error) => {
                ToastManager.showError('Erro ao fazer login: ' + error.message);
                this.hideSpinner();
            },
        });
    }

    showSpinner() {
        $('#loginText').addClass('d-none');
        $('.spinner').removeClass('d-none');
        $('#login').prop('disabled', true);
        $('#register').prop('disabled', true);
    }

    hideSpinner() {
        $('#loginText').removeClass('d-none');
        $('.spinner').addClass('d-none');
        $('#login').prop('disabled', false);
        $('#register').prop('disabled', false);
    }

    showRegister() {
        $('#login').addClass('d-none');
        $('#register').removeClass('d-none');
        $('#sheetIdContainer').removeClass('d-none');
        $('#register').prop('disabled', true);
    }

    hideRegister() {
        $('#login').removeClass('d-none');
        $('#register').addClass('d-none');
    }
}
