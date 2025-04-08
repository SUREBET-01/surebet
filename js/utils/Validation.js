export default class Validation {
    static isValidBettingHouse(bettingHouse) {
        return typeof bettingHouse === 'string' && bettingHouse.trim() !== '';
    }
  
    static isValidOdd(odd) {
        return typeof parseFloat(odd) === 'number' && !isNaN(odd) && odd > 0;
    }

    static isValidCommision(commission) {
        return typeof parseFloat(commission) === 'number' && !isNaN(commission);
    }

    static isValidStake(stake) {
        return typeof stake === 'number' && !isNaN(stake) && stake >= 0;
    }

    static isValidTotalStake(totalStake) {
        return (
            typeof totalStake === 'number' &&
            !isNaN(totalStake) &&
            totalStake >= 0
        );
    }

    static isValidPromoName(promoName) {
        return typeof promoName === 'string' && promoName.trim() !== '';
    }

    static isValidFreeBetExpiry(freeBetExpiry) {
        return freeBetExpiry !== '';
    }

    static isValidFreeBetReturn(freeBetReturn) {
        return (
            typeof freeBetReturn === 'number' &&
            !isNaN(freeBetReturn) &&
            freeBetReturn >= 0
        );
    }
    static isValidCpfCount(cpfCount) {
        return typeof parseFloat(cpfCount) === 'number' && !isNaN(cpfCount) && cpfCount > 0;
    }

    static isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return typeof password === 'string' && password.trim() !== '';
    }

    static isValidGoogleId(googleId) {
        return typeof googleId === 'string' && googleId.trim() !== '' && googleId !== undefined;
    }
}
