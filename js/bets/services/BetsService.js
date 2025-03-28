import ToastManager from '../../utils/ToastManager.js';
import { ApiHelper } from '../../utils/ApiHelper.js';
import { TableUtils } from '../../utils/TableUtils.js';

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

    async updateSureBetWinner() {

        $('#confirmWinnerBtn').html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Atualizando...'
        );
        $('#confirmWinnerBtn').prop('disabled', true);

        // Desabilitar o botão de fechar do modal
        $('#closeModelBets').prop('disabled', true);

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
            // Envia os dados para a API
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
            // Restaura o estado do botão após o processo ser concluído
            $('#confirmWinnerBtn').html('Confirmar Vitória');
            $('#confirmWinnerBtn').prop('disabled', false);
            $('#closeModelBets').prop('disabled', false);
        }
    }
    async getSumarySportbook() {

        const userId = localStorage.getItem('userId');

        const response = await ApiHelper.makeRequest('sportbookbyuserid', {userId: userId});
        console.log(response)
    }
}
