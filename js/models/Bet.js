export default class Bet {
    constructor(
        id, 
        bettingHouse = '', 
        odd = 1.0, 
        stake = 0, 
        isLayBet = false, 
        backerStake = 0, 
        liability = 0, 
        isEditManualy = false,
        profit = 0,
        comission = 0,
        probability = 0,
        editedField = ''
    ) {
        this.id = id;
        this.bettingHouse = bettingHouse;
        this.odd = odd;
        this.stake = stake;
        this.isLayBet = isLayBet;
        this.backerStake = backerStake;
        this.liability = liability;
        this.isEditManualy = isEditManualy;
        this.profit = profit;
        this.comission = comission;
        this.probability = probability;
        this.editedField = editedField;
    }

    getNetReturn(bet) {
        return bet.stake * bet.odd;
    }
}
