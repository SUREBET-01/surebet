export class ManualStakeAllocator {
    calculate(
        bets,
        totalStake,
        fixedBetId,
        adjustedOddCalculator,
        profitCalculator
    ) {
        // Verifica se há uma back bet fixa editada manualmente.
        const fixedBackBet = bets.find(
            (bet) =>
                bet.isEditManualy &&
                bet.editedField === 'Stake' &&
                bet.id === fixedBetId
        );

        if (fixedBackBet) {
            const totalLayOddsFactor = bets
                .filter((bet) => bet.isLayBet)
                .reduce((acc, bet) => acc + (bet.odd - 1) / bet.odd, 0);

            // Recalcula a liability para as lay bets
            bets.forEach((bet) => {
                if (bet.isLayBet) {
                    bet.liability =
                        fixedBackBet.stake *
                        bet.odd *
                        ((bet.odd - 1) / (bet.odd * totalLayOddsFactor));
                    bet.backerStake = bet.liability / (bet.odd - 1);
                }
            });
        }

        // Atualiza o campo complementar das lay bets editadas manualmente.
        const fixedLay = bets.find(
            (bet) =>
                bet.isEditManualy &&
                bet.fieldEdited !== '' &&
                bet.isLayBet &&
                (bet.editedField === 'Liabilities' ||
                    bet.editedField === "Backer's Stake")
        );
        if (fixedLay) {
            if (fixedLay.editedField === 'Liabilities') {
                fixedLay.backerStake = fixedLay.liability / (fixedLay.odd - 1);
            } else if (fixedLay.editedField === "Backer's Stake") {
                fixedLay.liability = fixedLay.backerStake * (fixedLay.odd - 1);
            }
        }

        const totalEffective = bets.reduce(
            (acc, bet) => acc + (bet.isLayBet ? bet.liability : bet.stake),
            0
        );

        return profitCalculator.calculateProfit(bets, totalEffective);
    }
}
