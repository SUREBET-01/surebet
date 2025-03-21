import ToastManager from "../../utils/ToastManager.js";
import { ApiHelper } from '../../utils/ApiHelper.js';

export default class BetsService {
    async getAllBets() {
        try {
            const userId = localStorage.getItem('userId');
            const response = await ApiHelper.makeRequest('getBetsByUserId', {
                userId,
            });

            console.log(response);
            this.populateTable(response.bets);
        } catch (error) {
            ToastManager.showError('Erro ao buscar apostas: ' + error.message);
        }
    }

    populateTable(bets) {
        const tableBody = $('#betsTableBody');
        tableBody.empty(); // Clear previous data

        if (bets.length === 0) {
            tableBody.append(
                '<tr><td colspan="14" class="text-center">Nenhuma aposta encontrada.</td></tr>'
            );
            return;
        }

        bets.forEach((bet) => {
            const row = `
                <tr>
                    <td>${bet.userId}</td>
                    <td>${bet.surebetId}</td>
                    <td>${bet.data}</td>
                    <td>${bet.casaDeApostas}</td>
                    <td>${bet.odd}</td>
                    <td>${bet.valorAposta.toFixed(2)}</td>
                    <td>${bet.totalInvestido}</td>
                    <td>${bet.retornoLiquidoPorAposta.toFixed(2)}</td>
                    <td>${bet.lucroTotal}</td>
                    <td>${bet.retornoBruto.toFixed(2)}</td>
                    <td>${bet.roi}</td>
                    <td>${bet.probabilidade.toFixed(2)}</td>
                    <td>${bet.comissao}</td>
                    <td>${bet.freeBet ? 'Sim' : 'Não'}</td>
                    <td>${bet.dataExpiracaoFreeBet || 'N/A'}</td>
                    <td>${bet.retornoFreeBet || 'N/A'}</td>
                    <td>${bet.numeroCPFsContasUsados}</td>
                    <td>${bet.vitoria ? 'Sim' : 'Não'}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }
}
