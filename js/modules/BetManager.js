import Bet from './Bet.js';

export default class BetManager {
    constructor(calculationService) {
        this.bets = [];
        this.betCount = 0;
        this.calculationService = calculationService;
    }

    addBet(bettingHouse = `Betting House ${this.betCount + 1}`, odd = 2.0, stake = 0.0) {
        const bet = new Bet(++this.betCount, bettingHouse, odd, stake);
        this.bets.push(bet);
        return bet;
    }

    removeBet(id) {
        this.bets = this.bets.filter((bet) => bet.id !== id);
    }

    calculateResults(totalStake, fixedBetId, roundStakes) {
        return this.calculationService.calculate(this.bets, totalStake, fixedBetId, roundStakes);
    }
}