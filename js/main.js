import Bet from './modules/Bet.js';
import BetManager from './modules/BetManager.js';
import ResultCalculator from './modules/ResultCalculator.js';
import Validation from './utils/Validation.js';

const betManager = new BetManager();
let userEditingTotalStake = false;
let userEditingStake = false;

$(document).ready(initializePage);

function initializePage() {
    initializeDefaultBets();
    setupEventListeners();
    handleCalculation();
}

function initializeDefaultBets() {
    $('#totalStake').val(120);

    betManager.addBet();
    betManager.addBet();

    betManager.bets.forEach((bet) => {
        addBetRow(bet);
    });

    handleCalculation();
}
function setupEventListeners() {
    $('#addBetButton').click(handleAddBet);
    $('#roundStakesCheckbox').change(handleCalculation);
    $('#isFreeBet').change(toggleFreeBetFields);
    $('#cpfCount').on('input', handleCpfCountInput);
    $('#saveButton').click(saveToGoogleSheets);

    $(document)
        .on('input', '.auto-calc, #totalStake', handleCalculation)
        .on('input', ".auto-calc[id^='stake']", handleStakeInputChange)
        .on('input', ".auto-calc[id^='odd']", handleOddInputChange)
        .on('focus', '#totalStake', handleTotalStakeFocus)
        .on('blur', '#totalStake', handleTotalStakeBlur)
        .on('focus', '.stake-input', handleStakeInputFocus)
        .on('blur', '.stake-input', handleStakeInputBlur)
        .on('change', '.fixed-stake-radio', handleFixedStakeChange)
        .on('click', '.delete-bet', handleDeleteBet)
        .on('input', '.stake-input', handleManualStakeInput)
        .on('input', "[id^='bettingHouse']", handleBettingHouseInput)
        .on('input', "[id^='odd']", handleOddInput)
        .on('input', handlePromoNameInput)
        .on('input', handleFreeBetExpiryInput)
        .on('input', handleFreeBetReturnInput);
}

function handleAddBet() {
    const bet = betManager.addBet();
    addBetRow(bet);
    updateOddInputs();
    handleCalculation();
}

function handleStakeInputChange() {
    calculateTotalStake();
    handleCalculation();
}

function handleOddInputChange() {
    const betId = $(this).closest('.bet-row').data('id');
    const newOdd = parseFloat($(this).val()) || 0;

    const bet = betManager.bets.find((b) => b.id === betId);
    if (bet) {
        bet.odd = newOdd;
    }

    handleCalculation();
}

function handleTotalStakeFocus() {
    userEditingTotalStake = true;
    autoSelectTotalInvestment();
}

function handleTotalStakeBlur() {
    userEditingTotalStake = false;
    handleCalculation();
}

function handleStakeInputFocus() {
    userEditingStake = true;
}

function handleStakeInputBlur() {
    userEditingStake = false;
    handleCalculation();
}

function handleFixedStakeChange() {
    const fixedBetId = $(this).data('id');
    const bet = betManager.getBetById(fixedBetId);

    if (bet) {
        $('#stake' + fixedBetId).prop('readonly', false);
    }

    handleCalculation();
}

function handleDeleteBet() {
    const id = $(this).data('id');
    betManager.removeBet(id);
    betManager.betCount--;
    $(`.bet-row[data-id="${id}"]`).remove();
    updateOddInputs();
    handleCalculation();
}

function handleManualStakeInput() {
    const betId = $(this).closest('.bet-row').data('id');
    const newStake = parseFloat($(this).val()) || 0;

    const bet = betManager.bets.find((b) => b.id === betId);
    if (bet) {
        bet.stake = newStake;
    }

    calculateTotalStake();
    handleCalculation();
}

