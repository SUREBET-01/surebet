export class StakeCalculator {
    static calculateStakes(
        bets,
        remainingStake,
        fixedBetId,
        isTotalInvestmentBase,
        fixedReturn,
        totalInverseOdds,
        shouldRoundStakes,
        fixedStake
    ) {
        return bets.map((bet) => {
            let stakeValue;
            if (!isTotalInvestmentBase && bet.id === fixedBetId) {
                stakeValue = fixedStake;
            } else if (!isTotalInvestmentBase && bet.id !== fixedBetId) {
                stakeValue = fixedReturn / bet.odd;
            } else {
                stakeValue =
                    (remainingStake * (1 / bet.odd)) / totalInverseOdds;
            }
            return shouldRoundStakes ? Math.round(stakeValue) : stakeValue;
        });
    }

    static sumStakes(stakes) {
        return stakes.reduce((sum, stake) => sum + stake, 0);
    }

    static getStakes(bets) {
       return bets.map(item => item.stake);
    }
}