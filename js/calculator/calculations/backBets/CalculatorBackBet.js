import { AdjustedOddCalculator } from '../laybets/AdjustedOddCalculator.js';

export default class CalculatorBackBet {
    constructor(adjustedOddCalculator = new AdjustedOddCalculator()) {
        this.adjustedOddCalculator = adjustedOddCalculator;
    }

    calculate(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        if (this.anyBetEdited(bets)) {
            return this.calculateBackProfit(bets);
        }

        const { fixedStake, remainingStake, fixedReturn, K } =
            this.computeAllocationParameters(bets, fixedBetId, totalStake);

        const updatedBets = this.allocateStakes(
            bets,
            fixedBetId,
            fixedStake,
            fixedReturn,
            remainingStake,
            K,
            isTotalInvestmentBase,
            shouldRoundStakes
        );

        return this.calculateBackProfit(updatedBets);
    }

    anyBetEdited(bets) {
        return bets.some((bet) => bet.isEditManualy);
    }

    computeAllocationParameters(bets, fixedBetId, totalStake) {
        let K = 0;
        let fixedStake = 0;
        let remainingStake = totalStake;
        let fixedReturn = 0;


        bets.forEach((bet) => {
            const updateOdd = this.adjustedOddCalculator.compute(bet);

            if (bet.id === fixedBetId) {
                fixedStake = bet.stake;
                remainingStake -= fixedStake;
                fixedReturn = fixedStake * updateOdd;
            } else {
                K += 1 /updateOdd;
            }
        });

        return { fixedStake, remainingStake, fixedReturn, K };
    }

    allocateStakes(
        bets,
        fixedBetId,
        fixedStake,
        fixedReturn,
        remainingStake,
        K,
        isTotalInvestmentBase,
        shouldRoundStakes
    ) {
        return bets.map((bet) => {
            const updateOdd = this.adjustedOddCalculator.compute(bet);

            let stakeValue;
            if (!isTotalInvestmentBase && bet.id === fixedBetId) {
                stakeValue = fixedStake;
            } else if (!isTotalInvestmentBase && bet.id !== fixedBetId) {
                stakeValue = fixedReturn * (1 / updateOdd);
            } else {
                stakeValue = (remainingStake * (1 / updateOdd)) / K;
            }

            if (shouldRoundStakes) {
                stakeValue = Math.round(stakeValue);
            }

            bet.stake = stakeValue;
            bet.liability = 0;
            bet.backerStake = 0;
            return bet;
        });
    }

    calculateBackProfit(bets) {
        const totalStake = bets.reduce((acc, bet) => acc + bet.stake, 0);
        return bets.map((bet) => {
            const updateOdd = this.adjustedOddCalculator.compute(bet);
            bet.profit = bet.stake * updateOdd - totalStake;
            bet.probability = 1 / updateOdd;

            return bet;
        });
    }
}
