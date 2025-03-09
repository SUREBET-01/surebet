export default class CalculatorBackBet {
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

    static calculateLayConversion(bets) {
        // 1. Calcula o total investido
        const totalStake = bets.reduce((acc, bet) => acc + bet.stake, 0);

        // 2. Separa apostas back e lay (não precisamos separá-las para o cálculo, mas para a soma de K)
        const backBets = bets.filter((bet) => !bet.isLayBet);
        const layBets = bets.filter((bet) => bet.isLayBet);

        // 3. Calcula o fator K
        let K = 0;
        backBets.forEach((bet) => {
            K += 1 / bet.odd;
        });
        layBets.forEach((bet) => {
            K += (bet.odd - 1) / bet.odd;
        });

        // 4. Define a "alocação" (valor base para cada aposta)
        const allocation = totalStake / K;

        // 5. Calcula os valores para cada aposta
        // Para back bets: stake = allocation / odd.
        // Para lay bets: liability = allocation * ((odd - 1)/odd) e backerStake = allocation / odd.
        const updatedBets = bets.map((bet) => {
            if (bet.isLayBet) {
                const liability = allocation * ((bet.odd - 1) / bet.odd);
                const backerStake = allocation / bet.odd;
                return {
                    ...bet,
                    // Opcional: atualizar a odd se for necessário (no exemplo, a odd passou de 4.4 para 4.5)
                    odd: bet.odd, // ou algum ajuste se necessário
                    stake: liability, // para lay, o "stake" efetivo é a liability
                    liability,
                    backerStake,
                };
            } else {
                const stake = allocation / bet.odd;
                return {
                    ...bet,
                    stake,
                    liability: 0,
                    backerStake: 0,
                };
            }
        });

        // 6. (Opcional) Você pode calcular o lucro líquido (profit) que deve ser igual para todas as apostas:
        // Para back bet: profit = stake * bet.odd - totalStake.
        // Para lay bet: profit = backerStake - (totalStake - liability).
        // Esse valor deverá ser:
        // const profit = allocation - totalStake;

        return updatedBets;
    }

    static calculatelayProfit(layBet, backBet) {
        const profit1 = backBet.stake * (backBet.odd - 1) - layBet.liability;
        const profit2 = layBet.backerStake - backBet.stake;
        return { profit1, profit2 };
    }
}
