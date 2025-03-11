export default class CalculatorLayBet {
    /**
     * Método principal que orquestra o cálculo para lay bets.
     * @param {Array} bets - Array de objetos Bet.
     * @param {number} totalStake - Valor total investido.
     * @param {number|null} fixedBetId - ID da aposta fixa, se houver.
     * @param {boolean} isTotalInvestmentBase - Se true, a alocação é feita com base no total investido.
     * @param {boolean} shouldRoundStakes - Se true, os valores serão arredondados.
     * @returns {Array} - Lista de apostas com os cálculos de liability, backerStake, lucro e probability.
     */
    static calculate(
        bets,
        totalStake,
        fixedBetId = null,
        isTotalInvestmentBase = true,
        shouldRoundStakes = false
    ) {
        // Se alguma aposta foi editada manualmente, usamos outro fluxo (que já cuida dos valores digitados).
        if (this.anyBetEdited(bets)) {
            return this.calculateManuelEdited(bets, totalStake);
        }

        // Não alteramos bet.odd – usaremos um auxiliar (adjustedOdd) para os cálculos.
        let K = 0;
        let fixedValue = 0;
        let fixedReturn = 0;
        let remainingStake = totalStake;

        bets.forEach((bet) => {
            // Calcula o valor ajustado para o cálculo (sem modificar o objeto original)
            const adjustedOdd = this.computeAdjustedOdd(bet);

            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    // Para lay bet fixa, o valor efetivo é a LIABILITY (pois ela compõe o total investido).
                    fixedValue = bet.liability;
                    fixedReturn = fixedValue; // Para lay bets, fixamos o retorno como o valor efetivo.
                } else {
                    fixedValue = bet.stake;
                    fixedReturn = fixedValue * adjustedOdd;
                }
                remainingStake -= fixedValue;
            } else {
                if (bet.isLayBet) {
                    // Para lay bets, usamos o fator: (originalOdd - 1) / adjustedOdd.
                    K += (bet.odd - 1) / adjustedOdd;
                } else {
                    K += 1 / adjustedOdd;
                }
            }
        });

        const allocation = remainingStake / K;

        const updatedBets = bets.map((bet) => {
            const adjustedOdd = this.computeAdjustedOdd(bet);
            let stakeValue = 0;
            let backerStake = 0;
            let liability = 0;

            if (bet.id === fixedBetId) {
                if (bet.isLayBet) {
                    backerStake = bet.backerStake;
                    liability = bet.liability;
                } else {
                    stakeValue = bet.stake;
                }
            } else {
                if (!isTotalInvestmentBase) {
                    // Distribuição baseada no retorno fixo da aposta fixa.
                    if (bet.isLayBet) {
                        backerStake = fixedReturn * (1 / adjustedOdd);
                        liability = backerStake * (adjustedOdd - 1);
                    } else {
                        stakeValue = remainingStake;
                    }
                } else {
                    // Distribuição baseada no total investido.
                    if (bet.isLayBet) {
                        liability = allocation * ((bet.odd - 1) / adjustedOdd);
                        backerStake = allocation / adjustedOdd;
                    } else {
                        stakeValue = allocation / adjustedOdd;
                    }
                }
            }

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

        return this.calculateProfit(updatedBets, totalStake);
    }

    /**
     * Calcula o valor ajustado da odd sem modificar o objeto bet.
     * Fórmula: adjustedOdd = originalOdd - (originalOdd - 1) * comission
     * @param {Object} bet
     * @returns {number} adjustedOdd
     */
    static computeAdjustedOdd(bet) {
        return bet.odd - (bet.odd - 1) * bet.comission;
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
     * Fluxo de cálculo caso o usuário tenha editado algum campo manualmente.
     * Aqui também atualizamos o campo complementar de lay bets.
     * @param {Array} bets
     * @param {number} totalStake
     * @returns {Array}
     */
    static calculateManuelEdited(bets, totalStake) {
        // Encontra uma lay bet fixa, verificando ambos os campos editados.
        let fixedLay = bets.find(
            (bet) =>
                bet.isEditManualy &&
                bet.fieldEdited !== '' &&
                bet.isLayBet &&
                (bet.editedField === 'Liabilities' ||
                    bet.editedField === "Backer's Stake")
        );

        // Se uma lay bet fixa for encontrada, atualiza o campo complementar.
        if (fixedLay) {
            if (fixedLay.editedField === 'Liabilities') {
                // Se o usuário editou Liabilities, recalcula o Backer's Stake.
                fixedLay.backerStake = fixedLay.liability / (fixedLay.odd - 1);
            } else if (fixedLay.editedField === "Backer's Stake") {
                // Se o usuário editou Backer's Stake, recalcula a Liability.
                fixedLay.liability = fixedLay.backerStake * (fixedLay.odd - 1);
            }
        }

        // Soma dos valores efetivos manuais: para lay bets, usamos a liability; para back bets, o stake.
        let manualSum = 0;
        bets.forEach((bet) => {
            if (bet.isEditManualy && bet.fieldEdited !== '') {
                if (bet.isLayBet) {
                    manualSum += bet.liability;
                } else {
                    manualSum += bet.stake;
                }
            }
        });

        // Se há uma lay bet fixa, para as apostas não editadas (por exemplo, back bets) usamos a fórmula especial:
        if (fixedLay && fixedLay.editedField !== "Backer's Stake") {
            // Para cada back bet não editada, recalculamos a stake como:
            // (fixedLay.backerStake + fixedLay.liability) / bet.odd
            bets.forEach((bet) => {
                if (!bet.isEditManualy && !bet.isLayBet) {
                    bet.stake =
                        (fixedLay.backerStake + fixedLay.liability) / bet.odd;
                }
            });
            // Novo total efetivo é a soma da liability da lay bet fixa + a nova stake das back bets.
            const newTotalEffective =
                fixedLay.liability +
                bets
                    .filter((bet) => !bet.isEditManualy && !bet.isLayBet)
                    .reduce((acc, bet) => acc + bet.stake, 0);

            return this.calculateProfit(bets, newTotalEffective);
        } else {
            // Se não houver lay bet fixa, usa o fluxo antigo.
            const totalEffective = bets.reduce(
                (acc, bet) => acc + (bet.isLayBet ? bet.liability : bet.stake),
                0
            );
            return this.calculateProfit(bets, totalEffective);
        }
    }

    /**
     * Calcula o lucro e a probabilidade para cada aposta.
     * Para back bets: profit = stake * originalOdd - totalStake.
     * Para lay bets: profit = backerStake - (totalStake - liability).
     * @param {Array} bets
     * @param {number} totalStake
     * @returns {Array}
     */
    static calculateProfit(bets, totalStake) {
        return bets.map((bet) => {
            if (!bet.isLayBet) {
                bet.profit = bet.stake * bet.odd - totalStake;
                bet.probability = 1 / bet.odd;
            } else {
                bet.profit = bet.backerStake - (totalStake - bet.liability);
                bet.probability = 1 / bet.odd;
            }
            return bet;
        });
    }
}
