import Validation from '../../utils/Validation.js';
import ToastManager from '../../utils/ToastManager.js';
import BetManager from '../models/BetManager.js';
import {
    handlePromoNameInput,
    handleFreeBetExpiryInput,
    handleFreeBetReturnInput,
} from '../events/eventHandlers.js';
import { ApiHelper } from '../../utils/ApiHelper.js';

export default class GoogleSheetsService {
    constructor(BetManager) {
        this.betManager = BetManager;
    }

    async saveToGoogleSheets() {
        this.saveSpinner(true);

        try {
            const totalStake = parseFloat($('#totalStake').val());
            const { formattedBets, invalidFields } = this.buildAndValidateBets(
                this.betManager.bets
            );

            if (!Validation.isValidTotalStake(totalStake)) {
                invalidFields.push('Total stake is invalid.');
            }

            if (invalidFields.length > 0) {
                ToastManager.showError(
                    'Por favor, corrija os seguintes erros:\n' +
                        invalidFields.join('\n')
                );
                return;
            }

            const isFreeBet = $('#isFreeBet').is(':checked');
            const promoName = $('#promoName').val();
            const freeBetExpiry = $('#freeBetExpiry').val();
            const freeBetReturn = parseFloat($('#freeBetReturn').val());
            const netProfit = parseFloat($('#avaregeProfit').text());
            const roi = parseFloat($('#roi').text());
            const surebetId = Date.now();
            const userId = localStorage.getItem('userId');

            const response = await ApiHelper.makeRequest('salvarDados', {
                userId,
                bets: formattedBets,
                totalStake,
                netProfit,
                roi,
                surebetId,
                isFreeBet,
                promoName,
                freeBetExpiry,
                freeBetReturn,
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
        } finally {
            this.saveSpinner(false);
        }
    }

    async getHousesByUserId() {
        try {
            const userId = localStorage.getItem('userId');
            const response = await ApiHelper.makeRequest('getHousesByUserId', {
                userId,
            });

            return response.houses;
        } catch (error) {
            ToastManager.showError('Erro ao buscar casas: ' + error.message);
        }
    }

    validateFreeBetInputs = () => {
        if (!$('#isFreeBet').is(':checked')) return true; // Skip validation if not checked

        const isPromoNameValid = handlePromoNameInput();
        const isFreeBetExpiryValid = handleFreeBetExpiryInput();
        const isFreeBetReturnValid = handleFreeBetReturnInput();

        return isPromoNameValid && isFreeBetExpiryValid && isFreeBetReturnValid;
    };

    buildAndValidateBets(bets) {
        const invalidFields = [];

        const formattedBets = bets.map((bet) => {
            const $select = $(`#bettingHouse${bet.id} option:selected`);
            const houseText = $select.text().trim();
            const sportbook = $(`#owner${bet.id} option:selected`).data('sportbook')

            const bettingHouse = {
                name: houseText,
                sportbookId: sportbook,
            };

            let owners = $(`#owner${bet.id}`)
                .siblings('button')
                .attr('title');


            if (houseText === 'Selecione') {
                ToastManager.showError(
                    `Betting house not selected for bet #${bet.id}`
                );
                return

            }

            if (owners == 'Selecione') {
                ToastManager.showError(`Owner(s) not selected for bet #${bet.id}`);
                return
            }

            return {
                bettingHouse,
                owners,
                odd: bet.odd,
                stake: bet.stake,
                grossProfit: bet.isLayBet
                    ? BetManager.calculateLayGrossProfit(bet)
                    : BetManager.calculateBackGrossProfit(bet),
                probability: bet.probability,
                commission: bet.commission,
                profit: bet.profit,
            };
        });

        return { formattedBets, invalidFields };
    }

    saveSpinner(showspinner) {
        const $saveBtn = $('#saveButton');
        if (showspinner) {
            $saveBtn.prop('disabled', true).html(`
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Salvando...`);
        } else {
            $saveBtn.prop('disabled', false).html('Salvar');
        }
    }
}
