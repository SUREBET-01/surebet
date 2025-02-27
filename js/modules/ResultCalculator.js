class ResultCalculator {
    static calculateResults(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        const { remainingStake, fixedStake, fixedReturn } =
            this.calculateFixedBetValues(
                bets,
                totalStake,
                fixedBetId,
                isTotalInvestmentBase
            );

        const totalInverseOdds = this.calculateTotalInverseOdds(
            bets,
            fixedBetId,
            isTotalInvestmentBase
        );
        const stakes = this.calculateStakes(
            bets,
            remainingStake,
            fixedBetId,
            isTotalInvestmentBase,
            fixedReturn,
            totalInverseOdds,
            shouldRoundStakes,
            fixedStake
        );
        const { resultsHTML, returns, avaregeProfit } = this.generateBetResults(
            bets,
            stakes
        );
        const { resultsResume, roi } = this.generateSummary(
            returns,
            stakes,
            bets,
            avaregeProfit
        );

        return { resultsHTML, roi, resultsResume };
    }

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

    static calculateTotalInverseOdds(bets, fixedBetId, isTotalInvestmentBase) {
        return bets.reduce((total, bet) => {
            if (!fixedBetId || isTotalInvestmentBase || bet.id !== fixedBetId) {
                return total + 1 / bet.odd;
            }
            return total;
        }, 0);
    }

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

    static generateBetResults(bets, stakes) {
        let resultsHTML = '';
        const returns = [];
        let avaregeProfit = 0;
        const totalStake = this.sumStakes(stakes);

        bets.forEach((bet, index) => {
            bet.stake = stakes[index];
            const netReturn = bet.getNetReturn();
            returns.push(netReturn);
            avaregeProfit += netReturn - totalStake;

            resultsHTML += `
                <tr>
                    <td>${bet.bettingHouse}</td>
                    <td>R$ ${bet.stake.toFixed(2)}</td>
                    <td>0.00</td>
                    <td>R$ ${netReturn.toFixed(2)}</td>
                    <td>R$ 0,00</td>
                    <td>R$ ${(netReturn - totalStake).toFixed(2)}</td>
                </tr>
            `;
        });

        return { resultsHTML, returns, avaregeProfit };
    }

    static generateSummary(returns, stakes, bets, avaregeProfit) {
        const minReturn = Math.min(...returns);
        const totalStake = this.sumStakes(stakes);
        const netProfit = minReturn - totalStake;
        const roi = (netProfit / totalStake) * 100;

        const resultsResume = `
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>Lucro Total:</strong> R$
                        <label id="avaregeProfit"> ${(
                        avaregeProfit / bets.length
                    ).toFixed(2)}</label>
                </div>
            </div>
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>ROI:</strong>
                        <label id="roi">
                        ${roi.toFixed(2)}
                        </label>%
                </div>
            </div>
        `;

        return { resultsResume, roi };
    }

    static sumStakes(stakes) {
        return stakes.reduce((sum, stake) => sum + stake, 0);
    }
}

export default ResultCalculator;
