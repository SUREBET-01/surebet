import BetUIManager from './BetUIManager.js';
import Validation from '../../utils/Validation.js';
import CalculatorBackBet from '../calculations/backBets/CalculatorBackBet.js';
import CalculatorLayBet from '../calculations/laybets/CalculatorLayBet.js';
import BetResultGenerator from '../calculations/BetResultGenerator.js';
import SummaryGenerator from '../calculations/SummaryGenerator.js';
import GoogleSheetsService from '../../calculator/services/GoogleSheetsService.js';

export default class UIUpdater {
    constructor(
        betManager,
        calculatorLayBet = new CalculatorLayBet(),
        calculatorBackBet = new CalculatorBackBet()
    ) {
        this.betManager = betManager;
        this.userEditingTotalStake = false;
        this.userEditingStake = false;
        this.calculatorLayBet = calculatorLayBet;
        this.calculatorBackBet = calculatorBackBet;
        this.betHouses = [];
        this.betUIManager = null; // Inicializa como null
    }

    async loadBetHouses() {
        return await new GoogleSheetsService(
            this.betManager
        ).getHousesByUserId();
    }

    async initializeDefaultBets() {
        this.betHouses = await this.loadBetHouses();
        this.betUIManager = new BetUIManager(this.betHouses, this.betManager); // Inicializa o BetUIManager
        $('#totalStake').val(120);
        this.betManager.addBet();
        this.betManager.addBet();
        this.betManager.bets.forEach((bet) => this.betUIManager.addBetRow(bet));
        this.handleBetsCalculate();
    }

    handleBetsCalculate() {
        // se tiver apenas uma lay bet precisa calcular tudo como lay/back
        const layBets = this.betManager.bets.filter((bet) => bet.isLayBet);
        if (layBets.length > 0) {
            this.handleLayBetCalculation();
        } else {
            this.handleBackBetCalculation();
        }
    }

    // Função para cálculos das apostas do tipo "Back"
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

        const results = this.calculatorBackBet.calculate(
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

    // Função para cálculos das apostas do tipo "Lay"
    handleLayBetCalculation() {
        const bets = this.betManager.bets;

        const {
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            totalStake,
        } = this.fixedValue();

        const results = this.calculatorLayBet.calculate(
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

    // Função para calcular o total da stake
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

    // Função para atualizar os campos de aposta quando o usuário edita manualmente a stake
    handleStakeInputFocus(event) {
        let betId = $(event.target).closest('.bet-row').data('id');
        this.betManager.bets.forEach((bet) => {
            if (bet.id === betId) {
                bet.isEditManualy = true;
            }
        });
    }

    // Função para obter os valores fixos para os cálculos
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

    // Função para finalizar os cálculos e gerar os resultados e o resumo
    endcalucalate(results) {
        BetResultGenerator.generateBetResults(results);
        SummaryGenerator.generateSummary(results);
        this.calculateTotalStake();
        this.betManager.resetAllEditStatus();
    }

    // Função para atualizar os campos de aposta editados manualmente
    updateManuallyEditedField(bet) {
        if (bet.editedField === "Backer's Stake") {
            $(`#stake${bet.id}`).val(bet.liability.toFixed(2));
        } else if (bet.editedField === 'Liabilities') {
            $(`#backerStake${bet.id}`).val(bet.backerStake.toFixed(2));
        }
    }

}
