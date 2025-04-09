import ToastManager from '../../utils/ToastManager.js';
import { ApiHelper } from '../../utils/ApiHelper.js';
import { TableUtils } from '../../utils/TableUtils.js';
import Ultils from '../../utils/Utils.js';

export default class BetsService {
    async getAllBets() {
        try {
            TableUtils.loadingTable('betsTableBody', '5');
            const userId = localStorage.getItem('userId');
            const response = await ApiHelper.makeRequest('getBetsByUserId', {
                userId,
            });

            TableUtils.populateTable('betsTable', response.bets);
        } catch (error) {
            ToastManager.showError('Erro ao buscar apostas: ' + error.message);
        }
    }

    async getSurebetByid(event) {
        const surebetId = $(event.target)
            .closest('.surebetRow')
            .data('surebetid');
        const containerId = 'surebetCards';

        TableUtils.showSkeletonCardLoader(containerId, 3);

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

    async updateSureBetWinner() {
        const confirmButton = '#confirmWinnerBtn';
        const closeButton = '#closeModelBets';
        Ultils.toggleButtonLoading(confirmButton, true, 'Atualizando...');
        $(closeButton).prop('disabled', true);

        const betsData = [];

        $('#surebetCards .card-sure-bet').each(function () {
            const betId = $(this).data('cardid');
            const isChecked = $(this).find('.form-check-input').is(':checked');
            const sportbookid = $(this)
                .find('.sportbookid')
                .data('sportbookid');

            betsData.push({
                surebetId: betId,
                win: isChecked,
                sportbookid: sportbookid,
            });
        });

        try {
            const response = await ApiHelper.makeRequest(
                'updateSureBetWinner',
                { bets: betsData }
            );

            if (response.status === 'success') {
                ToastManager.showSuccess('Resultado salvo com sucesso!');
                $('#surebetModal').modal('hide');
            } else {
                alert('Erro ao salvar os resultados.');
            }
        } catch (error) {
            console.error('Erro ao atualizar SureBet:', error);
            ToastManager.showError('Erro ao salvar os resultados.');
        } finally {
            Ultils.toggleButtonLoading(
                confirmButton,
                false,
                'Atualizando...',
                'Confirmar Vitória'
            );
            $(closeButton).prop('disabled', false);

            this.getSumarySportbook();
            this.getAllBets();
        }
    }

    async getSumarySportbook() {
        const userId = localStorage.getItem('userId');
        TableUtils.showSkeletonCardLoader('betCardsContainer', 4);

        const response = await ApiHelper.makeRequest('sportbookbyuserid', {
            userId: userId,
        });
        $('#betCardsContainer').empty();

        response.sportbook.forEach((sportbook) => {
            const saldoClass =
                sportbook.saldo >= 0
                    ? 'text-success fw-bold'
                    : 'text-danger fw-bold';

            const card = `
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <span class="badge ${sportbook.nomedacasa.toLowerCase()}">
                                    ${sportbook.nomedacasa}
                                </span>
                                <i class="bi bi-person-circle mx-2 text-muted"></i>
                                <small class="text-muted">${
                                    sportbook.proprietario
                                }</small>
                            </div>
                            <a href="${
                                sportbook.url
                            }" target="_blank" class="text-decoration-none">
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                        </h5>
                        <p class="card-text">
                            <i class="bi bi-clock-history"></i> Última atualização: 
                            <strong>${Ultils.formatDateToBRL(
                                sportbook.ultimaAtualizacao
                            )}</strong>
                        </p>
                        <p class="card-text">
                            Saldo: <span class="${saldoClass}">R$ ${sportbook.saldo.toFixed(
                2
            )}</span>
                        </p>
                    </div>
                </div>

            `;

            $('#betCardsContainer').append(card);
        });
    }
}
