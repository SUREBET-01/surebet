import Validation from '../utils/Validation.js';
import ToastManager from '../utils/ToastManager.js';
import BetManager from '../models/BetManager.js';
import {
    handlePromoNameInput,
    handleFreeBetExpiryInput,
    handleFreeBetReturnInput,
    handleCpfCountInput,
    handleGoogleIdInput,
} from '../events/eventHandlers.js';
export default class GoogleSheetsService {
    constructor(BetManager) {
        this.betManager = BetManager;
    }

    saveToGoogleSheets() {
        const totalStake = parseFloat($('#totalStake').val());
        const bets = this.betManager.bets.map((bet) => ({
            bettingHouse: bet.bettingHouse,
            odd: bet.odd,
            stake: bet.stake,
            grossProfit: bet.isLayBet
                ? BetManager.calculateLayGrossProfit(bet)
                : BetManager.calculateBackGrossProfit(bet),
            probability: bet.probability,
            commission: bet.commission,
            profit: bet.profit,
        }));

        const isFreeBet = $('#isFreeBet').is(':checked');
        const promoName = $('#promoName').val();
        const freeBetExpiry = $('#freeBetExpiry').val();
        const freeBetReturn = parseFloat($('#freeBetReturn').val());
        const accoutsUsed = parseInt($('#cpfCount').val());
        const netProfit = parseFloat($('#avaregeProfit').text());
        const roi = parseFloat($('#roi').text());
        const surebetId = Date.now();

        if (!Validation.isValidTotalStake(totalStake)) {
            ToastManager.showError(
                'Por favor, corrija os erros nos campos antes de salvar.'
            );
            return;
        }

        const isPromoNameValid = handlePromoNameInput();
        const isFreeBetExpiryValid = handleFreeBetExpiryInput();
        const isFreeBetReturnValid = handleFreeBetReturnInput();
        const iscpfInput = handleCpfCountInput();

        if (
            !isPromoNameValid ||
            !isFreeBetExpiryValid ||
            !isFreeBetReturnValid ||
            !iscpfInput
        )
            return;

        $('#loadingModal').modal('show');
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec', // Replace with your Google Script URL
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'salvarDados',
                bets: bets,
                totalStake: totalStake,
                netProfit: netProfit,
                roi: roi,
                surebetId: surebetId,
                isFreeBet: isFreeBet,
                promoName: promoName,
                freeBetExpiry: freeBetExpiry,
                freeBetReturn: freeBetReturn,
                accoutsUsed: accoutsUsed,
                sheetId: localStorage.getItem('sheetId'),
                sheetName: localStorage.getItem('sheetName'),
            }),
            success: (response) => {
                $('#loadingModal').modal('hide');
                if (response.status === 'success') {
                    ToastManager.showSuccess(
                        'Dados salvos com sucesso! Surebet ID: ' +
                            response.surebetId
                    );
                } else {
                    ToastManager.showError(
                        'Erro ao salvar os dados: ' + response.message
                    );
                }
            },
            error: (error) => {
                $('#loadingModal').modal('hide');
                ToastManager.showError(
                    'Erro ao enviar os dados: ' + error.responseText
                );
            },
        });
    }
    verifyTable() {
        const sheetId = $('#sheetId').val();
        const importButton = $('#importSheets');
        const importText = $('#importText');
        const importSpinner = $('#importSpinner');

        if (!handleGoogleIdInput(sheetId)) return;

        // Desabilita o botão e exibe o spinner
        importButton.prop('disabled', true);
        importText.addClass('d-none');
        importSpinner.removeClass('d-none');

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec',
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
                action: 'verifyTable',
                sheetId: sheetId,
            }),
            success: (response) => {
                if (response.status === 'success') {
                    ToastManager.showSuccess(
                        `${response.sheetNames.length} planilhas importadas com sucesso!`
                    );
                    this.shetsOption(response.sheetNames);
                } else {
                    ToastManager.showError(
                        'Erro ao importar: ' + response.message
                    );
                }
            },
            error: (error) => {
                ToastManager.showError('Erro ao importar: ' + error.message);
            },
            complete: () => {
                // Reabilita o botão e esconde o spinner após a requisição
                importButton.prop('disabled', false);
                importText.removeClass('d-none');
                importSpinner.addClass('d-none');
            },
        });
    }

    shetsOption(shetsNames) {
        const sheetSelector = $('#sheetSelector');
        sheetSelector.empty();
        sheetSelector.append('<option value="">Selecione...</option>');

        shetsNames.forEach((sheet) => {
            sheetSelector.append(`<option value="${sheet}">${sheet}</option>`);
        });

        $('#sheetSelectorContainer').removeClass('d-none');
    }
}
