export class ProfitCalculator {
    calculateProfit(bets, totalStake) {
        return bets.map((bet) => {
            if (!bet.isLayBet) {
                const effectiveOdd = bet.odd - (bet.odd - 1) * bet.commission;
                bet.profit = bet.stake * effectiveOdd - totalStake;
            } else {
                bet.profit =
                    bet.backerStake -
                    (totalStake - bet.liability) -
                    bet.backerStake * bet.commission;
            }
            bet.probability = 1 / bet.odd;
            return bet;
        });
    }
}
