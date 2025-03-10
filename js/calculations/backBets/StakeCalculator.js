export class StakeCalculator {
    static sumStakes(bets) {
        return bets.reduce((acc, bet) => acc + bet.stake, 0);
    }

    static getStakes(bets) {
        return bets.map((item) => item.stake);
    }
}
