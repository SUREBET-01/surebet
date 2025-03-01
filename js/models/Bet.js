export default class Bet {
    constructor(id, bettingHouse, odd, stake) {
        this.id = id;
        this.bettingHouse = bettingHouse;
        this.odd = odd;
        this.stake = stake;
    }

    getNetReturn() {
        return this.stake * this.odd;
    }
}
