export default class Validation {
    static isValidStake(stake) {
        return !isNaN(stake) && stake > 0;
    }

    static isValidOdd(odd) {
        return !isNaN(odd) && odd > 0;
    }
}
