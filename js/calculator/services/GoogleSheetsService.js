import Validation from '../../utils/Validation.js';
import ToastManager from '../../utils/ToastManager.js';
import BetManager from '../models/BetManager.js';
import {
    handlePromoNameInput,
    handleFreeBetExpiryInput,
    handleFreeBetReturnInput,
    handleCpfCountInput,
} from '../events/eventHandlers.js';
import { ApiHelper } from '../../utils/ApiHelper.js';



export default class GoogleSheetsService {
    constructor(BetManager) {
        this.betManager = BetManager;
    }

    async saveToGoogleSheets() {
        try {
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
            const userId = localStorage.getItem('userId');

            if (!Validation.isValidTotalStake(totalStake)) {
                ToastManager.showError(
                    'Por favor, corrija os erros nos campos antes de salvar.'
                );
                return;
            }
            if (!this.validateFreeBetInputs() || !handleCpfCountInput()) return;

            $('#loadingModal').modal('show');

            const response = await ApiHelper.makeRequest('salvarDados', {
                userId,
                bets,
                totalStake,
                netProfit,
                roi,
                surebetId,
                isFreeBet,
                promoName,
                freeBetExpiry,
                freeBetReturn,
                accoutsUsed,
            });

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
        } catch (error) {
            $('#loadingModal').modal('hide');
            ToastManager.showError('Erro ao enviar os dados: ' + error.message);
        }
    }

    validateFreeBetInputs = () => {
        if (!$('#isFreeBet').is(':checked')) return true; // Skip validation if not checked

        const isPromoNameValid = handlePromoNameInput();
        const isFreeBetExpiryValid = handleFreeBetExpiryInput();
        const isFreeBetReturnValid = handleFreeBetReturnInput();

        return isPromoNameValid && isFreeBetExpiryValid && isFreeBetReturnValid;
    };
}
