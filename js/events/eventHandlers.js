import Validation from '../utils/Validation.js';
import ToastManager from '../utils/ToastManager.js';
import CalculatorLayBet from '../calculations/laybets/CalculatorLayBet.js';

// Add Bet
export const handleAddBet = (betManager, uiUpdater) => {
    const bet = betManager.addBet();
    uiUpdater.addBetRow(bet);
    uiUpdater.updateOddInputs();
    uiUpdater.handleBackBetCalculation();
};

// Odd Input Change
export const handleOddInputChange = (betManager, uiUpdater, event) => {
    const betId = $(event.target).closest('.bet-row').data('id');
    const newOdd = parseFloat($(event.target).val()) || 0;
    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.odd = newOdd;
    }

    uiUpdater.handleBackBetCalculation();
};

// Fixed Stake Change
export const handleFixedStakeChange = (betManager, uiUpdater, event) => {
    const fixedBetId = $(event.target).data('id');
    const bet = betManager.getBetById(fixedBetId);
    if (bet) {
        $(`#stake${fixedBetId}`).prop('readonly', false);
    }
    uiUpdater.handleBackBetCalculation();
};

// Lay Bet Change
export const handleLayBet = (betManager, event, uiUpdater) => {
    const betId = $(event.target).data('id');
    const bet = betManager.getBetById(betId);

    bet.isLayBet = $(event.target).prop('checked');

    const backerStakeContainer = $(`#backerStakeContainer${betId}`);

    if ($(event.target).prop('checked')) {
        $(`#label-stake${betId}`).text('Liabilities');
        $(`#label-odd${betId}`).text('Lay Odds');
        backerStakeContainer.removeClass('d-none');
    } else {
        $(`#label-stake${betId}`).text('Stake');
        $(`#label-odd${betId}`).text('Odds');
        backerStakeContainer.addClass('d-none');
    }
    handleLayBets(betManager, uiUpdater);
};

// Delete Bet
export const handleDeleteBet = (betManager, uiUpdater, event) => {
    const id = $(event.target).closest('.delete-bet').data('id');
    betManager.removeBet(id);
    $(`.bet-row[data-id="${id}"]`).remove();
    uiUpdater.updateOddInputs();
    uiUpdater.handleBackBetCalculation();
};

// Manual Stake Input
export const handleManualStakeInput = (betManager, uiUpdater, event) => {
    const $input = $(event.target);
    const betId = $(event.target).closest('.bet-row').data('id');
    const newStake = parseFloat($(event.target).val()) || 0;
    const bet = betManager.getBetById(betId);

    if (bet) {
        bet.stake = newStake;
        bet.isEditManualy = true;
        $input.val(newStake);
    }

    uiUpdater.calculateTotalStake();
    uiUpdater.handleBackBetCalculation();
};

// Betting House Input
export const handleBettingHouseInput = (betManager, event) => {
    const betId = $(event.target).closest('.bet-row').data('id');
    const bettingHouse = $(event.target).val();
    if (!Validation.isValidBettingHouse(bettingHouse)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError('Please enter a valid betting house.');
        return;
    }
    $(event.target).removeClass('is-invalid');
    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.bettingHouse = bettingHouse;
    }
};

// Odd Input
export const handleOddInput = (betManager, event) => {
    const betId = $(event.target).closest('.bet-row').data('id');
    const odd = parseFloat($(event.target).val());
    if (!Validation.isValidOdd(odd)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError('Please enter a valid odd.');
        return;
    }
    $(event.target).removeClass('is-invalid');
    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.odd = odd;
    }
};

const handleLayBets = (betManager, uiUpdater) => {
    const layBets = betManager.getLayBets();
    const backBets = betManager.getBackBets();

    if (!layBets || !backBets) return;

    const results = CalculatorLayBet.calculateLayConversion(
        layBets,
        backBets,
        $('#totalStake').val()
    );

    betManager.bets.forEach((bet) => {
        betManager.updateBetStake(bet, results);
        if (bet.id === results.layBet.id) {
            uiUpdater.updateLayBetUI(results, bet);
        } else if (bet.id === results.backBet.id) {
            uiUpdater.updateBackBetUI(results, bet);
        }
    });

    uiUpdater.handleLayBetCalculation(results);
};

// Promo Name Input
export const handlePromoNameInput = () => {
    if (!$('#isFreeBet').is(':checked')) return true;
    const promoName = $('#promoName').val();
    if (!Validation.isValidPromoName(promoName)) {
        $('#promoName').addClass('is-invalid');
        ToastManager.showError('Please enter a valid promotion name.');
        return false;
    }
    $('#promoName').removeClass('is-invalid');
    return true;
};

// Free Bet Expiry Input
export const handleFreeBetExpiryInput = () => {
    if (!$('#isFreeBet').is(':checked')) return true;
    const freeBetExpiry = $('#freeBetExpiry').val();
    if (!Validation.isValidFreeBetExpiry(freeBetExpiry)) {
        $('#freeBetExpiry').addClass('is-invalid');
        ToastManager.showError('Please select a valid expiry date.');
        return false;
    }
    $('#freeBetExpiry').removeClass('is-invalid');
    return true;
};

// Free Bet Return Input
export const handleFreeBetReturnInput = () => {
    if (!$('#isFreeBet').is(':checked')) return true;
    const freeBetReturn = parseFloat($('#freeBetReturn').val());
    if (!Validation.isValidFreeBetReturn(freeBetReturn)) {
        $('#freeBetReturn').addClass('is-invalid');
        ToastManager.showError('Please enter a valid expected return.');
        return false;
    }

    $('#freeBetReturn').removeClass('is-invalid');
    return true;
};

// CPF Count Input
export const handleCpfCountInput = (event) => {
    const cpfCount = parseInt($(event.target).val());
    if (!Validation.isValidCpfCount(cpfCount)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError(
            'Por favor, insira um número válido de CPFs/Contas.'
        );
        return;
    }
    $(event.target).removeClass('is-invalid');
};
