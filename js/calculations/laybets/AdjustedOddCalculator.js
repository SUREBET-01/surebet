export class AdjustedOddCalculator {
    compute(bet) {
        if (bet.isLayBet) {
            return bet.odd;
        }
        return bet.odd - (bet.odd - 1) * bet.commission;
    }
}
