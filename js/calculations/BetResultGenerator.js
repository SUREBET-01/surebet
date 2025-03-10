export default class BetResultGenerator {
    static generateBetResults(bets) {
        let resultsHTML = '';

        bets.forEach((bet) => {
            resultsHTML += `
                <tr>
                    <td>${bet.bettingHouse}</td>
                    <td>R$ ${bet.stake.toFixed(2)}</td>
                    <td>% ${(bet.probability * 100).toFixed(2) }</td>
                    <td>R$ ${(bet.stake * bet.odd).toFixed(2)}</td>}
                    <td>% ${(bet.comission * 100).toFixed(2)}</td>
                    <td>R$ ${bet.profit.toFixed(2)}</td>
                </tr>
            `;
        });
        $('#resultContainer').html(resultsHTML);
    }
}
