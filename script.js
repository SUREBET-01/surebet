let betCount = 2;

document.addEventListener("DOMContentLoaded", () => {
    addInputListeners();
});


function addBet() {
    betCount++;
    const betRow = document.createElement("div");
    betRow.classList.add("row", "g-3", "bet-row", "mb-3");
    betRow.innerHTML = `
        <div class="col-md-3">
            <label for="bettingHouse${betCount}" class="form-label">Betting Houses:</label>
            <input type="text" class="form-control" id="bettingHouse${betCount}" value="Betting House ${betCount}">
        </div>
        <div class="col-md-3">
            <label for="odd${betCount}" class="form-label">Odds:</label>
            <input type="number" class="form-control auto-calc" id="odd${betCount}" value="2.00" step="0.01">
        </div>
        <div class="col-md-3">
            <label for="stake${betCount}" class="form-label">Stake:</label>
            <input type="number" class="form-control" id="stake${betCount}" value="0.00" step="0.01">
        </div>
        ${betCount > 2 ? `
        <div class="col-md-2">
            <button type="button" class="btn btn-danger" onclick="deleteBet(this)" style="margin-top: 30px">
                <i class="fas fa-trash"></i> 
            </button>        
        </div>` : ""}
    `;
    document.getElementById("betContainer").appendChild(betRow);
    addInputListeners();
    handleCalculation();
}

function deleteBet(id) {
    betManager.removeBet(id);
    const betRow = document.querySelector(`.bet-row[data-id='${id}']`);
    if (betRow) {
        betRow.remove();
    }
}

function addInputListeners() {
    document.querySelectorAll("#totalStake, .auto-calc, #lockStake1").forEach(input => {
        input.addEventListener("input", handleCalculation);
    });
}


function handleCalculation() {
    document.getElementById("lockStake1").checked ? calculateBasedOnFixedStake() : calculateBasedOnTotalStake();
    toggleStakeFields();
}

function toggleStakeFields() {
    const isFixedStake = document.getElementById("lockStake1").checked;
    for (let i = 2; i <= betCount; i++) {
        const stakeInput = document.getElementById(`stake${i}`);
        if (isFixedStake) {
            stakeInput.disabled = true; 
        } else {
            stakeInput.disabled = false; 
        }
    }
}

function calculateBasedOnTotalStake() {
    let totalStake = parseFloat(document.getElementById("totalStake").value);
    if (isNaN(totalStake) || totalStake <= 0) return;

    let totalInverseOdds = 0;
    let resultsHTML = "";

    for (let i = 1; i <= betCount; i++) {
        const odd = parseFloat(document.getElementById(`odd${i}`).value);
        if (isNaN(odd) || odd <= 0) return;
        totalInverseOdds += 1 / odd;
    }

    let stakes = [];
    let returns = [];

    for (let i = 1; i <= betCount; i++) {
        const odd = parseFloat(document.getElementById(`odd${i}`).value);
        const bettingHouse = document.getElementById(`bettingHouse${i}`).value;
        const stake = (totalStake * (1 / odd)) / totalInverseOdds;

        document.getElementById(`stake${i}`).value = stake.toFixed(2);
        stakes.push(stake);
        returns.push(stake * odd);

        resultsHTML += `
       <div class="row mb-2">
            <div class="col-4"><strong>Betting House:</strong> ${bettingHouse}</div>
            <div class="col-4"><strong>Stake:</strong> ${stake.toFixed(2)}</div>
            <div class="col-4"><strong>Net Return:</strong> ${(stake * odd).toFixed(2)}</div>
        </div>
        `;
    }

    displayResults(returns, totalStake, resultsHTML);
}

function calculateBasedOnFixedStake() {
    let stake1 = parseFloat(document.getElementById("stake1").value);
    const odd1 = parseFloat(document.getElementById("odd1").value);
    const bettingHouse1 = document.getElementById("bettingHouse1").value;

    if (isNaN(stake1) || stake1 <= 0 || isNaN(odd1) || odd1 <= 0) return;

    let resultsHTML = "";
    let stakes = [stake1];
    let returns = [stake1 * odd1];
    let expectedReturn = stake1 * odd1;
    let totalStake = stake1;

    resultsHTML += `
        <div class="row mb-2">
            <div class="col-4"><strong>Betting House 2:</strong> ${bettingHouse1}</div>
            <div class="col-4"><strong>Stake:</strong> ${stake1.toFixed(2)}</div>
            <div class="col-4"><strong>Net Return:</strong> ${(stake1 * odd1).toFixed(2)}</div>
        </div>
    `;

    for (let i = 2; i <= betCount; i++) {
        const odd = parseFloat(document.getElementById(`odd${i}`).value);
        const bettingHouse = document.getElementById(`bettingHouse${i}`).value;

        if (isNaN(odd) || odd <= 0) return;

        let stake = expectedReturn / odd;
        document.getElementById(`stake${i}`).value = stake.toFixed(2);
        stakes.push(stake);
        totalStake += stake;
        returns.push(stake * odd);

        resultsHTML += `
            <div class="row mb-2">
                <div class="col-4"><strong>Casa:</strong> ${bettingHouse}</div>
                <div class="col-4"><strong>Stake:</strong> ${stake.toFixed(2)}</div>
                <div class="col-4"><strong>Net Return:</strong> ${(stake * odd).toFixed(2)}</div>
            </div>
        `;
    }

    displayResults(returns, totalStake, resultsHTML);
}

