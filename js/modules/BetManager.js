import Bet from './Bet.js';

class BetManager {
    constructor() {
        this.bets = [];
        this.betCount = 0;    
    }

    addBet() {
        this.betCount++;
        const bet = new Bet(this.betCount, `Betting House ${this.betCount}`, 2.00, 0.00);
        this.bets.push(bet);
        return bet;
    }

    removeBet(id) {
        this.bets = this.bets.filter(bet => bet.id !== id);
        this.betCount--;
    }

    getBetById(id) {
        return this.bets.find(bet => bet.id === id);
    }

    calculateTotalStake() {
        return this.bets.reduce((total, bet) => total + bet.stake, 0);
    }
}

export default BetManager;
