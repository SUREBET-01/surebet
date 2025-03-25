import Utils from './Utils.js';

export class TableUtils {
    static populateTable(tableId, bets) {
        const tableBody = $(`#${tableId} tbody`);
        tableBody.empty(); // Clear previous data

        if (bets.length === 0) {
            tableBody.append(
                '<tr><td colspan="5" class="text-center text-muted">Nenhuma aposta encontrada.</td></tr>'
            );
            return;
        }

        const groupedBets = this.groupBetsBySurebetId(bets);

        Object.keys(groupedBets).forEach((surebetId) => {
            const bet = groupedBets[surebetId];
            const casasFormatted = this.formatCasas(bet.casas);

            const row = `
                <tr class="surebetRow" data-sureBetId="${surebetId}">
                    <td>${surebetId}</td>
                    <td>${Utils.formatDateToBRL(bet.data)}</td>
                    <td>${casasFormatted}</td>
                    <td>💰 R$ ${bet.totalInvestido.toFixed(2)}</td>
                    <td>${this.getVictoryIcon(bet.vitoria)}</td>
                </tr>
            `;
            tableBody.append(row);
        });

  
    }

    static groupBetsBySurebetId(bets) {
        const groupedBets = {};

        bets.forEach((bet) => {
            if (!groupedBets[bet.surebetId]) {
                groupedBets[bet.surebetId] = {
                    data: bet.data,
                    totalInvestido: bet.totalInvestido,
                    vitoria: bet.vitoria,
                    casas: [],
                };
            }
            groupedBets[bet.surebetId].casas.push(bet.casaDeApostas);
        });

        return groupedBets;
    }

    static getMaxBettingHouses(groupedBets) {
        return Math.max(
            ...Object.values(groupedBets).map((bet) => bet.casas.length)
        );
    }

    static formatCasas(casas) {
        return casas
            .map((casa) => `<span class="badge ${casa}">${casa.toUpperCase()}</span>`)
            .join(' ');
    }

    static getVictoryIcon(vitoria) {
        if (vitoria === 'Win')
            return '✅ <span class="text-success">Ganhou</span>';
        if (vitoria === 'Loss')
            return '❌ <span class="text-danger">Perdeu</span>';
        return '⏳ <span class="text-warning">Pendente</span>';
    }
}
