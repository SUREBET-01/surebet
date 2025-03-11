export class AdjustedOddCalculator {
    compute(bet) {
        if (bet.isLayBet) {
            return (bet.odd - 1) / (1 - bet.comission) + 1;
        }
        return bet.odd - (bet.odd - 1) * bet.comission;
    }
}
