export default class BetResultGenerator {
    static generateBetResults(bets) {
        let resultsHTML = '';

        bets.forEach((bet) => {
            const grossProfit = bet.isLayBet
                ? bet.backerStake + bet.liability
                : bet.stake * bet.odd;
            const betStake = bet.isLayBet ? bet.backerStake : bet.stake;
            let profitClass = '';
            if (bet.profit < 0) {
                profitClass = 'text-danger';
            } else if (bet.profit > 0) {
                profitClass = 'text-success';
            }

            resultsHTML += `
                <tr>
                    <td>${bet.bettingHouse}</td>
                    <td>R$ ${betStake.toFixed(2)}</td>
                    <td>% ${(bet.probability * 100).toFixed(2)}</td>
                    <td>R$ ${grossProfit.toFixed(2)}</td>}
                    <td>% ${(bet.commission * 100).toFixed(2)}</td>
                    <td class="${profitClass}">R$ ${bet.profit.toFixed(2)}</td>
                </tr>
            `;
        });
        $('#resultContainer').html(resultsHTML);
    }
}
