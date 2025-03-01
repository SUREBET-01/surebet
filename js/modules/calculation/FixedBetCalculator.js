export class FixedBetCalculator {
    static calculateFixedBetValues(
        bets,
        totalStake,
        fixedBetId,
        isTotalInvestmentBase
    ) {
        let remainingStake = totalStake;
        let fixedStake = 0;
        let fixedReturn = 0;

        if (!isTotalInvestmentBase && fixedBetId) {
            const fixedBet = bets.find((bet) => bet.id === fixedBetId);
            if (fixedBet) {
                fixedStake = fixedBet.stake;
                fixedReturn = fixedStake * fixedBet.odd;
                remainingStake -= fixedStake;
            }
        }

        return { remainingStake, fixedStake, fixedReturn };
    }
}