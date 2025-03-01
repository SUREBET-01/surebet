import Bet from '../models/Bet.js';

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
}