class Bet {
    constructor(id, bettingHouse, odd, stake) {
        this.id = id;
        this.bettingHouse = bettingHouse;
        this.odd = odd;
        this.stake = stake;
    }

    getNetReturn() {
        return this.stake * this.odd;
    }

    static fromDOM(id) {
        const bettingHouse = document.getElementById(`bettingHouse${id}`).value;
        const odd = parseFloat(document.getElementById(`odd${id}`).value);
        const stake = parseFloat(document.getElementById(`stake${id}`).value);
        return new Bet(id, bettingHouse, odd, stake);
    }
}

export default Bet;
