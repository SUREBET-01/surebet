export  default class CalculatorBackBet {
    static calulateOnBackStake(layBet, backBet, totalStake) {
        layBet.liability = totalStake - backBet.stake;
        layBet.backerStake = layBet.liability / (layBet.odd - 1);
        const newTotalStake = backBet.stake + layBet.liability;
        totalStake = newTotalStake;
        return { layBet, totalStake };
    }

    static calculateOnBackerStake(layBet, backBet) {
        layBet.liability = layBet.backerStake * (layBet.odd - 1);
        const totalStake = backBet.stake + layBet.liability;
        return { layBet, totalStake };
    }

    static calculateOnLiabilities(layBet, backBet) {
        layBet.backerStake = layBet.liability / (layBet.odd - 1);
        const totalStake = backBet.stake + layBet.liability;

        return { layBet, totalStake };
    }

    static calculateLayConversion(layBet, backBet, totalStake) {
        const denominator = backBet.odd + 1 + 1 / (layBet.odd - 1);
        layBet.liability = (totalStake * backBet.odd) / denominator;
        backBet.stake = totalStake - layBet.liability;
        layBet.backerStake = layBet.liability / (layBet.odd - 1);
        
        return { layBet, backBet };
    }
    

    static calculatelayProfit(layBet, backBet) {
        const profit1 = backBet.stake * (backBet.odd - 1) - layBet.liability;
        const profit2 = layBet.backerStake - backBet.stake;
        return { profit1, profit2 };
    }
  
}