function handleCalculation() {
    const totalStake = parseFloat($('#totalStake').val()) || 120;

    if (!Validation.isValidStake(totalStake)) {
        showError('Please enter a valid total stake.');
        return;
    }

    const fixedBetId = $('.fixed-stake-radio:checked').data('id') || null;
    const isTotalInvestmentBase = $('#radioTotalInvestment').is(':checked');
    const shouldRoundStakes = $('#roundStakesCheckbox').is(':checked');

    const results = ResultCalculator.calculateResults(
        betManager.bets,
        totalStake,
        fixedBetId,
        isTotalInvestmentBase,
        shouldRoundStakes
    );

    betManager.bets.forEach((bet) => {
        if (!userEditingStake) {
            $(`#stake${bet.id}`).val(bet.stake.toFixed(2));
        }
    });

    $('#resultResume').html(results.resultsResume);
    $('#resultContainer').html(results.resultsHTML);
    calculateTotalStake();
}

function calculateTotalStake() {
    if (userEditingTotalStake) return;

    let total = 0;
    $('.bet-row').each(function () {
        const stake =
            parseFloat($(this).find(".auto-calc[id^='stake']").val()) || 0;
        total += stake;
    });

    $('#totalStake').val(total.toFixed(2));
    return total;
}

function addBetRow(bet) {
    const deleteButton =
        bet.id > 2
            ? `
        <div class="col-md-2">
            <button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px">
                <i class="fas fa-trash"></i>
            </button>
        </div>`
            : '';

    const betRow = `
        <div class="row g-3 bet-row mb-3" data-id="${bet.id}">
            <div class="col-md-1 d-flex align-items-center">
                <input type="radio" name="calculationBase" class="form-check-input fixed-stake-radio" data-id="${bet.id}">
            </div>
            <div class="col-md-3">
                <label for="bettingHouse${bet.id}" class="form-label">Betting House</label>
                <input type="text" class="form-control" id="bettingHouse${bet.id}" value="${bet.bettingHouse}">
            </div>
            <div class="col-md-3">
                <label for="odd${bet.id}" class="form-label">Odds</label>
                <input type="number" class="form-control auto-calc" id="odd${bet.id}" value="${bet.odd}" step="0.01">
            </div>
            <div class="col-md-3">
                <label for="stake${bet.id}" class="form-label">Stake</label>
                <input type="number" class="form-control auto-calc stake-input" id="stake${bet.id}" value="${bet.stake}" step="0.01">
            </div>
            ${deleteButton}
        </div>
    `;

    $('#betContainer').append(betRow);
}

function showError(message) {
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc3a0)',
    }).showToast();
}

function autoSelectTotalInvestment() {
    if (!$('#radioTotalInvestment').is(':checked')) {
        $('#radioTotalInvestment').prop('checked', true).trigger('change');
    }
}
function handleBettingHouseInput() {
    const betId = $(this).closest('.bet-row').data('id');
    const bettingHouse = $(this).val();

    if (!Validation.isValidBettingHouse(bettingHouse)) {
        $(this).addClass('is-invalid');
        showError('Please enter a valid betting house.');
        return;
    }

    $(this).removeClass('is-invalid');

    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.bettingHouse = bettingHouse;
    }
}

function handleOddInput() {
    const betId = $(this).closest('.bet-row').data('id');
    const odd = parseFloat($(this).val());

    if (!Validation.isValidOdd(odd)) {
        $(this).addClass('is-invalid');
        showError('Please enter a valid odd.');
        return;
    }

    $(this).removeClass('is-invalid');

    const bet = betManager.getBetById(betId);
    if (bet) {
        bet.odd = odd;
    }

    handleCalculation();
}

function toggleFreeBetFields() {
    const isFreeBet = $('#isFreeBet').is(':checked');
    $('#freeBetFields').toggle(isFreeBet);
}

function updateOddInputs() {
    const bets = betManager.getBets();
    bets.forEach((bet) => {
        $(`#odd${bet.id}`).val(bet.odd);
    });
}
function handlePromoNameInput() {
    if (!$('#isFreeBet').is(':checked')) return;

    const promoName = $('#promoName').val();

    if (!Validation.isValidPromoName(promoName)) {
        $('#promoName').addClass('is-invalid');
        showError('Please enter a valid promotion name.');
        return;
    }

    $('#promoName').removeClass('is-invalid');
}

