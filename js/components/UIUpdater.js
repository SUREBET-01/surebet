import Validation from '../utils/Validation.js';
import CalculatorBackBet from '../calculations/backBets/CalculatorBackBet.js';
import CalculatorLayBet from '../calculations/laybets/CalculatorLayBet.js';

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
        this.handleBackBetCalculation();
    }

    addBetRow(bet) {
        const deleteButton =
            bet.id > 2
                ? `<div class="col-md-1"><button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px"><i class="fas fa-trash"></i></button></div>`
                : '';

        const betRow = `
        <div class="row g-3 bet-row mb-3  border-top mt-0" data-id="${bet.id}">
            <div class="col-md-1 d-flex align-items-center">
                <input type="radio" name="calculationBase"   style="margin-top: 34px" class="form-check-input fixed-stake-radio" data-id="${
                    bet.id
                }">
            </div>
            <div class="col-md-3">
                <label for="bettingHouse${
                    bet.id
                }" class="form-label">Betting House</label>
                <input type="text" class="form-control" id="bettingHouse${
                    bet.id
                }" value="${bet.bettingHouse}">
            </div>
            <div class="col-md-2">
                <label for="odd${bet.id}"  id="label-odd${
            bet.id
        }" class="form-label">Odds</label>
                <input type="number" class="form-control auto-calc" id="odd${
                    bet.id
                }" value="${bet.odd.toFixed(2)}" step="0.01">
            </div>
            <div class="col-md-3">
                <label for="stake${bet.id}" id="label-stake${
            bet.id
        }" class="form-label ">Stake</label>
                <input type="number" class="form-control auto-calc stake-input" id="stake${
                    bet.id
                }" value="${bet.stake}" step="0.01">
            </div>
            <div class="col-md-2">
                <div class="form-check form-switch" style="margin-top: 38px" >
                    <input class="form-check-input lay-bet-switch" type="checkbox" role="switch" data-id="${
                        bet.id
                    }">
                    <label class="form-check-label" for="stake${
                        bet.id
                    }">Lay bet?</label>
                </div>
            </div>    
            ${deleteButton}
             <div class="col-md-3 offset-md-6 d-none" id="backerStakeContainer${
                 bet.id
             }">
                 <label for="backerStake${
                     bet.id
                 }" class="form-label">Backer's Stake</label>
                 <input type="number" class="form-control" id="backerStake${
                     bet.id
                 }" value="">
             </div>
        </div>`;
        $('#betContainer').append(betRow);
    }

    handleBackBetCalculation() {
        const totalStake = parseFloat($('#totalStake').val()) || 120;
        if (!Validation.isValidStake(totalStake)) {
            this.toastManager.showError('Please enter a valid total stake.');
            return;
        }

        const fixedBetId = $('.fixed-stake-radio:checked').data('id') || null;
        const isTotalInvestmentBase = $('#radioTotalInvestment').is(':checked');
        const shouldRoundStakes = $('#roundStakesCheckbox').is(':checked');

        const results = CalculatorBackBet.calculateResults(
            this.betManager.bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes
        );
        this.betManager.bets.forEach((bet) => {
            const stakeInput = $(`#stake${bet.id}`);
            const currentInputValue = parseFloat(stakeInput.val()) || 0;

            if (!bet.isEditManualy) {
                stakeInput.val(bet.stake.toFixed(2));
            } else {
                bet.stake = currentInputValue;
            }
        });
        $('#resultResume').html(results.resultsResume);
        $('#resultContainer').html(results.resultsHTML);
        this.calculateTotalStake();
        this.betManager.resetAllEditStatus();
    }

    handleLayBetCalculation(results) {
        console.log(results);

        const profit = CalculatorLayBet.calculatelayProfit(
            results.layBet,
            results.backBet
        );
        console.log(profit);
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

    handleTotalStakeBlur() {
        this.userEditingTotalStake = true;

        $('#radioTotalInvestment').prop('checked', true);
        this.handleBackBetCalculation();
    }

    handleStakeInputFocus(event) {
        let betId = $(event.target).closest('.bet-row').data('id');
        this.betManager.bets.forEach((bet) => {
            if (bet.id === betId) {
                bet.isEditManualy = true;
            }
        });
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

    updateLayBetUI = (results, bet) => {
        $(`#backerStake${bet.id}`).val(results.layBet.backerStake.toFixed(2));
        $(`#stake${bet.id}`).val(results.layBet.stake.toFixed(2));
    };

    updateBackBetUI = (results, bet) => {
        $(`#stake${bet.id}`).val(results.layBet.stake.toFixed(2));
    };
}
