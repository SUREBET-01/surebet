import { ApiHelper } from '../../utils/ApiHelper.js';
import Utils from '../../utils/Utils.js';
import { TableUtils } from '../../utils/TableUtils.js';

export class SportbookService {
    async getAllSportbook() {
        TableUtils.loadingTable('sportbookTableBody', '7');
        const userId = localStorage.getItem('userId');
        const data = {
            userId: userId,
        };
        let sportbooks = await ApiHelper.makeRequest('sportbookbyuserid', data);

        if (sportbooks.sportbook) {
            this.populateTable(sportbooks.sportbook);
        }
    }

    populateTable(sportbooks) {
        const tableBody = $('#sportbookTableBody');
        tableBody.empty(); // Limpar dados anteriores

        if (sportbooks.length === 0) {
            tableBody.append(
                '<tr><td colspan="7" class="text-center">Nenhuma aposta encontrada.</td></tr>'
            );
            return;
        }

        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            let ultimaAtualizacao = Utils.formatDateToBRL(
                sportbook.ultimaAtualizacao
            );
            const row = `
                <tr class="sportbookRow" data-sportbookid="${
                    sportbook.sportbookID
                }">
                    <td>${sportbook.sportbookID}</td>
                    <td>${sportbook.userId}</td>
                    <td><span class="badge ${sportbook.nomedacasa.toLowerCase()}">${
                sportbook.nomedacasa
            }</span></td>
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

    confirmDelete(event) {
        const sportbookID = $(event.target)
            .closest('.sportbookRow')
            .data('sportbookid');
        const containerId = 'deleteConfirmationModal';
        const tableBody = $(`#${containerId}`);

        $('#confirmDeleteSportbook').val(sportbookID);
        $('#deleteConfirmationModal').modal('show');
    }

    async deleteSportbook(event) {
        const sportbookID = $('#confirmDeleteSportbook').val();

        $('#confirmDeleteSportbook').html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Excluindo...'
        );

