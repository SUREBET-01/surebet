class ResultCalculator {
    static calculateResults(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        let totalInverseOdds = 0;
        let remainingStake = totalStake;
        let fixedStake = 0;
        let fixedReturn = 0; // Nova variável para armazenar o retorno fixo

        // Se uma aposta fixa for selecionada, subtrair sua stake da stake restante
        if (!isTotalInvestmentBase && fixedBetId) {
            let fixedBet = bets.find((b) => b.id === fixedBetId);
            if (fixedBet) {
                fixedStake = fixedBet.stake;
                fixedReturn = fixedStake * fixedBet.odd; // Calcular o retorno da aposta fixa
                remainingStake -= fixedStake; // Subtrair a stake fixa do restante
            }
        }

        // Calcular as odds inversas para as apostas restantes
        bets.forEach((bet) => {
            if (!fixedBetId || isTotalInvestmentBase || bet.id !== fixedBetId) {
                totalInverseOdds += 1 / bet.odd;
            }
        });

        // Calcular as stakes para as apostas restantes, de forma que o retorno delas seja semelhante ao da aposta fixa
        const stakes = bets.map((bet) => {
            let stakeValue;
            if (!isTotalInvestmentBase && bet.id === fixedBetId) {
                stakeValue = fixedStake;
            } else if (!isTotalInvestmentBase && bet.id !== fixedBetId) {
                stakeValue = fixedReturn / bet.odd;
            } else {
                stakeValue =
                    (remainingStake * (1 / bet.odd)) / totalInverseOdds;
            }
            return shouldRoundStakes ? Math.round(stakeValue) : stakeValue; // Arredondamento aqui
        });

        let resultsHTML = '';
        let resultsResume = '';
        let returns = [];
        let avaregeProfit = 0

        // Calcular os resultados de cada aposta
        bets.forEach((bet, index) => {
            bet.stake = stakes[index]; // Atualizar a stake

            const netReturn = bet.getNetReturn();
            returns.push(netReturn);
            avaregeProfit += (netReturn - this.sumStakes(stakes));

            resultsHTML += `
                <tr>
                    <td>${bet.bettingHouse}</td>
                    <td>R$ ${bet.stake.toFixed(2)}</td>
                    <td>0.00</td>
                    <td>R$ ${netReturn.toFixed(2)}</td>
                    <td>R$ 0,00</td>
                    <td>R$ ${(netReturn - this.sumStakes(stakes)).toFixed(
                        2
                    )}</td>
                </tr>
            `;
        });


        const minReturn = Math.min(...returns); // O retorno mínimo
        const netProfit = minReturn - this.sumStakes(stakes);
        const roi = (netProfit / this.sumStakes(stakes)) * 100;

        resultsResume += `
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>Lucro Total:</strong> R$ ${(avaregeProfit / bets.length).toFixed(2)}
                </div>
            </div>
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>ROI:</strong> ${roi.toFixed(2)}%
                </div>
            </div>            
        `;

        return { resultsHTML, netProfit, roi, resultsResume };
    }

    static sumStakes(stake) {
        let sum = 0;
        for (let i = 0; i < stake.length; i++) {
            sum += stake[i];
        }
        return sum;
    }

     
}

export default ResultCalculator;