function handleFreeBetExpiryInput() {
    if (!$('#isFreeBet').is(':checked')) return;

    const freeBetExpiry = $('#freeBetExpiry').val();

    if (!Validation.isValidFreeBetExpiry(freeBetExpiry)) {
        $('#freeBetExpiry').addClass('is-invalid');
        showError('Please select a valid expiry date.');
        return;
    }

    $('#freeBetExpiry').removeClass('is-invalid');
}

function handleFreeBetReturnInput() {
    if (!$('#isFreeBet').is(':checked')) return;

    const freeBetReturn = parseFloat($('#freeBetReturn').val());

    if (!Validation.isValidFreeBetReturn(freeBetReturn)) {
        $('#freeBetReturn').addClass('is-invalid');
        showError('Please enter a valid expected return.');
        return;
    }

    $('#freeBetReturn').removeClass('is-invalid');
}
function handleCpfCountInput() {
    const cpfCount = parseInt($('#cpfCount').val());

    if (!Validation.isValidCpfCount(cpfCount)) {
        $('#cpfCount').addClass('is-invalid');
        showError('Por favor, insira um número válido de CPFs/Contas.');
        return;
    }

    $('#cpfCount').removeClass('is-invalid');
}

function saveToGoogleSheets() {
    const totalStake = parseFloat($('#totalStake').val());
    const bets = betManager.getBets().map((bet) => ({
        bettingHouse: bet.bettingHouse,
        odd: bet.odd,
        stake: bet.stake,
        netReturn: bet.getNetReturn(),
        probability: 0, //  (0 por enquanto)
        commission: 0, //  (0 por enquanto)
        netReturnByBet: (bet.getNetReturn() - totalStake).toFixed(2),
    }));

    const isFreeBet = $('#isFreeBet').is(':checked');
    const promoName = $('#promoName').val();
    const freeBetExpiry = $('#freeBetExpiry').val();
    const freeBetReturn = parseFloat($('#freeBetReturn').val());
    const cpfCount = parseInt($('#cpfCount').val());

    if (
        !Validation.isValidTotalStake(totalStake) ||
        !bets.every(
            (bet) =>
                Validation.isValidBettingHouse(bet.bettingHouse) &&
                Validation.isValidOdd(bet.odd) &&
                Validation.isValidStake(bet.stake)
        ) ||
        (isFreeBet &&
            (!Validation.isValidPromoName(promoName) ||
                !Validation.isValidFreeBetExpiry(freeBetExpiry) ||
                !Validation.isValidFreeBetReturn(freeBetReturn))) ||
        !Validation.isValidCpfCount(cpfCount)
    ) {
        showError('Por favor, corrija os erros nos campos antes de salvar.');
        return;
    }

    const surebetId = Date.now();
    const roi = parseFloat($('#roi').text());
    const netProfit = parseFloat($('#avaregeProfit').text());

    $('#loadingModal').modal('show');

    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbwryZxhplBkvuvPBQF45zAvmc7MChMQMUkjUozY5feFabKPJY-aj9DrBhpgiA0djM48/exec', // Substitua pelo URL do seu script
        type: 'POST',
        contentType: 'text/plain',
        data: JSON.stringify({
            bets: bets,
            totalStake: totalStake,
            netProfit: netProfit,
            roi: roi,
            surebetId: surebetId,
            isFreeBet: isFreeBet,
            freeBetExpiry: freeBetExpiry,
            freeBetReturn: freeBetReturn,
            accoutsUsed: cpfCount,
        }),
        success: function (response) {
            if (response.status === 'success') {
                $('#loadingModal').modal('hide');
                showSuccess(
                    'Dados salvos com sucesso! Surebet ID: ' +
                        response.surebetId
                );
            } else {
                showError('Erro ao salvar os dados: ' + response.message);
            }
        },
        error: function (error) {
            $('#loadingModal').modal('hide');
            showError('Erro ao enviar os dados: ' + error.responseText);
        },
    });
}

function showSuccess(message) {
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
    }).showToast();
}