        try {
            const response = await ApiHelper.makeRequest('deleteSportbook', {
                sportbookID,
            });
            if (response.status == 'success') {
                Utils.showAlert('Excluido com sucesso!', 'success');
                $('#deleteConfirmationModal').modal('hide');

                this.getAllSportbook();
                return;
            } else {
                Utils.showAlert('Erro ao Deletar!', 'error');
                alert('Erro ao Deletar!');
                return;
            }
        } catch (error) {
            Utils.showAlert('Erro ao Deletar!', 'error');
            console.error(error);
        } finally {
            // Restaura o estado do botão após o processo ser concluído
            $('#confirmDeleteSportbook').html('Deletar');
            $('#confirmDeleteSportbook').prop('disabled', false);
        }
    }

    async getSportbookById(event) {
        const sportbookID = $(event.target)
            .closest('.sportbookRow')
            .data('sportbookid');
        const containerId = 'editForm';

        const tableBody = $(`#${containerId}`);
        tableBody.empty(); // Clear previous data

        TableUtils.loadingTable(containerId, 3);

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
                let ultimaAtualizacao = Utils.formatDateToBRL(
                    sportbook.ultimaAtualizacao
                );
                const formInputs = `
                    <div class="mb-3">
                        <label class="form-label">User ID</label>
                        <input type="text" id='UserID' class="form-control" value="${sportbook.userId}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Sportbook ID</label>
                        <input type="text" id='sportbookID' class="form-control" value="${sportbook.sportbookID}" readonly disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nome da Casa</label>
                        <input type="text" id='novonomedacasa' class="form-control" value="${sportbook.nomedacasa}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Saldo</label>
                        <input type="number" id='novosaldo' class="form-control" value="${sportbook.saldo}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Proprietário</label>
                        <input type="text" id='novoproprietario' class="form-control" value="${sportbook.proprietario}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Última Atualização</label>
                        <input type="text" id='ultimaAtualizacao' class="form-control" value="${ultimaAtualizacao}" readonly disabled>
                    </div>
                `;

                formContainer.append(formInputs);
            });
        } catch (error) {
            alert('Erro ao buscar os dados da Sportbook!');
            console.error(error);
        }
    }

    async editSportbook(event) {
        let nomedacasa = $('#novonomedacasa').val();
        let saldo = $('#novosaldo').val();
        let proprietario = $('#novoproprietario').val();

        if (
            nomedacasa.length == 0 ||
            saldo.length == 0 ||
            proprietario.length == 0
        ) {
            Utils.showAlert('Preencha todos os campos', 'error');
            return;
        }

        const sportbookData = {
            userId: $('#UserID').val(),
            sportbookID: $('#sportbookID').val(),
            nomedacasa: nomedacasa,
            saldo: saldo,
            proprietario: proprietario,
            ultimaAtualizacao: $('#ultimaAtualizacao').val(),
        };

        $('#saveEditSportbook').html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Atualizando...'
        );

        try {
            const response = await ApiHelper.makeRequest('updateSportbook', {
                sportbookData,
            });

            if (response.status == 'success') {
                Utils.showAlert('Sportbook editado com sucesso!', 'success');

                $('#editModal').modal('hide');

                this.getAllSportbook();
                return;
            } else {
                $('#editModal').modal('hide');
                Utils.showAlert('Erro ao Editar!', 'error');
                return;
            }
        } catch (error) {
            $('#editModal').modal('hide');
            Utils.showAlert('Erro ao Editar!', 'error');
            console.error(error);
        } finally {
            // Restaura o estado do botão após o processo ser concluído
            $('#saveEditSportbook').html('Salvar');
            $('#saveEditSportbook').prop('disabled', false);
        }
    }

    async saveNewSportbook(event) {
        const userId = localStorage.getItem('userId');

        var nomeDaCasa = $('#nomeDaCasa').val();
        var proprietario = $('#proprietario').val();
        var saldo = $('#saldo').val();

        if (
            nomeDaCasa.length == 0 ||
            proprietario.length == 0 ||
            saldo.length == 0
        ) {
            Utils.showAlert('Preencha todos os campos', 'error');
            return;
        }

        const sportbookData = {
            userId: userId,
            nomedacasa: nomeDaCasa,
            saldo: saldo,
            proprietario: proprietario,
        };

        $('#saveNewSportbook').html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Criando...'
        );

        try {
            const response = await ApiHelper.makeRequest('addSportbook', {
                sportbookData,
            });

            if (response.status == 'success') {
                Utils.showAlert('Sportbook adicionado com sucesso!', 'success');

                $('#newSportbookModal').modal('hide');

                this.getAllSportbook();

                return;
            } else {
                $('#newSportbookModal').modal('hide');
                Utils.showAlert('Erro ao Adicionar!', 'error');
                return;
            }
        } catch (error) {
            $('#newSportbookModal').modal('hide');
            Utils.showAlert('Erro ao Adicionar!', 'error');
            console.error(error);
        } finally {
            // Restaura o estado do botão após o processo ser concluído
            $('#saveNewSportbook').html('Salvar');
        }
    }

    async newSportbook() {
        // Mostrar o modal primeiro
        $('#newSportbookModal').modal('show');
    
        // Fazer a requisição para obter as casas
        const response = await ApiHelper.makeRequest('getAllHouses', 'get');
    
        // Gerar as opções
        const houseOptions = this.generateOptions(response.houses);
    
        // Substituir o conteúdo do <select>
        $('#selectBethouses').html(houseOptions);
    
        // Destruir o selectpicker antigo (opcional, mas recomendado)
        $('#selectBethouses').selectpicker('destroy');
    
        // Re-inicializar o selectpicker
        $('#selectBethouses').selectpicker('refresh');
    }
    

    generateOptions(options) {
        return `
            <option value="" disabled selected>Selecione</option>
            ${options
                .map(
                    (house) =>
                        `<option value="${house.houseId}" data-content="<span class='badge ${house.houseName.toLowerCase()}'>${house.houseName}</span>">${house.houseName}</option>`
                )
                .join('')}
        `;
    }
    
}
