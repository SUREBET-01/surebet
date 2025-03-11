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

        // Primeira passagem: cálculo do fator de alocação
        bets.forEach((bet) => {
            const adjustedOdd = adjustedOddCalculator.compute(bet);
            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    // Para aposta fixa do tipo lay:
                    fixedValue = bet.liability;
                    // O retorno efetivo é o backer’s stake convertido em ganho, considerando a comissão
                    fixedReturn = (bet.liability / (bet.odd - 1)) * (1 - bet.comission);
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

        // Segunda passagem: distribuição dos valores
        const updatedBets = bets.map((bet) => {
            const adjustedOdd = adjustedOddCalculator.compute(bet);
            let stakeValue = 0;
            let backerStake = 0;
            let liability = 0;

            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    backerStake = bet.liability / (bet.odd - 1);
                    liability = bet.liability;
                } else {
                    stakeValue = bet.stake;
                }
            } else {
                if (!isTotalInvestmentBase) {
                    if (bet.isLayBet) {
                        backerStake = fixedReturn / adjustedOdd;
                        liability = backerStake * (bet.odd - 1);
                    } else {
                        stakeValue = remainingStake; // ou outra lógica conforme seu cenário
                    }
                } else {
                    if (bet.isLayBet) {
                        backerStake = allocation / adjustedOdd;
                        liability = backerStake * (bet.odd - 1);
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
            bet.adjustedOdd = adjustedOdd;
            return bet;
        });

        return profitCalculator.calculateProfit(updatedBets, totalStake);
    }
}