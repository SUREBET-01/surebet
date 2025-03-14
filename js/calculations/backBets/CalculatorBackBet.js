export default class CalculatorBackBet {
    /**
     * Método principal que orquestra o cálculo.
     * @param {Array} bets - Array de objetos Bet.
     * @param {number} totalStake - Valor total investido.
     * @param {number|null} fixedBetId - ID da aposta fixa, se houver.
     * @param {boolean} isTotalInvestmentBase - Se true, a alocação é feita com base no total.
     * @param {boolean} shouldRoundStakes - Se true, as stakes serão arredondadas.
     * @returns {Array} - Lista de apostas com os cálculos de stake, lucro e probabilidade.
     */
    static calculate(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        // Se alguma aposta foi editada manualmente, apenas recalcula os lucros.
        if (this.anyBetEdited(bets)) {
            return this.calculateBackProfit(bets);
        }

        // Etapa 1: Ajusta as odds para levar em conta a comissão.
        this.adjustOdds(bets);

        // Etapa 2: Calcula os parâmetros para alocação de stakes.
        const { fixedStake, remainingStake, fixedReturn, K } =
            this.computeAllocationParameters(bets, fixedBetId, totalStake);

        // Etapa 3: Distribui as stakes de acordo com o cenário.
        const updatedBets = this.allocateStakes(
            bets,
            fixedBetId,
            fixedStake,
            fixedReturn,
            remainingStake,
            K,
            isTotalInvestmentBase,
            shouldRoundStakes
        );

        // Etapa 4: Calcula os lucros e a probabilidade para cada aposta.
        return this.calculateBackProfit(updatedBets);
    }

    /**
     * Verifica se alguma aposta foi editada manualmente.
     * @param {Array} bets
     * @returns {boolean}
     */
    static anyBetEdited(bets) {
        return bets.some((bet) => bet.isEditManualy);
    }

    /**
     * Ajusta a odd de cada aposta considerando a comissão.
     * Fórmula: odd = odd - (odd - 1) * commission
     * @param {Array} bets
     */
    static adjustOdds(bets) {
        bets.forEach((bet) => {
            bet.odd = bet.odd - (bet.odd - 1) * bet.commission;
        });
    }

    /**
     * Calcula os parâmetros necessários para alocar as stakes:
     * - fixedStake: stake da aposta fixa.
     * - remainingStake: totalStake menos a stake fixa.
     * - fixedReturn: retorno da aposta fixa.
     * - K: soma dos inversos das odds das apostas não fixas.
     * @param {Array} bets
     * @param {number|null} fixedBetId
     * @param {number} totalStake
     * @returns {Object}
     */
    static computeAllocationParameters(bets, fixedBetId, totalStake) {
        let K = 0;
        let fixedStake = 0;
        let remainingStake = totalStake;
        let fixedReturn = 0;

        bets.forEach((bet) => {
            if (bet.id === fixedBetId) {
                fixedStake = bet.stake;
                remainingStake -= fixedStake;
                fixedReturn = fixedStake * bet.odd;
            } else {
                K += 1 / bet.odd;
            }
        });

        return { fixedStake, remainingStake, fixedReturn, K };
    }

    /**
     * Distribui as stakes entre as apostas com base no cenário:
     * - Se não for base no total de investimento, a aposta fixa mantém sua stake e as demais são ajustadas com base no retorno fixo.
     * - Se for base no total, as stakes das apostas não fixas são calculadas proporcionalmente ao inverso da odd.
     * @param {Array} bets
     * @param {number|null} fixedBetId
     * @param {number} fixedStake
     * @param {number} fixedReturn
     * @param {number} remainingStake
     * @param {number} K
     * @param {boolean} isTotalInvestmentBase
     * @param {boolean} shouldRoundStakes
     * @returns {Array}
     */
    static allocateStakes(
        bets,
        fixedBetId,
        fixedStake,
        fixedReturn,
        remainingStake,
        K,
        isTotalInvestmentBase,
        shouldRoundStakes
    ) {
        return bets.map((bet) => {
            let stakeValue;
            if (!isTotalInvestmentBase && bet.id === fixedBetId) {
                stakeValue = fixedStake;
            } else if (!isTotalInvestmentBase && bet.id !== fixedBetId) {
                stakeValue = fixedReturn * (1 / bet.odd);
            } else {
                stakeValue = (remainingStake * (1 / bet.odd)) / K;
            }

            if (shouldRoundStakes) {
                stakeValue = Math.round(stakeValue);
            }

            bet.stake = stakeValue;
            bet.liability = 0;
            bet.backerStake = 0;
            return bet;
        });
    }

    /**
     * Calcula o lucro e a probabilidade para cada aposta.
     * Lucro: (stake * odd) - totalStake (distribuído igualmente)
     * Probabilidade: 1 / odd
     * @param {Array} bets
     * @returns {Array}
     */
    static calculateBackProfit(bets) {
        const totalStake = bets.reduce((acc, bet) => acc + bet.stake, 0);
        return bets.map((bet) => ({
            ...bet,
            profit: bet.stake * bet.odd - totalStake,
            probability: 1 / bet.odd,
        }));
    }
}
