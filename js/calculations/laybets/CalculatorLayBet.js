import { AdjustedOddCalculator } from './AdjustedOddCalculator.js';
import { ProfitCalculator } from './ProfitCalculator.js';
import { StandardStakeAllocator } from './StandardStakeAllocator.js';

export default class CalculatorLayBet {
    constructor(
        adjustedOddCalculator = new AdjustedOddCalculator(),
        profitCalculator = new ProfitCalculator(),
        standardAllocator = new StandardStakeAllocator(),
    ) {
        this.adjustedOddCalculator = adjustedOddCalculator;
        this.profitCalculator = profitCalculator;
        this.standardAllocator = standardAllocator;
    }

    calculate(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {  
        return this.standardAllocator.calculate(
            bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            this.profitCalculator
        );
    }
}
