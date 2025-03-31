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
            .map(
                (casa) =>
                    `<span class="badge ${casa.toLowerCase()}">${casa}</span>`
            )
            .join(' ');
    }

    static getVictoryIcon(vitoria) {
        if (vitoria === 'Unresolved') {
            return '⏳ <span class="text-warning">Pendente</span>';
        } else {
            return '✅ <span class="text-success">Resolvido</span>';
        }
    }

    static loadingTable(tableBodyId, colspan) {
        const tableBody = $(`#${tableBodyId}`);

        // Show Skeleton Loader
        tableBody.html(`
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        <tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton-box"></div></td></tr>
        `);
    }

    static showSkeletonCardLoader(containerId, count = 2) {
        const container = $(`#${containerId}`);
        container.empty(); // Limpa o container antes de adicionar os loaders

        for (let i = 0; i < count; i++) {
            const skeletonCard = `
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="skeleton-box" style="width: 50%; height: 20px;"></h5>
                            <p class="skeleton-box" style="width: 80%; height: 15px;"></p>
                            <p class="skeleton-box" style="width: 60%; height: 15px;"></p>
                            <p class="skeleton-box" style="width: 70%; height: 15px;"></p>
                        </div>
                    </div>
                </div>
            `;
            container.append(skeletonCard);
        }
    }
}
