export class StakeCalculator {
    static sumStakes(bets) {
        return bets.reduce((acc, bet) => {
            if (bet.isLayBet) {
                return acc + bet.backerStake; 
            }
            return acc + bet.stake; 
        }, 0);
    }

    static getStakes(bets) {
        return bets.map((item) =>
            item.isLayBet ? item.backerStake : item.stake
        ); 
    }
}
