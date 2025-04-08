import {
    handleAddBet,
    handleOddInputChange,
    handleFixedStakeChange,
    handleDeleteBet,
    handleManualStakeInput,
    handleBettingHouseInput,
    handleLayBet,
    handleComissionInput,
    handleComissionCheckBox,
    handleTotalStakeinput,
    handleSheetsChange,
} from './eventHandlers.js';

export const setupEventListeners = (
    BetManager,
    uiUpdater,
    googleSheetsService,
    loginService,
    betUIManager
) => {
    $('#addBetButton').click(() =>
        handleAddBet(BetManager, betUIManager, uiUpdater)
    );
    $('#roundStakesCheckbox').change(() => uiUpdater.handleBetsCalculate());
    $('#isFreeBet').change(() => uiUpdater.toggleFreeBetFields());
    $('#saveButton').click(() => googleSheetsService.saveToGoogleSheets());
    $('#login').click(() => loginService.loginUsuario());
    $('#register').click(() => loginService.submitLogin());
    $('#importSheets').click(() => googleSheetsService.verifyTable());
    $('#sheetSelector').change((event) => handleSheetsChange(event));

    $(document)
        .on('input', ".auto-calc[id^='odd']", (event) =>
            handleOddInputChange(BetManager, uiUpdater, event)
        )
        .on('input', '.stake-input, .backerStake-input', (event) =>
            handleManualStakeInput(BetManager, uiUpdater, event)
        )
        .on('input', "[id^='bettingHouse']", (event) =>
            handleBettingHouseInput(BetManager, event)
        )
        .on('input', '.comissionInput', (event) =>
            handleComissionInput(BetManager, uiUpdater, event)
        )
        .on('click', '.delete-bet', (event) =>
            handleDeleteBet(BetManager, betUIManager, uiUpdater, event)
        )
        .on('change', '.fixed-stake-radio', (event) =>
            handleFixedStakeChange(uiUpdater, event)
        )
        .on('change', '.lay-bet-switch', (event) =>
            handleLayBet(BetManager, uiUpdater, event)
        )
        .on('change', '#comissionCheckbox', (event) =>
            handleComissionCheckBox(event)
        )
        .on('change', '.bettingHouse', (event) =>
            betUIManager.updateOwnerOptions(event)
        )
        .on('change', '.owner-select', (event) =>
            betUIManager.handleOwnerChange(event)
        )
        .on('input', '#totalStake', () => handleTotalStakeinput(uiUpdater));
};
