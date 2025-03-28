import { ApiHelper } from "../../utils/ApiHelper.js";
import Utils from "../../utils/Utils.js";
import { TableUtils } from '../../utils/TableUtils.js';

export class SportbookService {
    async getAllSportbook() {
        TableUtils.loadingTable('sportbookTableBody', '7');
        const userId = localStorage.getItem('userId');
        const data = {
            userId : userId
        }
        let sportbooks = await ApiHelper.makeRequest('sportbookbyuserid', data);
        
        if (sportbooks.sportbook) {
            this.populateTable(sportbooks.sportbook)
        }
    }

    populateTable(sportbooks) {
        const tableBody = $("#sportbookTableBody");
        tableBody.empty(); // Limpar dados anteriores
        if (sportbooks.length === 0) {
            tableBody.append('<tr><td colspan="7" class="text-center">Nenhuma aposta encontrada.</td></tr>');
            return;
        }
        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            let ultimaAtualizacao = Utils.formatDateToBRL(sportbook.ultimaAtualizacao);
            const row = `
                <tr>
                    <td data-id="${sportbook.sportbookID}">${sportbook.sportbookID}</td>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${ultimaAtualizacao}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    deleteSportbook(sportbooks) {
        const tableBody = $("#sportbookTableBody");
        tableBody.empty(); // Limpar dados anteriores
    
        if (sportbooks.length === 0) {
            tableBody.append('<tr><td colspan="7" class="text-center">Nenhuma aposta encontrada.</td></tr>');
            return;
        }
    
        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            const row = `
                <tr>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${sportbook.ultimaAtualizacao}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2 editSportbook">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger deleteSportbook">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    async getSportbookById(event) {
        debugger
        const surebetId = $(event.target)
            .closest('.surebetRow')
            .data('surebetid');
        const containerId = 'surebetCards';

        TableUtils.showSkeletonLoader(containerId, 3);

        $('#surebetModal').modal('show');

        try {
            const response = await ApiHelper.makeRequest('getSureBetById', {
                surebetId,
            });

            if (response.status !== 'success') {
                alert('Erro ao buscar dados da SureBet!');
                return;
            }

            const bets = response.bets;
            const cardsContainer = $(`#${containerId}`);
            cardsContainer.empty();

            $('#total').html(`R$ ${bets[0].totalInvestido.toFixed(2)}`);

            let roi = bets[0].roi.toFixed(2);
            let roiColor = roi >= 0 ? 'text-success' : 'text-danger';
            $('#roiId').html(`<span class="${roiColor}">${roi}%</span>`);

            bets.forEach((bet, index) => {
                const isChecked = bet.vitoria === 'Win' ? 'checked' : '';

                const card = `
                    <div class="col-md-6 card-sure-bet" data-cardid="${
                        bet.surebetId
                    }">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title badge fs-5 ${bet.casaDeApostas.toLowerCase()} sportbookid" data-sportbookid=${
                                    bet.sportbookId
                                }>${bet.casaDeApostas}</h5>
                                <p class="text-muted mb-1">Valor Apostado: <strong>R$ ${bet.valorAposta.toFixed(
                                    2
                                )}</strong></p>
                                <p class="text-muted mb-1">Retorno Bruto: <strong>R$ ${bet.retornoBruto.toFixed(
                                    2
                                )}</strong></p>
                                <p class="text-muted">Retorno Líquido: <strong class="${
                                    bet.retornoLiquidoPorAposta >= 0
                                        ? 'text-success'
                                        : 'text-danger'
                                }">R$ ${bet.retornoLiquidoPorAposta.toFixed(
                    2
                )}</strong></p>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="winCheckbox${index}" ${isChecked}>
                                    <label class="form-check-label" for="winCheckbox${index}">Vitória</label>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cardsContainer.append(card);
            });
        } catch (error) {
            alert('Erro ao buscar os dados da SureBet!');
            console.error(error);
        }
    }

    editSportbook(sportbooks) {
        const tableBody = $("#sportbookTableBody");
        tableBody.empty(); // Limpar dados anteriores
    
        if (sportbooks.length === 0) {
            tableBody.append('<tr><td colspan="7" class="text-center">Nenhuma aposta encontrada.</td></tr>');
            return;
        }
    
        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            const row = `
                <tr>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${sportbook.ultimaAtualizacao}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="editSportbook(${sportbook.userId})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSportbook(${sportbook.userId})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }
    
}
