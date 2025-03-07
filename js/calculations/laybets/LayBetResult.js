export default class LayBetResult {

    static generateBetResults(bets, stakes) {
        let resultsHTML = '';
        const returns = [];
        let avaregeProfit = 0;
        const totalStake = StakeCalculator.sumStakes(stakes);

        bets.forEach((bet) => {
            bet.stake = stakes[index];

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

}