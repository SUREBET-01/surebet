export default class BetUIManager {
    constructor(betHouses, betManager, uiUpdater, selectedOwners = []) {
        this.betHouses = betHouses;
        this.betManager = betManager;
        this.uiUpdater = uiUpdater;
        this.selectedOwners = selectedOwners;
    }

    generateBettingHouseOptions() {
        const uniqueHouses = this.betHouses.filter(
            (house, index, self) =>
                index === self.findIndex((h) => h.houseId === house.houseId)
        );

        return `
            <option value="" disabled selected>Selecione</option>
            ${uniqueHouses
                .map(
                    (house) =>
                        `<option value="${house.houseId}" data-sportbook="${house.sportbook}">${house.houseName}</option>`
                )
                .join('')}
        `;
    }

    generateBetRow(bet) {
        const betHouseOptions = this.generateBettingHouseOptions();

        const deleteButton =
            bet.id > 2
                ? `<div class="col-md-1"><button type="button" class="btn btn-danger delete-bet" data-id="${bet.id}" style="margin-top: 30px"><i class="fas fa-trash"></i></button></div>`
                : '';

        return `
            <div class="row g-3 bet-row mb-3 border-top mt-0" data-id="${
                bet.id
            }">
                <div class="col-md-1 d-flex align-items-center">
                    <input type="radio" class="form-check-input fixed-stake-radio" 
                        name="fixedStake" data-id="${bet.id}">
                </div>
                
                ${this.generateSelectColumn(bet.id, betHouseOptions)}
                <div class="col-md-1 border-end"></div>
                ${this.generateOddColumn(bet)}
                ${this.generateCommissionColumn(bet)}
                
                ${this.generateStakeColumn(bet)}
                
                ${this.generateLayBetSwitchColumn(bet)}
                
                ${deleteButton}
                
            </div>
            <div class="row prop-row g-3 mb-3" data-id="${bet.id}">
                <div class="col-md-1"></div>
                ${this.generateOwnerColumn(bet.id, betHouseOptions)}
                <div class="col-md-1 border-end"></div>
                ${this.generateBackerStakeColumn(bet)}
            </div>
        `;
    }

    generateSelectColumn(betId, options) {
        return `
        <div class="col-md-2 ">
            <label for="bettingHouse${betId}" class="form-label">Casa</label>
            <select class="selectpicker bettingHouse form-control" id="bettingHouse${betId}" data-live-search="true">
               ${options}               
            </select>
        </div>
        `;
    }

    generateOwnerColumn(betId, options) {
        return `
           <div class="col-md-2 " >
            <label for="owner${betId}" class="form-label">Proprietário</label>
            <select class="selectpicker owner-select form-control" id="owner${betId}" data-live-search="true">
            ${options}               
            </select>
        </div>
        `;
    }

    generateOddColumn(bet) {
        return `
        <div class="col-md-1">
            <label for="odd${bet.id}"  id="label-odd${
            bet.id
        }" class="form-label">Odds</label>
            <input type="number" class="form-control auto-calc" id="odd${
                bet.id
            }" value="${bet.odd.toFixed(2)}" step="0.01">
        </div>
        `;
    }

    generateCommissionColumn(bet) {
        return `
            <div class="col-md-1 d-none comissionContainer">
                <label for="commission${bet.commission}" id="label-commission${
            bet.commission
        }" class="form-label">Comissão</label>
                <input type="number" class="form-control comissionInput" id="commission${
                    bet.commission
                }" value="${bet.commission.toFixed(2)}" step="0.01">
            </div>
        `;
    }

    generateStakeColumn(bet) {
        return `
            <div class="col-md-2">
                <label for="stake${bet.id}" id="label-stake${bet.id}" class="form-label">Stake</label>
                <input type="number" class="form-control auto-calc stake-input" id="stake${bet.id}" value="${bet.stake}" step="0.01">
            </div>
        `;
    }

    generateLayBetSwitchColumn(bet) {
        return `
            <div class="col-md-2">
                <div class="form-check form-switch" style="margin-top: 38px">
                    <label class="form-check-label" for="stake${bet.id}">Lay bet?</label>
                    <input class="form-check-input lay-bet-switch" type="checkbox" role="switch" data-id="${bet.id}">
                </div>
            </div>
        `;
    }

    generateBackerStakeColumn(bet) {
        return `
            <div class="col-md-2 backerStakeContainer d-none" id="backerStakeContainer${bet.id}">
                <label for="backerStake${bet.id}" class="form-label">Backer's Stake</label>
                <input type="number" class="form-control backerStake-input" id="backerStake${bet.id}" value="">
            </div>
        `;
    }

    addBetRow(bet) {
        const betRow = this.generateBetRow(bet);
        $('#betContainer').append(betRow);
        $('.selectpicker').selectpicker();
    }

    updateOwnerOptions(event) {
        const houseId = $(event.target).val();
        const betId = $(event.target).closest('.bet-row').data('id');
        const ownerSelect = $(`#owner${betId}`);
        const selectedText = $(event.target).find('option:selected').text();

        this.selectedOwners = this.selectedOwners.filter(
            (ownerObj) => ownerObj.betId !== betId
        );

        this.betManager.bets.forEach((bet) => {
            if (betId == bet.id) {
                bet.bettingHouse = selectedText;
            }
        });

        ownerSelect.selectpicker('destroy');
        ownerSelect.empty();

        const filteredOwners = this.betHouses.filter(
            (house) => house.houseId == houseId
        );

        this.removeDisabled(this.selectedOwners);

        const selectedOwnersInOtherBets =
            this.selectedOwners.length > 0
                ? this.selectedOwners
                      .filter((ownerObj) => ownerObj.house == selectedText)
                      .map((ownerObj) => ownerObj.owner)
                : [];

        filteredOwners.forEach((house) => {
            const isDisabled = selectedOwnersInOtherBets.includes(house.owner);
            const disabledAttr = isDisabled ? 'disabled' : '';

            ownerSelect.append(
                `<option value="${house.owner}" data-sportbook="${house.sportbook}" data-houseName="${house.houseName}" ${disabledAttr}>${house.owner}</option>`
            );
        });

        ownerSelect.selectpicker();

        this.handleOwnerChange();

        this.uiUpdater.handleBetsCalculate();
    }

    removeDisabled(filteredOwners) {
        $('select.owner-select').each((index, ownerSelect) => {
            let $ownerOption = $(ownerSelect).find('option');
            let ownerValue = $ownerOption.val();
            let houseName = $ownerOption.data('housename');
            if (ownerValue !== undefined && houseName !== undefined) {
                filteredOwners.forEach((owner) => {
                    if (
                        ownerValue !== owner.owner &&
                        houseName !== owner.house
                    ) {
                        $ownerOption.prop('disabled', false);
                        $(ownerSelect).selectpicker('destroy').selectpicker();
                    }
                });

                if (filteredOwners.length === 0) {
                    $ownerOption.prop('disabled', false);
                    $(ownerSelect).selectpicker('destroy').selectpicker();
                }
            }
        });
    }

    handleOwnerChange() {

        // Captura as seleções de dono por aposta
        this.selectedOwners = $('select.owner-select').map(function () {
            const $select = $(this);
            const propRow = $select.closest('.prop-row');
            const betId = propRow.data('id');
    
            const selectedOption = $select.find('option:selected');
            const ownerName = selectedOption.val();
            const houseName = selectedOption.data('housename');
    
            if (ownerName && ownerName !== 'Selecione') {
                return {
                    betId: betId,
                    house: houseName,
                    owner: ownerName
                };
            }
    
            return null;
        }).get();

        $('select.owner-select option').prop('disabled', false);
        this.selectedOwners.forEach(({ betId: currentBetId, owner, house }) => {
            $('select.owner-select').each(function () {
                const $select = $(this);
                const otherPropRow = $select.closest('.prop-row');
                const otherBetId = otherPropRow.data('id');

                if (currentBetId !== otherBetId) {
                    $select.find('option').each(function () {
                        const optionHouse = $(this).data('housename');
                        const optionOwner = $(this).val();
    
                        if (optionHouse === house && optionOwner === owner) {
                            $(this).prop('disabled', true);
                        }
                    });
                }
            });
        });
    
    
        this.removeDisabled(this.selectedOwners); // mantém se você precisar
    }
    
    updateOddInputs() {
        this.betManager.bets.forEach((bet) => {
            $(`#odd${bet.id}`).val(bet.odd);
        });
    }
    
    
}
