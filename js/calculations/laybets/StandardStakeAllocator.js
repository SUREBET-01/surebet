export class StandardStakeAllocator {
    calculate(
        bets,
        totalStake,
        fixedBetId,
        isTotalInvestmentBase,
        shouldRoundStakes,
        profitCalculator
    ) {
        const manuallyEditedBet = bets.find((bet) => bet.isEditManualy);
        const fixedBet = bets.find((bet) => bet.id === fixedBetId);

        if (fixedBet || manuallyEditedBet) {
            if (manuallyEditedBet?.editedField) {
                bets = this.adjustBasedOnManualEdit(bets, manuallyEditedBet);
            }
            if (fixedBet) {
                bets = this.adjustBasedOnFixedBet(bets, fixedBet);
            }
        } else if (isTotalInvestmentBase && !manuallyEditedBet) {
            bets = this.adjustBetsBasedOnTotal(
                bets,
                totalStake,
                isTotalInvestmentBase
            );
        }
        const updatedTotalStake = bets.reduce((sum, bet) => {
            return sum + (bet.isLayBet ? bet.liability : bet.stake);
        }, 0);

        if (shouldRoundStakes) {
            bets = this.roundStakes(bets);
        }
        return profitCalculator.calculateProfit(bets, updatedTotalStake);
    }
    adjustBasedOnManualEdit(bets, editedBet) {
        switch (editedBet.editedField) {
            case 'Stake':
                if (editedBet.isLayBet) {
                    editedBet.liability = (editedBet.odd - 1) * editedBet.stake;
                    editedBet.backerStake = editedBet.stake;
                }
                break;

            case 'Liabilities':
                if (editedBet.isLayBet) {
                    editedBet.backerStake =
                        editedBet.liability / (editedBet.odd - 1);
                    editedBet.stake = editedBet.backerStake;
                }
                break;

            case "Backer's Stake":
                if (editedBet.isLayBet) {
                    editedBet.liability =
                        (editedBet.odd - 1) * editedBet.backerStake;
                    editedBet.stake = editedBet.backerStake;
                }
                break;

            default:
                console.warn(
                    `Unhandled edited field: ${editedBet.editedField}`
                );
        }

        return bets;
    }
    adjustBetsBasedOnTotal(bets, totalStake, isTotalInvestmentBase) {
        const layBets = bets.filter((b) => b.isLayBet);
        const backBets = bets.filter((b) => !b.isLayBet);

        if (layBets.length === 0 || backBets.length === 0) {
            console.error(
                'É necessário pelo menos uma lay bet e uma back bet para calcular.'
            );
            return layBets.concat(backBets);
        }

        let totalInvestment = isTotalInvestmentBase
            ? totalStake
            : layBets.reduce((sum, bet) => sum + bet.liability, 0) +
              backBets.reduce((sum, bet) => sum + bet.stake, 0);

        layBets.forEach((layBet) => {
            const layOdd = layBet.odd;
            const layCommission = layBet.commission;

            const backBetTerms = backBets.map((backBet) => {
                const BackOdd = backBet.odd;
                const BackCommision = backBet.commission;
                const term1_i = (BackOdd - 1) * (1 - BackCommision) + 1;
                return { term1_i, backBet };
            });

            const sumReciprocalTerm1 = backBetTerms.reduce(
                (sum, { term1_i }) => sum + 1 / term1_i,
                0
            );
            const denominator =
                (layOdd - layCommission) * sumReciprocalTerm1 + (layOdd - 1);
            const S_lay = totalInvestment / denominator;

            backBetTerms.forEach(({ term1_i, backBet }) => {
                backBet.stake = (S_lay * (layOdd - layCommission)) / term1_i;
            });

            layBet.backerStake = S_lay;
            layBet.liability = (layOdd - 1) * S_lay;
        });
        console.log(bets);
        return bets;
    }

    adjustBasedOnFixedBet(bets, fixedBet) {
        const isFixedLay = fixedBet.isLayBet;

        if (isFixedLay) {
            // 2. Ajustar todas as Back Bets proporcionalmente ao novo stake
            const backBets = bets.filter((bet) => !bet.isLayBet);

            const baseLiability =
                fixedBet.liability * (fixedBet.odd - fixedBet.commission);

            backBets.forEach((backBet) => {
                let backOddAfterComission =
                    backBet.odd - (backBet.odd - 1) * backBet.commission;
                backBet.stake =
                    baseLiability /
                    (backOddAfterComission * (fixedBet.odd - 1));
            });
        } else {
            // Caso a aposta fixa seja uma Back Bet
            // Encontrar a lay bet
            const layBets = bets.filter((bet) => bet.isLayBet);
            const fixedStake = fixedBet.stake;
            const fixedOdd = fixedBet.odd;

            layBets.forEach((layBet) => {
                layBet.backerStake =
                    (fixedStake * fixedOdd) / (layBet.odd - layBet.commission);
                layBet.liability = layBet.backerStake * (layBet.odd - 1);
            });

            // Ajustar outras back bets
            const otherBackBets = bets.filter(
                (bet) => !bet.isLayBet && bet.id !== fixedBet.id
            );
            otherBackBets.forEach((backBet) => {
                const adjustedOdd =
                    backBet.odd - (backBet.odd - 1) * backBet.commission;
                backBet.stake = (fixedBet.stake * fixedBet.odd) / adjustedOdd;
            });
        }

        return bets;
    }

    roundStakes(bets) {
        return bets.map((bet) => ({
            ...bet,
            stake: Math.round(bet.stake),
            backerStake: bet.backerStake
                ? Math.round(bet.backerStake)
                : undefined,
            liability: bet.liability ? Math.round(bet.liability) : undefined,
        }));
    }
}
