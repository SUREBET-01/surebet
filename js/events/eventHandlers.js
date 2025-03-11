import Validation from '../utils/Validation.js';
import ToastManager from '../utils/ToastManager.js';

// Add Bet
export const handleAddBet = (betManager, uiUpdater) => {
    const bet = betManager.addBet();
    uiUpdater.addBetRow(bet);
    uiUpdater.updateOddInputs();
    uiUpdater.handleBetsCalculate();
};

// Odd Input Change
export const handleOddInputChange = (betManager, uiUpdater, event) => {
    const betId = $(event.target).closest('.bet-row').data('id');
    const newOdd = parseFloat($(event.target).val()) || 0;
    const bet = betManager.getBetById(betId);

    if (!Validation.isValidOdd(newOdd)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError('Please enter a valid odd.');
        return;
    }
    $(event.target).removeClass('is-invalid');
    if (bet) {
        bet.odd = newOdd;
    }

    uiUpdater.handleBetsCalculate();
};

// Fixed Stake Change
export const handleFixedStakeChange = (uiUpdater, event) => {
    // Desmarca todos os radio buttons
    $('.fixed-stake-radio').prop('checked', false);

    // Marca apenas o que foi clicado
    $(event.target).prop('checked', true);
    uiUpdater.handleBetsCalculate();
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

    uiUpdater.handleLayBetCalculation(betManager.bets);
};

// handle Comission checkbox
export const handleComissionCheckBox = (event) => {
    const comissionContainer = $(`.comissionContainer`);

    if ($(event.target).prop('checked')) {
        comissionContainer.removeClass('d-none');
    } else {
        comissionContainer.addClass('d-none');
    }
};

// Delete Bet
export const handleDeleteBet = (betManager, uiUpdater, event) => {
    const id = $(event.target).closest('.delete-bet').data('id');
    betManager.removeBet(id);
    $(`.bet-row[data-id="${id}"]`).remove();
    uiUpdater.updateOddInputs();
    uiUpdater.handleBetsCalculate();
};

// Manual Stake Input
export const handleManualStakeInput = (betManager, uiUpdater, event) => {
    const $input = $(event.target);
    const editedField = $(event.target).parent().find('label').html();
    const betId = $(event.target).closest('.bet-row').data('id');
    const newStake = parseFloat($(event.target).val()) || 0;
    const bet = betManager.getBetById(betId);

    if (bet) {
        if (editedField === 'Liabilities') {
            bet.liability = newStake;
        } else if (editedField === "Backer's Stake") {
            bet.backerStake = newStake;
        } else {
            bet.stake = newStake;
        }
        bet.isEditManualy = true;
        uiUpdater.userEditingTotalStake = false;
        bet.editedField = bet.isLayBet ? editedField : 'stake';
    }

    uiUpdater.calculateTotalStake();
    uiUpdater.handleBetsCalculate();
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
// Comission Input
export const handleComissionInput = (betManager, event, uiUpdater) => {
    const comission = parseFloat($(event.target).val());
    const betId = $(event.target).closest('.bet-row').data('id');
    if (!Validation.isValidOdd(comission)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError('Please enter a valid comission.');
    }
    $(event.target).removeClass('is-invalid');
    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.comission = comission / 100;
    }
    uiUpdater.handleBetsCalculate();
};
// Total Stake Blur
export const handleTotalStakeinput = (uiUpdater) => {
    // Desmarca os radio buttons de aposta fixa
    $('.fixed-stake-radio').prop('checked', false);
    $('#radioTotalInvestment').prop('checked', true);
    uiUpdater.userEditingTotalStake = true;
    uiUpdater.handleBetsCalculate();
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
