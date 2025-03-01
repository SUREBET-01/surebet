export class InverseOddsCalculator {
    static calculateTotalInverseOdds(bets, fixedBetId, isTotalInvestmentBase) {
        return bets.reduce((total, bet) => {
            if (!fixedBetId || isTotalInvestmentBase || bet.id !== fixedBetId) {
                return total + 1 / bet.odd;
            }
            return total;
        }, 0);
    }
}