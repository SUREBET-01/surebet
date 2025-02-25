class ResultCalculator {
    static calculateResults(bets, totalStake, fixedBetId = null, isTotalInvestmentBase = true) {
        let totalInverseOdds = 0;
        let remainingStake = totalStake;
        let fixedStake = 0;
        let fixedReturn = 0;  // Nova variável para armazenar o retorno fixo

        // Se uma aposta fixa for selecionada, subtrair sua stake da stake restante
        if (!isTotalInvestmentBase && fixedBetId) {
            let fixedBet = bets.find(b => b.id === fixedBetId);
            if (fixedBet) {
                fixedStake = fixedBet.stake;
                fixedReturn = fixedStake * fixedBet.odd;  // Calcular o retorno da aposta fixa
                remainingStake -= fixedStake; // Subtrair a stake fixa do restante
            }
        }

        // Calcular as odds inversas para as apostas restantes
        bets.forEach(bet => {
            if (!fixedBetId || isTotalInvestmentBase || bet.id !== fixedBetId) {
                totalInverseOdds += 1 / bet.odd;
            }
        });

        // Calcular as stakes para as apostas restantes, de forma que o retorno delas seja semelhante ao da aposta fixa
        const stakes = bets.map(bet => {
            if (!isTotalInvestmentBase && bet.id === fixedBetId) return fixedStake; // A aposta fixa mantém sua stake

            if (!isTotalInvestmentBase && bet.id !== fixedBetId) {
                // Ajustar a stake de acordo com o retorno fixo
                return fixedReturn / bet.odd; // Ajustar a stake para ter o mesmo retorno que a aposta fixa
            }
            
            // Para outras apostas, distribuímos a stake proporcionalmente
            return (remainingStake * (1 / bet.odd)) / totalInverseOdds; 
        });

        let resultsHTML = "";
        let returns = [];

        // Calcular os resultados de cada aposta
        bets.forEach((bet, index) => {
            bet.stake = stakes[index]; // Atualizar a stake
            const netReturn = bet.getNetReturn();
            returns.push(netReturn);
            resultsHTML += `
                <div class="row mb-2">
                    <div class="col-4"><strong>Betting House:</strong> ${bet.bettingHouse}</div>
                    <div class="col-4"><strong>Stake:</strong> ${bet.stake.toFixed(2)}</div>
                    <div class="col-4"><strong>Net Return:</strong> ${netReturn.toFixed(2)}</div>
                </div>
            `;
        });

        // Calcular o resultado geral
        const minReturn = Math.min(...returns); // O retorno mínimo
        const netProfit = minReturn - totalStake;
        const roi = (netProfit / totalStake) * 100;

        resultsHTML += `
            <div class="row mb-2">
                <div class="col-4"><strong>Total Stake:</strong> ${totalStake.toFixed(2)}</div>
                <div class="col-4"><strong>Net Profit:</strong> ${netProfit.toFixed(2)}</div>
                <div class="col-4"><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
            </div>
        `;

        return { resultsHTML, netProfit, roi };
    }
}



export default ResultCalculator;
