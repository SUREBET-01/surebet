import Validation from '../utils/Validation.js';
import ToastManager from '../utils/ToastManager.js';
// Add Bet
export const handleAddBet = (betManager, uiUpdater) => {
    const bet = betManager.addBet();
    uiUpdater.addBetRow(bet);

    const comissionContainer = $(`.comissionContainer`);

    if ($('#comissionCheckbox').prop('checked')) {
        comissionContainer.removeClass('d-none');
    }
    uiUpdater.updateOddInputs();
    uiUpdater.handleBetsCalculate();
};

// Handle input generec change
const handleInputBetChange = (betManager, uiUpdater, event, type) => {
    const betId = $(event.target).closest('.bet-row').data('id');
    const newValue = $(event.target).val();
    const bet = betManager.getBetById(betId);

    if (!bet) return;

    const validationMap = {
        odd: Validation.isValidOdd,
        stake: Validation.isValidOdd,
        liability: Validation.isValidOdd,
        backerStake: Validation.isValidOdd,
        commission: Validation.isValidCommision,
        bettingHouse: Validation.isValidBettingHouse,
    };

    if (validationMap[type] && !validationMap[type](newValue)) {
        $(event.target).addClass('is-invalid');
        ToastManager.showError(`Please enter a valid ${type}.`);
        return;
    }

    $(event.target).removeClass('is-invalid');

    // Set bet properties dynamically
    if (type === 'commission') {
        bet[type] = parseFloat(newValue) / 100;
    } else {
        bet[type] = parseFloat(newValue) || 0;
    }

    if (uiUpdater) uiUpdater.handleBetsCalculate();
};

export const handleOddInputChange = (betManager, uiUpdater, event) =>
    handleInputBetChange(betManager, uiUpdater, event, 'odd');
export const handleComissionInput = (betManager, uiUpdater, event) =>
    handleInputBetChange(betManager, uiUpdater, event, 'commission');
export const handleBettingHouseInput = (betManager, event) =>
    handleInputBetChange(betManager, null, event, 'bettingHouse');

// Fixed Stake Change
export const handleFixedStakeChange = (uiUpdater, event) => {
    // Desmarca todos os radio buttons
    $('.fixed-stake-radio').prop('checked', false);

    // Marca apenas o que foi clicado
    $(event.target).prop('checked', true);
    uiUpdater.handleBetsCalculate();
};

// Generic Checkbox Toggle
const handleCheckboxToggle = (event, selector, className) => {
    $(selector).toggleClass(className, !$(event.target).prop('checked'));
};

// Handle Lay Bet Toggle
export const handleLayBet = (betManager, uiUpdater, event) => {
    const betId = $(event.target).data('id');
    const bet = betManager.getBetById(betId);

    if (!bet) return;

    bet.isLayBet = $(event.target).prop('checked');
    bet.liability = bet.stake;
    const backerStakeContainer = $(`#backerStakeContainer${betId}`);

    $(`#label-stake${betId}`).text(bet.isLayBet ? 'Liabilities' : 'Stake');
    $(`#label-odd${betId}`).text(bet.isLayBet ? 'Lay Odds' : 'Odds');

    backerStakeContainer.toggleClass('d-none', !bet.isLayBet);
    const commissionChecked = $('#comissionCheckbox').prop('checked');

    $('.backerStakeContainer')
        .toggleClass('offset-md-5', bet.isLayBet && !commissionChecked)
        .toggleClass('offset-md-7', bet.isLayBet && commissionChecked);

    uiUpdater.handleLayBetCalculation(betManager.bets);
};

export const handleComissionCheckBox = (event) => {
    handleCheckboxToggle(event, '.comissionContainer', 'd-none');
    $('.backerStakeContainer')
        .toggleClass('offset-md-5', !$(event.target).prop('checked'))
        .toggleClass('offset-md-7', $(event.target).prop('checked'));
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
    const editedField = $input.parent().find('label').text();
    const betId = $input.closest('.bet-row').data('id');
    const newStake = parseFloat($input.val()) || 0;
    const bet = betManager.getBetById(betId);

    if (!bet) return;

    const fieldMap = {
        Liabilities: 'liability',
        "Backer's Stake": 'backerStake',
        Stake: 'stake',
    };

    bet[fieldMap[editedField] || 'stake'] = newStake;
    bet.isEditManualy = true;
    uiUpdater.userEditingTotalStake = false;
    bet.editedField = bet.isLayBet ? editedField : 'Stake';

    uiUpdater.calculateTotalStake();
    uiUpdater.handleBetsCalculate();
};

// General Validation Handler
const handleValidationInput = (selector, validationFn, errorMsg) => {
    const value = $(selector).val();
    if (!validationFn(value)) {
        $(selector).addClass('is-invalid');
        ToastManager.showError(errorMsg);
        return false;
    }
    $(selector).removeClass('is-invalid');
    return true;
};

// Total Stake Blur
export const handleTotalStakeinput = (uiUpdater) => {
    // Desmarca os radio buttons de aposta fixa
    $('.fixed-stake-radio').prop('checked', false);
    $('#radioTotalInvestment').prop('checked', true);
    uiUpdater.userEditingTotalStake = true;
    uiUpdater.handleBetsCalculate();
};

export const handlePromoNameInput = () =>
    handleValidationInput(
        '#promoName',
        Validation.isValidPromoName,
        'Please enter a valid promotion name.'
    );
export const handleFreeBetExpiryInput = () =>
    handleValidationInput(
        '#freeBetExpiry',
        Validation.isValidFreeBetExpiry,
        'Please select a valid expiry date.'
    );
export const handleCpfCountInput = () =>
    handleValidationInput(
        '#cpfCount',
        Validation.isValidCpfCount,
        'Por favor, insira um número válido de CPFs/Contas.'
    );
export const handleFreeBetReturnInput = () =>
    handleValidationInput(
        '#freeBetReturn',
        Validation.isValidFreeBetReturn,
        'Please enter a valid expected return.'
    );
export const handleEmailInput = (email) =>
    handleValidationInput(
        '#email',
        Validation.isValidEmail,
        'Please enter a valid email address.'
    );
export const handlePasswordInput = (password) =>
    handleValidationInput(
        '#password',
        Validation.isValidPassword,
        'Please enter a valid password.'
    );

// Sheets Change Handler
export const handleSheetsChange = (event) => {
    const selectedSheet = $(event.target).val();
    const registerButton = $('#register');
    registerButton.toggleClass('d-none', !selectedSheet);
    registerButton.prop('disabled', !selectedSheet);
};
