export default class Utils {
    static getSheetId(url) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    static formatToBRL(value) {
        
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(value);
    }
     
    static formatDateToBRL(dateString) {
        const date = new Date(dateString);
        
        // Format date (DD/MM/YYYY)
        const formattedDate = date.toLocaleDateString("pt-BR");
        
        // Format time (HH:mm)
        const formattedTime = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        
        return `${formattedDate} ${formattedTime}`;
    }

    static showAlert(message, type = 'success') {
        let icon = '';
        let colorClass = ''; // Classe CSS para o botão de fechar (verde ou vermelho)
    
        // Adiciona ícones e modifica o texto para erro ou sucesso
        if (type === 'error') {
            icon = '<i class="fas fa-times-circle"></i> '; // Ícone de erro (FontAwesome)
            colorClass = 'btn-danger'; // Cor vermelha para o botão de fechar
        } else {
            icon = '<i class="fas fa-check-circle"></i> '; // Ícone de sucesso (FontAwesome)
            colorClass = 'btn-success'; // Cor verde para o botão de fechar
        }
    
        // Adiciona a estrutura da modal com fundo branco
        const modalHtml = `
            <div class="modal fade" id="customAlert" tabindex="-1" aria-labelledby="alertLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content bg-white">
                        <div class="modal-header">
                            <h5 class="modal-title" id="alertLabel">${icon} Alerta</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn ${colorClass}" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Adiciona o HTML da modal ao body
        $('body').append(modalHtml);
    
        // Exibe a modal
        const modal = new bootstrap.Modal(document.getElementById('customAlert'));
        modal.show();
    
        // Remove a modal após fechar
        $('#customAlert').on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
        });
        

    }
    
}
