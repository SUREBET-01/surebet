import { FixedBetCalculator } from './FixedBetCalculator.js';
import { InverseOddsCalculator } from './InverseOddsCalculator.js';
import { StakeCalculator } from './StakeCalculator.js';
import { BetResultGenerator } from '../BetResultGenerator.js';
import { SummaryGenerator } from '../SummaryGenerator.js';

export default class CalculatorBackBet {
    static calculateResults(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        const { remainingStake, fixedStake, fixedReturn } =
            FixedBetCalculator.calculateFixedBetValues(
                bets,
                totalStake,
                fixedBetId,
                isTotalInvestmentBase
            );

        const totalInverseOdds =
            InverseOddsCalculator.calculateTotalInverseOdds(
                bets,
                fixedBetId,
                isTotalInvestmentBase
            );

        let stakes = [];
        const manuallyEditedBet = bets.find(
            (bet) => bet.isEditManualy === true
        );

        if (!manuallyEditedBet) {
            stakes = StakeCalculator.calculateStakes(
                bets,
                remainingStake,
                fixedBetId,
                isTotalInvestmentBase,
                fixedReturn,
                totalInverseOdds,
                shouldRoundStakes,
                fixedStake
            );
        } else {
            stakes = StakeCalculator.getStakes(bets);
        }

        const { resultsHTML, returns, avaregeProfit } =
            BetResultGenerator.generateBetResults(bets, stakes);

        const { resultsResume, roi } = SummaryGenerator.generateSummary(
            returns,
            stakes,
            bets,
            avaregeProfit
        );
        return { resultsHTML, roi, resultsResume };
    }
}
