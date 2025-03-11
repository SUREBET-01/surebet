export class StandardStakeAllocator {
    calculate(
        bets,
        totalStake,
        fixedBetId,
        isTotalInvestmentBase,
        shouldRoundStakes,
        adjustedOddCalculator,
        profitCalculator
    ) {
        let K = 0;
        let fixedValue = 0;
        let fixedReturn = 0;
        let remainingStake = totalStake;

        // Primeira passagem: calcular o fator de alocação
        bets.forEach((bet) => {
            const adjustedOdd = adjustedOddCalculator.compute(bet);
            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    fixedValue = bet.liability;
                    fixedReturn = fixedValue;
                } else {
                    fixedValue = bet.stake;
                    fixedReturn = fixedValue * adjustedOdd;
                }
                remainingStake -= fixedValue;
            } else {
                if (bet.isLayBet) {
                    K += (bet.odd - 1) / adjustedOdd;
                } else {
                    K += 1 / adjustedOdd;
                }
            }
        });

        const allocation = remainingStake / K;

        // Segunda passagem: atualizar os valores das apostas
        const updatedBets = bets.map((bet) => {
            const adjustedOdd = adjustedOddCalculator.compute(bet);
            let stakeValue = 0;
            let backerStake = 0;
            let liability = 0;

            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    backerStake = bet.backerStake;
                    liability = bet.liability;
                } else {
                    stakeValue = bet.stake;
                }
            } else {
                if (!isTotalInvestmentBase) {
                    // Distribuição baseada no retorno fixo da aposta fixa.
                    if (bet.isLayBet) {
                        backerStake = fixedReturn * (1 / adjustedOdd);
                        liability = backerStake * (bet.odd - 1);
                    } else {
                        stakeValue = remainingStake;
                    }
                } else {
                    // Distribuição baseada no total investido.
                    if (bet.isLayBet) {
                        liability = allocation * ((bet.odd - 1) / adjustedOdd);
                        backerStake = allocation / adjustedOdd;
                    } else {
                        stakeValue = allocation / adjustedOdd;
                    }
                }
            }

            if (shouldRoundStakes) {
                stakeValue = Math.round(stakeValue);
                backerStake = Math.round(backerStake);
                liability = Math.round(liability);
            }

            bet.stake = stakeValue;
            bet.backerStake = backerStake;
            bet.liability = liability;
            return bet;
        });
        console.log(updatedBets)
        return profitCalculator.calculateProfit(updatedBets, totalStake);
    }
}
