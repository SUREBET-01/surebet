import Validation from '../utils/Validation.js';
import CalculatorBackBet from '../calculations/backBets/CalculatorBackBet.js';
import CalculatorLayBet from '../calculations/laybets/CalculatorLayBet.js';
import BetResultGenerator from '../calculations/BetResultGenerator.js';
import SummaryGenerator from '../calculations/SummaryGenerator.js';

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
        this.handleBetsCalculate();
    }

    addBetRow(bet) {
        const deleteButton =
            bet.id > 2
                ? `<div class="col-md-1"><button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px"><i class="fas fa-trash"></i></button></div>`
                : '';

        const betRow = `
        <div class="row g-3 bet-row mb-3  border-top mt-0" data-id="${bet.id}">
            <div class="col-md-1 d-flex align-items-center">
                <input type="radio" class="form-check-input fixed-stake-radio" name="fixedStake" data-id="${
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
            <div class="col-md-2 d-none comissionContainer">
                <label for="comission${bet.comission}"  id="label-comission${
            bet.comission
        }" class="form-label">Comissão</label>
                <input type="number" class="form-control comissionInput" id="comission${
                    bet.comission
                }" value="${bet.comission.toFixed(2)}" step="0.01">
            </div>
            <div class="col-md-2">
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
                 <input type="number" class="form-control backerStake-input" id="backerStake${
                     bet.id
                 }" value="">
             </div>
        </div>`;
        $('#betContainer').append(betRow);
    }

    handleBetsCalculate() {
        // se tiver apemas uma lay bet precisa calcular tudo como lay/back
        const layBets = this.betManager.bets.filter((bet) => bet.isLayBet);

        if (layBets.length > 0) {
            this.handleLayBetCalculation();
        } else {
            this.handleBackBetCalculation();
        }
    }

    handleBackBetCalculation() {
        const {
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            totalStake,
        } = this.fixedValue();

        if (!Validation.isValidStake(totalStake)) {
            this.toastManager.showError('Please enter a valid total stake.');
            return;
        }

        const results = CalculatorBackBet.calculate(
            this.betManager.bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes
        );
        results.forEach((bet) => {
            const stakeInput = $(`#stake${bet.id}`);
            const currentInputValue = parseFloat(stakeInput.val()) || 0;

            if (!bet.isEditManualy) {
                stakeInput.val(bet.stake.toFixed(2));
            } else {
                bet.stake = currentInputValue;
            }
        });

        this.endcalucalate(results);
    }

    handleLayBetCalculation() {
        const bets = this.betManager.bets;

        const {
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            totalStake,
        } = this.fixedValue();

        const results = CalculatorLayBet.calculate(
            bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes
        );
        results.forEach((bet) => {
            if (bet.isEditManualy) {
              this.updateManuallyEditedField(bet);
            } else {
              if (bet.isLayBet) {
                $(`#backerStake${bet.id}`).val(bet.backerStake.toFixed(2));
                $(`#stake${bet.id}`).val(bet.liability.toFixed(2));
              } else {
                $(`#stake${bet.id}`).val(bet.stake.toFixed(2));
              }
            }
          });
        this.endcalucalate(results);
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

    handleStakeInputFocus(event) {
        let betId = $(event.target).closest('.bet-row').data('id');
        this.betManager.bets.forEach((bet) => {
            if (bet.id === betId) {
                bet.isEditManualy = true;
            }
        });
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

    fixedValue() {
        const fixedBetId = $('.fixed-stake-radio:checked').data('id') || null;
        const isTotalInvestmentBase = $('#radioTotalInvestment').is(':checked');
        const shouldRoundStakes = $('#roundStakesCheckbox').is(':checked');
        const totalStake = parseFloat($('#totalStake').val()) || 120;
        return {
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            totalStake,
        };
    }

    endcalucalate(results) {
        BetResultGenerator.generateBetResults(results);
        SummaryGenerator.generateSummary(results);
        this.calculateTotalStake();
        this.betManager.resetAllEditStatus();
    }

    updateManuallyEditedField(bet) {
        if (bet.editedField === "Backer's Stake") {
            $(`#stake${bet.id}`).val(bet.liability.toFixed(2));
        } else if (bet.editedField === 'Liabilities') {
            $(`#backerStake${bet.id}`).val(bet.backerStake.toFixed(2));
        }
    }
}
