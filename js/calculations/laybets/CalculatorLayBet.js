import { AdjustedOddCalculator } from './AdjustedOddCalculator.js';
import { ManualStakeAllocator } from './ManualStakeAllocator.js';
import { ProfitCalculator } from './ProfitCalculator.js';
import { StandardStakeAllocator } from './StandardStakeAllocator.js';

// Classe principal que orquestra o cálculo, injetando as dependências necessárias.
export default class CalculatorLayBet {
    constructor(
        adjustedOddCalculator = new AdjustedOddCalculator(),
        profitCalculator = new ProfitCalculator(),
        standardAllocator = new StandardStakeAllocator(),
        manualAllocator = new ManualStakeAllocator()
    ) {
        this.adjustedOddCalculator = adjustedOddCalculator;
        this.profitCalculator = profitCalculator;
        this.standardAllocator = standardAllocator;
        this.manualAllocator = manualAllocator;
    }

    calculate(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        // Se houver alguma aposta editada manualmente, usamos o fluxo específico
        if (bets.some((bet) => bet.isEditManualy)) {
            return this.manualAllocator.calculate(
                bets,
                totalStake,
                fixedBetId,
                this.adjustedOddCalculator,
                this.profitCalculator
            );
        }
        return this.standardAllocator.calculate(
            bets,
            totalStake,
            fixedBetId,
            isTotalInvestmentBase,
            shouldRoundStakes,
            this.adjustedOddCalculator,
            this.profitCalculator
        );
    }
}
