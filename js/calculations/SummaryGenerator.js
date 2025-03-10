import { StakeCalculator } from './backBets/StakeCalculator.js';

export  default class SummaryGenerator {
    static generateSummary(bets) {
        const totalStake = StakeCalculator.sumStakes(bets);
        const avaregeProfit = bets.reduce((acc, bet) => acc + bet.profit, 0) / bets.length;
        const roi = (avaregeProfit / totalStake) * 100;

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
        $('#resultResume').html(resultsResume);                
    }
}
