// modules/UIManager.js
import BetManager from './BetManager.js';
import ResultCalculator from './ResultCalculator.js';

class UIManager {
    constructor() {
        this.betManager = new BetManager();
        this.userEditingTotalStake = false;
        this.userEditingStake = false;

        this.init();
    }

    init() {
        this.initializeDefaultBets();
        this.addEventListeners();
        this.handleCalculation();
    }

    initializeDefaultBets() {
        $("#totalStake").val(120); 

        const defaultBets = [
            this.betManager.addBet(),
            this.betManager.addBet()
        ];

        defaultBets.forEach(bet => this.addBetRow(bet));
        this.handleCalculation();
    }

    addEventListeners() {
        $(document).on("input", ".auto-calc", () => this.handleCalculation());
        $(document).on("input", "#totalStake", () => {
            if (!this.userEditingTotalStake) {
                this.handleCalculation();
            }
        });

        $("#totalStake").on("focus", () => this.userEditingTotalStake = true);
        $("#totalStake").on("blur", () => {
            this.userEditingTotalStake = false;
            this.handleCalculation();
        });

        $(document).on("focus", ".stake-input", () => this.userEditingStake = true);
        $(document).on("blur", ".stake-input", () => {
            this.userEditingStake = false;
            this.handleCalculation();
        });

        $(document).on("click", "#addBetButton", () => {
            const bet = this.betManager.addBet();
            this.addBetRow(bet);
            this.handleCalculation();
        });

        $(document).on("click", ".delete-bet", (event) => {
            let id = $(event.currentTarget).data("id");
            this.betManager.removeBet(id);
            $(`.bet-row[data-id="${id}"]`).remove();
            this.handleCalculation();
        });

        $(document).on("change", ".fixed-stake-radio", (event) => {
            let fixedBetId = $(event.currentTarget).data("id");
            this.handleCalculation(fixedBetId);
        });
    }

    addBetRow(bet) {
        let deleteButton = bet.id > 2 ? `
            <div class="col-md-2">
                <button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px">
                    <i class="fas fa-trash"></i>
                </button>
            </div>` : "";

        let betRow = `
            <div class="row g-3 bet-row mb-3" data-id="${bet.id}">
                <div class="col-md-1 d-flex align-items-center">
                    <input type="radio" name="calculationBase" class="form-check-input fixed-stake-radio" data-id="${bet.id}">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control" id="bettingHouse${bet.id}" value="${bet.bettingHouse}">
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control auto-calc" id="odd${bet.id}" value="${bet.odd}" step="0.01">
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control auto-calc stake-input" id="stake${bet.id}" value="${bet.stake}" step="0.01">
                </div>
                ${deleteButton}
            </div>
        `;

        $("#betContainer").append(betRow);
    }

    handleCalculation(fixedBetId = null) {
        let totalStake = parseFloat($("#totalStake").val()) || 120;
        let isTotalInvestmentBase = $("#radioTotalInvestment").is(":checked");

       const { results, netProfit, roi } = ResultCalculator.calculateResults(
            this.betManager.bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase
        );
        this.addResults(results, netProfit, roi);
        this.updateUI(results);
    }

    updateUI(results) {
        this.betManager.bets.forEach(bet => {
            if (!this.userEditingStake) {
                $(`#stake${bet.id}`).val(bet.stake.toFixed(2));
            }
        });

        $("#resultContainer").html(results.resultsHTML);

        this.calculateTotalStake();
    }

    calculateTotalStake() {
        if (this.userEditingTotalStake) return;

        let total = this.betManager.bets.reduce((sum, bet) => sum + bet.stake, 0);
        $("#totalStake").val(total.toFixed(2));
    }


    addResults(results, netProfit, roi) {
        let resultsHTML = '';
        let resultsResume = `
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>Lucro Total:</strong> R$ ${netProfit.toFixed(2)}
                </div>
            </div>
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>ROI:</strong> ${roi.toFixed(2)}%
                </div>
            </div>            
        `;

        results.forEach(result => {
            resultsHTML += `
                <tr>
                    <td>${result.bettingHouse}</td>
                    <td>R$ ${result.stake.toFixed(2)}</td>
                    <td>0.00</td>
                    <td>R$ ${result.netReturn.toFixed(2)}</td>
                    <td>R$ 0,00</td>
                    <td>R$ ${(result.netReturn - netProfit).toFixed(2)}</td>
                </tr>
            `;
        });

        $("#resultResume").html(resultsResume);
        $("#resultContainer").html(resultsHTML);
    }
}



export default UIManager;
