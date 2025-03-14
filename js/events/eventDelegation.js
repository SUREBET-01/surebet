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
    loginService
) => {
    $('#addBetButton').click(() => handleAddBet(BetManager, uiUpdater));
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
            handleComissionInput(BetManager, event, uiUpdater)
        )
        .on('click', '.delete-bet', (event) =>
            handleDeleteBet(BetManager, uiUpdater, event)
        )
        .on('change', '.fixed-stake-radio', (event) =>
            handleFixedStakeChange(uiUpdater, event)
        )
        .on('change', '.lay-bet-switch', (event) =>
            handleLayBet(BetManager, event, uiUpdater)
        )
        .on('change', '#comissionCheckbox', (event) =>
            handleComissionCheckBox(event)
        )
        .on('input', '#totalStake', () => handleTotalStakeinput(uiUpdater));
};
