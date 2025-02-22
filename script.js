let betCount = 2;

document.addEventListener("DOMContentLoaded", () => {
    addInputListeners();
});


function addBet() {
    betCount++;
    const betRow = document.createElement("div");
    betRow.classList.add("row", "g-3", "bet-row", "mb-3");
    betRow.innerHTML = `
        <div class="col-md-4">
            <label for="bettingHouse${betCount}" class="form-label">Casa de Apostas:</label>
            <input type="text" class="form-control" id="bettingHouse${betCount}" value="Casa ${betCount}">
        </div>
        <div class="col-md-3">
            <label for="odd${betCount}" class="form-label">Odds:</label>
            <input type="number" class="form-control auto-calc" id="odd${betCount}" value="2.00" step="0.01">
        </div>
        <div class="col-md-3">
            <label for="stake${betCount}" class="form-label">Stake:</label>
            <input type="number" class="form-control" id="stake${betCount}" value="0.00" step="0.01">
        </div>
    `;
    document.getElementById("betContainer").appendChild(betRow);
    addInputListeners();
}


function addInputListeners() {
    document.querySelectorAll("#totalStake, .auto-calc, #lockStake1").forEach(input => {
        input.addEventListener("input", handleCalculation);
    });
}


function handleCalculation() {
    document.getElementById("lockStake1").checked ? calculateBasedOnFixedStake() : calculateBasedOnTotalStake();
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
            <div class="result-row">
                <div><strong>Casa:</strong> ${bettingHouse}</div>
                <div><strong>Stake:</strong> ${stake.toFixed(2)}</div>
                <div><strong>Net Return:</strong> ${(stake * odd).toFixed(2)}</div>
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
        <div class="result-row">
            <div><strong>Casa:</strong> ${bettingHouse1}</div>
            <div><strong>Stake:</strong> ${stake1.toFixed(2)}</div>
            <div><strong>Net Return:</strong> ${(stake1 * odd1).toFixed(2)}</div>
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
            <div class="result-row">
                <div><strong>Casa:</strong> ${bettingHouse}</div>
                <div><strong>Stake:</strong> ${stake.toFixed(2)}</div>
                <div><strong>Net Return:</strong> ${(stake * odd).toFixed(2)}</div>
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
        <div class="result-row">
            <div><strong>Total Stake Corrigido:</strong> ${totalStake.toFixed(2)}</div>
            <div><strong>Net Profit:</strong> ${netProfit.toFixed(2)}</div>
            <div><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
        </div>
    `;

    document.getElementById("resultContainer").innerHTML = resultsHTML;
}

document.getElementById("isFreeBet").addEventListener("change", function () {
    document.getElementById("freeBetFields").style.display = this.checked ? "block" : "none";
});

async function sendToGoogleSheets() {
    const bets = [];

    document.querySelectorAll(".bet-row").forEach((betRow, index) => {
        const bettingHouse = betRow.querySelector(`[id^=bettingHouse]`).value;
        const stake = parseFloat(betRow.querySelector(`[id^=stake]`).value);
        const odd = parseFloat(betRow.querySelector(`[id^=odd]`).value);
        const netReturn = stake * odd;

        bets.push({ bettingHouse, stake, odd, netReturn });
    });

    const totalStake = document.getElementById("totalStake").value;
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
            headers: { 'Content-Type':  'text/plain' }
        });

        console.log("Success:", await response.json());

    } catch (error) {
        console.error("Error:", error);
    }
}
