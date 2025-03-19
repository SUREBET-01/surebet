import Bet from './Bet.js';

export default class BetManager {
    constructor(calculationService) {
        this.bets = [];
        this.betCount = 0;
        this.calculationService = calculationService;
    }

    addBet(
        bettingHouse = `Betting House ${this.bets.length + 1}`,
        odd = this.bets.length + 1,
        stake = 0.0
    ) {
        const bet = new Bet(++this.betCount, bettingHouse, odd, stake);
        this.bets.push(bet);

        this.updateBettingHouseNames();
        this.updateOdds();

        return bet;
    }

    removeBet(id) {
        this.bets = this.bets.filter((bet) => bet.id !== id);
        this.updateBettingHouseNames();
        this.updateOdds();
    }

    getBetById(id) {
        return this.bets.find((bet) => bet.id === id);
    }

    calculateResults(totalStake, fixedBetId, roundStakes) {
        return this.calculationService.calculate(
            this.bets,
            totalStake,
            fixedBetId,
            roundStakes
        );
    }

    updateBettingHouseNames() {
        this.bets.forEach((bet, index) => {
            bet.bettingHouse = `Betting House ${index + 1}`;
        });
    }

    updateOdds() {
        const numberOfBets = this.bets.length;
        this.bets.forEach((bet) => {
            bet.odd = numberOfBets;
        });
    }

    getLayBets() {
        return this.bets.find((bet) => bet.isLayBet === true);
    }
    getBackBets() {
        return this.bets.find((bet) => bet.isLayBet !== true);
    }

    resetAllEditStatus() {
        this.bets.forEach((bet) => {
            bet.isEditManualy = false;
        });
    }

    updateBetStake(bet, results) {
        if (bet.id === results.layBet.id) {
            bet.stake = results.layBet.liability;
            bet.backerStake = results.layBet.backerStake;
            bet.liability = results.layBet.liability;
        } else if (bet.id === results.backBet.id) {
            bet.stake = results.backBet.stake;
        }
    }
    static calculateBackGrossProfit(bets) {
        return bets.stake * (bets.odd - (bets.odd - 1) * bets.commission);
    }
    static calculateLayGrossProfit(bets) {
        return (
            bets.backerStake +
            bets.liability -
            bets.backerStake * bets.commission
        );
    }
}
