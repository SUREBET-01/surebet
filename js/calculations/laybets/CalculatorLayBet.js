export default class CalculatorLayBet {
    /**
     * Método principal que orquestra o cálculo para lay bets.
     * @param {Array} bets - Array de objetos Bet.
     * @param {number} totalStake - Valor total investido.
     * @param {number|null} fixedBetId - ID da aposta fixa, se houver.
     * @param {boolean} isTotalInvestmentBase - Se true, a alocação é feita com base no total investido.
     * @param {boolean} shouldRoundStakes - Se true, os valores serão arredondados.
     * @returns {Array} - Lista de apostas com os cálculos de liability, backerStake, lucro e probabilidade.
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
            return this.calculateManuelEdited(bets, totalStake);
        }

        // Etapa 1: Ajusta as odds considerando a comissão.
        this.adjustOdds(bets);

        // Etapa 2: Calcula os parâmetros de alocação.
        // Para lay bets, a contribuição de cada aposta é:
        //   - Back bet: 1 / odd
        //   - Lay bet: (odd - 1) / odd
        let K = 0;
        let fixedValue = 0; // Para aposta fixa: se back bet → stake; se lay bet → backerStake.
        let fixedReturn = 0; // Para back bet: fixedValue * odd; para lay bet: fixedValue (já que o usuário fixou o backerStake).
        let remainingStake = totalStake;

        bets.forEach((bet) => {
            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    fixedValue = bet.backerStake;
                    fixedReturn = fixedValue;
                } else {
                    fixedValue = bet.stake;
                    fixedReturn = fixedValue * bet.odd;
                }
                remainingStake -= fixedValue;
            } else {
                if (bet.isLayBet) {
                    K += (bet.odd - 1) / bet.odd;
                } else {
                    K += 1 / bet.odd;
                }
            }
        });

        // Se não houver apostas não fixas, nada é recalculado.
        const allocation = remainingStake / K;

        // Etapa 3: Distribui os valores (stake para back bets ou backerStake e liability para lay bets).
        const updatedBets = bets.map((bet) => {
            let stakeValue = 0;
            let backerStake = 0;
            let liability = 0;

            if (bet.id === fixedBetId) {
                // Aposta fixa: mantém o valor informado.
                if (bet.isLayBet) {
                    backerStake = fixedValue;
                    liability = bet.liability; // Assume que o usuário já definiu esse valor.
                } else {
                    stakeValue = fixedValue;
                }
            } else {
                if (!isTotalInvestmentBase) {
                    // Distribuição baseada no retorno da aposta fixa.
                    if (bet.isLayBet) {
                        backerStake = fixedReturn * (1 / bet.odd);
                        liability = backerStake * (bet.odd - 1);
                    } else {
                        stakeValue = fixedReturn * (1 / bet.odd);
                    }
                } else {
                    // Distribuição baseada no total de investimento (apenas para as apostas não fixas).
                    if (bet.isLayBet) {
                        liability = allocation * ((bet.odd - 1) / bet.odd);
                        backerStake = allocation / bet.odd;
                    } else {
                        stakeValue = allocation / bet.odd;
                    }
                }
            }

            // Arredonda os valores, se solicitado.
            if (shouldRoundStakes) {
                stakeValue = Math.round(stakeValue);
                backerStake = Math.round(backerStake);
                liability = Math.round(liability);
            }

            bet.stake = stakeValue;
            bet.backerStake = backerStake;
            bet.liability = liability;
            return bet;
        });

        // Etapa 4: Calcula os lucros e as probabilidades.
        return this.calculateProfit(updatedBets, totalStake);
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
     * Fórmula: odd = odd - (odd - 1) * comission
     * @param {Array} bets
     */
    static adjustOdds(bets) {
        bets.forEach((bet) => {
            bet.odd = bet.odd - (bet.odd - 1) * bet.comission;
        });
    }

    static calculateManuelEdited(bets) {
        let manualSum = 0;
        bets.forEach((bet) => {
            if (bet.isEditManualy && bet.fieldEdited !== '') {
                if (bet.isLayBet) {
                    if (bet.editedField === 'Liabilities') {
                        // Atualiza o campo complementar
                        bet.backerStake = bet.liability / (bet.odd - 1);
                    } else if (bet.editedField === "Backer's Stake") {
                        bet.liability = bet.backerStake * (bet.odd - 1);
                    }
                    manualSum += bet.backerStake;
                } else {
                    // Back bet editada: o valor fixo é o stake.
                    manualSum += bet.stake;
                }
            }
        });
        const totalEffective = bets.reduce((acc, bet) => 
            acc + (bet.isLayBet ? bet.liability : bet.stake), 0
          );
        return this.calculateProfit(bets, totalEffective);
    }

    /**
     * Calcula o lucro e a probabilidade para cada aposta.
     * Para back bets: profit = stake * odd - totalStake.
     * Para lay bets: profit = backerStake - (totalStake - liability).
     * @param {Array} bets
     * @returns {Array}
     */
    static calculateProfit(bets, totalStake) {
        // Calcula o total investido. (Para lay bets, normalmente a stake não é usada,
        // mas usamos a soma dos valores de stake configurados para manter a consistência.)
        return bets.map((bet) => {
            if (!bet.isLayBet) {
                bet.profit = bet.stake * bet.odd - totalStake;
                bet.probability = 1 / bet.odd;
                return bet;
            } else {
                bet.profit = bet.backerStake - (totalStake - bet.liability);
                bet.probability = 1 / bet.odd;
                return bet;
            }
        });
    }
}
