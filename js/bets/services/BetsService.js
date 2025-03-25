import ToastManager from '../../utils/ToastManager.js';
import { ApiHelper } from '../../utils/ApiHelper.js';
import { TableUtils } from '../../utils/TableUtils.js';

export default class BetsService {
    async getAllBets() {
        try {
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
        const surebetId = $(event.target).parent().data('surebetid');
    
        const response = await ApiHelper.makeRequest('getSureBetById', {
            surebetId,
        });
    
        if (response.status !== 'success') {
            alert('Erro ao buscar dados da SureBet!');
            return;
        }
    
        const bets = response.bets;
        const cardsContainer = $('#surebetCards');
        cardsContainer.empty();
    
        // Exibir Total Investido e ROI com cores dinâmicas
        $('#total').html(`R$ ${bets[0].totalInvestido.toFixed(2)}`);
        
        let roi = bets[0].roi.toFixed(2);
        let roiColor = roi >= 0 ? "text-success" : "text-danger";
        $('#roiId').html(`<span class="${roiColor}">${roi}%</span>`);
    
        bets.forEach((bet, index) => {
            const card = `
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${bet.casaDeApostas}</h5>
                            <p class="text-muted mb-1">Valor Apostado: <strong>R$ ${bet.valorAposta.toFixed(2)}</strong></p>
                            <p class="text-muted mb-1">Retorno Bruto: <strong>R$ ${bet.retornoBruto.toFixed(2)}</strong></p>
                            <p class="text-muted">Retorno Líquido: <strong class="${bet.retornoLiquidoPorAposta >= 0 ? 'text-success' : 'text-danger'}">R$ ${bet.retornoLiquidoPorAposta.toFixed(2)}</strong></p>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="winCheckbox${index}">
                                <label class="form-check-label" for="winCheckbox${index}">Vitória</label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cardsContainer.append(card);
        });
    
        $('#surebetModal').modal('show');
    }
    
    async updateSureBetWinner(){

    }
}
