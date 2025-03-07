export default class Bet {
    constructor(
        id, 
        bettingHouse = '', 
        odd = 1.0, 
        stake = 0, 
        isLayBet = false, 
        backerStake = 0, 
        liability = 0, 
        isEditManualy = false
    ) {
        this.id = id;
        this.bettingHouse = bettingHouse;
        this.odd = odd;
        this.stake = stake;
        this.isLayBet = isLayBet;
        this.backerStake = backerStake;
        this.liabilities = liability;
        this.isEditManualy = isEditManualy;
    }

    getNetReturn() {
        return this.stake * this.odd;
    }
}
