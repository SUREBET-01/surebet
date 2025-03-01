import Validation from '../utils/Validation.js';
import ResultCalculator from '../calculations/ResultCalculator.js';

export default class UIUpdater {
    constructor(betManager) {
        this.betManager = betManager;
        this.userEditingTotalStake = false;
        this.userEditingStake = false;
    }

    initializeDefaultBets() {
        $('#totalStake').val(120);
        this.betManager.addBet();
        this.betManager.addBet();
        this.betManager.bets.forEach((bet) => this.addBetRow(bet));
        this.handleCalculation();
    }

    addBetRow(bet) {
        const deleteButton =
            bet.id > 2
                ? `<div class="col-md-2"><button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px"><i class="fas fa-trash"></i></button></div>`
                : '';
        const betRow = `<div class="row g-3 bet-row mb-3" data-id="${bet.id}">
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
            ${deleteButton}</div>`;
        $('#betContainer').append(betRow);
    }

    handleCalculation() {
        const totalStake = parseFloat($('#totalStake').val()) || 120;
        if (!Validation.isValidStake(totalStake)) {
            this.toastManager.showError('Please enter a valid total stake.');
            return;
        }
        const fixedBetId = $('.fixed-stake-radio:checked').data('id') || null;
        const isTotalInvestmentBase = $('#radioTotalInvestment').is(':checked');
        const shouldRoundStakes = $('#roundStakesCheckbox').is(':checked');
        const results = ResultCalculator.calculateResults(
            this.betManager.bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes
        );
        this.betManager.bets.forEach((bet) => {
            if (!this.userEditingStake) {
                $(`#stake${bet.id}`).val(bet.stake.toFixed(2));
            }
        });
        $('#resultResume').html(results.resultsResume);
        $('#resultContainer').html(results.resultsHTML);
        this.calculateTotalStake();
    }

    calculateTotalStake() {
        if (this.userEditingTotalStake) return;
        let total = 0;
        $('.bet-row').each(function () {
            const stake =
                parseFloat($(this).find(".auto-calc[id^='stake']").val()) || 0;
            total += stake;
        });
        $('#totalStake').val(total.toFixed(2));
        return total;
    }

    handleTotalStakeFocus() {
        this.userEditingTotalStake = true;
        this.autoSelectTotalInvestment();
    }

    handleTotalStakeBlur() {
        this.userEditingTotalStake = false;
        this.handleCalculation();
    }

    handleStakeInputFocus() {
        this.userEditingStake = true;
    }

    handleStakeInputBlur() {
        this.userEditingStake = false;
        this.handleCalculation();
    }

    autoSelectTotalInvestment() {
        if (!$('#radioTotalInvestment').is(':checked')) {
            $('#radioTotalInvestment').prop('checked', true).trigger('change');
        }
    }

    toggleFreeBetFields() {
        const isFreeBet = $('#isFreeBet').is(':checked');
        $('#freeBetFields').toggle(isFreeBet);
    }

    updateOddInputs() {
        this.betManager.bets.forEach((bet) => {
            $(`#odd${bet.id}`).val(bet.odd);
        });
    }
}