function displayResults(returns, totalStake, resultsHTML) {
    const minReturn = Math.min(...returns);
    const netProfit = minReturn - totalStake;
    const roi = (netProfit / totalStake) * 100;

    resultsHTML += `
        <div class="row mb-2">
            <div class="col-4"><strong>Total Stake:</strong> ${totalStake.toFixed(2)}</div>
            <div class="col-4"><strong>Net Profit:</strong> ${netProfit.toFixed(2)}</div>
            <div class="col-4"><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
        </div>
    `;

    document.getElementById("resultContainer").innerHTML = resultsHTML;
}


document.getElementById("isFreeBet").addEventListener("change", function () {
    document.getElementById("freeBetFields").style.display = this.checked ? "block" : "none";
    if (!this.checked) {
        document.getElementById("promoName").value = "";
    }
});

async function sendToGoogleSheets() {
    // Limpar a classe de erro de todos os campos
    document.querySelectorAll(".bet-row input").forEach(input => input.classList.remove("is-invalid"));
    let resultIsEmpty =document.getElementById("resultContainer").innerText
    console.log()
    if(!resultIsEmpty) {
        showError("Por favor, vocé precisar ter alguma resultado");
        return;
    }


    const totalStake = parseFloat(document.getElementById("totalStake").value);
    if (isNaN(totalStake) || totalStake <= 0) {
        showError("Por favor, insira um valor válido para o total da aposta.");
        document.getElementById("totalStake").classList.add("is-invalid");
        return;
    }

    let isValid = true;
    
    document.querySelectorAll(".bet-row").forEach((betRow, index) => {
        const odd = parseFloat(betRow.querySelector(`[id^=odd]`).value);
        const stake = parseFloat(betRow.querySelector(`[id^=stake]`).value);
        
        if (isNaN(odd) || odd <= 0) {
            isValid = false;
            showError(`Por favor, insira uma odd válida para a aposta ${index + 1}.`);
            betRow.querySelector(`[id^=odd]`).classList.add("is-invalid");
        }
        
        if (isNaN(stake) || stake <= 0) {
            isValid = false;
            showError(`Por favor, insira um valor válido para a stake da aposta ${index + 1}.`);
            betRow.querySelector(`[id^=stake]`).classList.add("is-invalid");
        }
    });

    if (document.getElementById("isFreeBet").checked) {
        const freeBetExpiry = document.getElementById("freeBetExpiry").value;
        const freeBetReturn = parseFloat(document.getElementById("freeBetReturn").value);
        
        if (!freeBetExpiry) {
            isValid = false;
            showError("Por favor, insira a data de expiração da Free Bet.");
            document.getElementById("freeBetExpiry").classList.add("is-invalid");
        }
        
        if (isNaN(freeBetReturn) || freeBetReturn <= 0) {
            isValid = false;
            showError("Por favor, insira um valor válido para o retorno esperado da Free Bet.");
            document.getElementById("freeBetReturn").classList.add("is-invalid");
        }
    }

    // Se algum campo estiver inválido, interrompe o envio
    if (!isValid) {
        return;
    }

    // Exibe o modal de carregamento
    const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
    loadingModal.show();  // Exibe o modal

    // Se tudo estiver válido, enviar os dados para o Google Sheets
    const bets = [];

    document.querySelectorAll(".bet-row").forEach((betRow, index) => {
        const bettingHouse = betRow.querySelector(`[id^=bettingHouse]`).value;
        const stake = parseFloat(betRow.querySelector(`[id^=stake]`).value);
        const odd = parseFloat(betRow.querySelector(`[id^=odd]`).value);
        const netReturn = stake * odd;

        bets.push({ bettingHouse, stake, odd, netReturn });
    });
    
    const netProfit = document.getElementById("resultContainer").innerText.match(/Net Profit:\s*(-?\d+\.\d+)/)[1];
    const roi = document.getElementById("resultContainer").innerText.match(/ROI:\s*(-?\d+\.\d+)%/)[1];
    const surebetId = Date.now().toString();

    const isFreeBet = document.getElementById("isFreeBet").checked;
    const freeBetExpiry = isFreeBet ? document.getElementById("freeBetExpiry").value : null;
    const freeBetReturn = isFreeBet ? document.getElementById("freeBetReturn").value : null;

    const postData = { bets, totalStake, netProfit, roi, surebetId, isFreeBet, freeBetExpiry, freeBetReturn };
    
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwryZxhplBkvuvPBQF45zAvmc7MChMQMUkjUozY5feFabKPJY-aj9DrBhpgiA0djM48/exec", {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'text/plain' }
        });

        console.log("Success:", await response.json());

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Oculta o modal de carregamento após o envio
        loadingModal.hide();  // Oculta o modal
    }
}



// Função para mostrar o erro usando Toastify
function showError(message) {
    Toastify({
        text: message,
        duration: 5000, // tempo em milissegundos
        close: true,
        gravity: "top", // posição no topo
        position: "right", // à direita da tela
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        stopOnFocus: true, // interrompe quando o usuário passa o mouse sobre
        offset: {
            x: 20, // Distância da borda lateral (em pixels)
            y: 10  // Distância do topo (em pixels)
        }
    }).showToast();
}



