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
                <tr class="sportbookRow" data-sportbookid="${sportbook.sportbookID}">
                    <td>${sportbook.sportbookID}</td>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${ultimaAtualizacao}</td>
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
        const sportbookID = $(event.target).closest('.sportbookRow').data('sportbookid');
        const containerId = 'editForm';
        
        const tableBody = $(`#${containerId}`);
        tableBody.empty(); // Clear previous data
        
        TableUtils.showSkeletonLoader(containerId, 3);
           
        $('#editModal').modal('show');

        try {
            const response = await ApiHelper.makeRequest('doGetSportbookById', {
                sportbookID,
            });
            if (response.status !== 'success') {
                alert('Erro ao buscar dados da SureBet!');
                return;
            }

            const formContainer = $(`#${containerId}`);
            
            const sportbooks = response.sportbook;

            tableBody.empty(); // Clear previous data

            sportbooks.forEach((sportbook, index) => {
                let ultimaAtualizacao = Utils.formatDateToBRL(sportbook.ultimaAtualizacao);
                const formInputs = `
                    <div class="mb-3">
                        <label class="form-label">User ID</label>
                        <input type="text" class="form-control" value="${sportbook.userId}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Sportbook ID</label>
                        <input type="text" class="form-control" value="${sportbook.sportbookID}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nome da Casa</label>
                        <input type="text" class="form-control" value="${sportbook.nomedacasa}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Saldo</label>
                        <input type="number" class="form-control" value="${sportbook.saldo}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Proprietário</label>
                        <input type="text" class="form-control" value="${sportbook.proprietario}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Última Atualização</label>
                        <input type="text" class="form-control" value="${ultimaAtualizacao}" readonly disabled>
                    </div>
                `;
    
                formContainer.append(formInputs);
            });
        } catch (error) {
            alert('Erro ao buscar os dados da Sportbook!');
            console.error(error);
        }
    }

    editSportbook(event) {
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
