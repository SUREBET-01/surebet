import Validation from '../utils/Validation.js';
import ToastManager from '../utils/ToastManager.js';
import {
    handlePromoNameInput,
    handleFreeBetExpiryInput,
    handleFreeBetReturnInput,
} from '../events/eventHandlers.js';
export default class GoogleSheetsService {
    constructor(betManager) {
        this.betManager = betManager;
    }

    saveToGoogleSheets() {
        const totalStake = parseFloat($('#totalStake').val());
        const bets = this.betManager.bets.map((bet) => ({
            bettingHouse: bet.bettingHouse,
            odd: bet.odd,
            stake: bet.stake,
            netReturn: bet.getNetReturn(),
            probability: 0, // Placeholder
            commission: 0, // Placeholder
            netReturnByBet: (bet.getNetReturn() - totalStake).toFixed(2),
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

        if (!isPromoNameValid || !isFreeBetExpiryValid || !isFreeBetReturnValid)
            return;

        $('#loadingModal').modal('show');
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwryZxhplBkvuvPBQF45zAvmc7MChMQMUkjUozY5feFabKPJY-aj9DrBhpgiA0djM48/exec', // Replace with your Google Script URL
            type: 'POST',
            contentType: 'text/plain',
            data: JSON.stringify({
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
}
