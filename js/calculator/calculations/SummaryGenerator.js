export default class SummaryGenerator {
    static generateSummary(bets) {
        const totalProfit = bets.reduce((acc, bet) => acc + bet.profit, 0);

        const totalStake = bets.reduce(
            (acc, bet) => acc + (bet.isLayBet ? bet.liability : bet.stake),
            0
        );

        const averageProfit = bets.length > 0 ? totalProfit / bets.length : 0;

        const roi =
            totalStake > 0 ? (totalProfit / bets.length / totalStake) * 100 : 0;

        const resultsResume = `
            <div class="col-md-6">
                <div class="alert alert-success text-center">
                    <strong>Lucro Total:</strong> R$
                        <label id="avaregeProfit"> ${averageProfit.toFixed(
                            2
                        )}</label>
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
        $('#resultResume').html(resultsResume);
    }
}
