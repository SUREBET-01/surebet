export class ProfitCalculator {
    calculateProfit(bets, totalStake) {
        return bets.map((bet) => {
            if (!bet.isLayBet) {
                bet.profit = bet.stake * bet.odd - totalStake;
            } else {
                bet.profit = bet.backerStake - (totalStake - bet.liability);
            }
            bet.probability = 1 / bet.odd;
            return bet;
        });
    }
}
