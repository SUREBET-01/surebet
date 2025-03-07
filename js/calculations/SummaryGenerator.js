import { StakeCalculator } from './backBets/StakeCalculator.js';

export class SummaryGenerator {
    static generateSummary(returns, stakes, bets, avaregeProfit) {
        const minReturn = Math.min(...returns);
        const totalStake = StakeCalculator.sumStakes(stakes);
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
}
