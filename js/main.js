import Bet from './modules/Bet.js';
import BetManager from './modules/BetManager.js';
import ResultCalculator from './modules/ResultCalculator.js';
import Validation from './utils/Validation.js';

const betManager = new BetManager();
let userEditingTotalStake = false; 
let userEditingStake = false; 

$(document).ready(function () {
    initializeDefaultBets();
    addInputListeners();
    handleCalculation();
});

// Adicionar uma nova aposta
$("#addBetButton").click(function () {
    const bet = betManager.addBet();
    addBetRow(bet);
    handleCalculation(); 
});

function addInputListeners() {
    $(document).on("input", ".auto-calc, #totalStake", function () {
        handleCalculation();
    });

    $(document).on("input", ".auto-calc[id^='stake']", function () {
        calculateTotalStake();
        handleCalculation();
    });


     $("#totalStake").on("focus", function () {
        userEditingTotalStake = true; 
    });

    $("#totalStake").on("blur", function () {
        userEditingTotalStake = false; 
        handleCalculation(); 
    });

    $(document).on("focus", ".stake-input", function () {
        userEditingStake = true;  // Marca como editado manualmente
    });
    
    $(document).on("blur", ".stake-input", function () {
        userEditingStake = false;  // Marca como não editado manualmente
        handleCalculation();  // Recalcula os resultados após a edição
    });
    

    $(document).on("input", ".auto-calc[id^='odd']", function () {
        let betId = $(this).closest(".bet-row").data("id");
        let newOdd = parseFloat($(this).val()) || 0;
    
        let bet = betManager.bets.find(b => b.id === betId);
        if (bet) {
            bet.odd = newOdd; 
        }
    
        handleCalculation(); 
    });
}

function handleCalculation() {
    let totalStake = parseFloat($("#totalStake").val()) || 120;

    if (!Validation.isValidStake(totalStake)) {
        showError("Please enter a valid total stake.");
        return;
    }

    let fixedBetId = $(".fixed-stake-radio:checked").data("id") || null;
    let isTotalInvestmentBase = $("#radioTotalInvestment").is(":checked");

    const results = ResultCalculator.calculateResults(
        betManager.bets, 
        totalStake, 
        fixedBetId, 
        isTotalInvestmentBase
    );

    // Atualizar as stakes na UI sem modificar as editadas manualmente
    betManager.bets.forEach(bet => {
        if (!userEditingStake) {
            $(`#stake${bet.id}`).val(bet.stake.toFixed(2));  // Atualiza apenas se não estiver editando manualmente
        }
    });

    $("#resultResume").html(results.resultsResume)
    $("#resultContainer").html(results.resultsHTML); 
    calculateTotalStake();

}




function calculateTotalStake() {
    if (userEditingTotalStake) return; 


    let total = 0;
    $(".bet-row").each(function () {
        let stake = parseFloat($(this).find(".auto-calc[id^='stake']").val()) || 0;
        total += stake;
    });

    $("#totalStake").val(total.toFixed(2));
    return total;
}

// Inicializar apostas padrão
function initializeDefaultBets() {
    $("#totalStake").val(120); // Definir o investimento total padrão

    const defaultBets = [
        new Bet(1, 'Betting House 1', 2.0, 60),
        new Bet(2, 'Betting House 2', 2.0, 60)
    ];

    defaultBets.forEach(bet => {
        betManager.addBet(bet);
        addBetRow(bet);
    });

    handleCalculation(); // Garantir que os resultados apareçam logo no início
}

function addBetRow(bet) {
    let deleteButton = bet.id > 2 ? `
        <div class="col-md-2">
            <button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px">
                <i class="fas fa-trash"></i>
            </button>
        </div>` : "";

    let betRow = `
        <div class="row g-3 bet-row mb-3" data-id="${bet.id}">
            <div class="col-md-1 d-flex align-items-center">
                <input type="radio" name="calculationBase" class="form-check-input fixed-stake-radio" data-id="${bet.id}">
            </div>
            <div class="col-md-3">
                <label for="bettingHouse${bet.id}" class="form-label">Betting House</label>
                <input type="text" class="form-control" id="bettingHouse${bet.id}" value="${bet.bettingHouse}">
            </div>
            <div class="col-md-3">
                <label for="odd${bet.id}" class="form-label">Odds</label>
                <input type="number" class="form-control auto-calc" id="odd${bet.id}" value="${bet.odd}" step="0.01">
            </div>
            <div class="col-md-3">
                <label for="stake${bet.id}" class="form-label">Stake</label>
                <input type="number" class="form-control auto-calc stake-input" id="stake${bet.id}" value="${bet.stake}" step="0.01">
            </div>
            ${deleteButton}
        </div>
    `;

    $("#betContainer").append(betRow);
}


// Deletar aposta e recalcular os resultados
$(document).on("click", ".delete-bet", function () {
    let id = $(this).data("id");
    betManager.removeBet(id);
    $(`.bet-row[data-id="${id}"]`).remove();
    handleCalculation(); // Recalcula os resultados após remover uma aposta
});

$(document).on("input", ".stake-input", function () {
    let betId = $(this).closest(".bet-row").data("id");
    let newStake = parseFloat($(this).val()) || 0;
    
    let bet = betManager.bets.find(b => b.id === betId);
    if (bet) {
        bet.stake = newStake;
    }

    let totalStake = betManager.bets.reduce((sum, b) => sum + b.stake, 0);
    $("#totalStake").val(totalStake.toFixed(2));

    handleCalculation();
});
$(document).on("change", ".fixed-stake-radio", function () {
    let fixedBetId = $(this).data("id");
    let bet = betManager.getBetById(fixedBetId);
    
    if (bet) {
        $("#stake" + fixedBetId).prop("readonly", false); // Permitir edição na stake fixa
    }

    handleCalculation();
});



// Exibir mensagens de erro
function showError(message) {
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
    }).showToast();
}