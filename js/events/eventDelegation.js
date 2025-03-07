import {
    handleAddBet,
    handleOddInputChange,
    handleFixedStakeChange,
    handleDeleteBet,
    handleManualStakeInput,
    handleBettingHouseInput,
    handleOddInput,
    handleCpfCountInput,
    handleLayBet,
} from './eventHandlers.js';

export const setupEventListeners = (
    BetManager,
    uiUpdater,
    googleSheetsService
) => {
    $('#addBetButton').click(() => handleAddBet(BetManager, uiUpdater));
    $('#roundStakesCheckbox').change(() => uiUpdater.handleBackBetCalculation());
    $('#isFreeBet').change(() => uiUpdater.toggleFreeBetFields());
    $('#cpfCount').on('input', (event) => handleCpfCountInput(event));
    $('#saveButton').click(() => googleSheetsService.saveToGoogleSheets());

    $(document)
        .on('input', ".auto-calc[id^='odd']", (event) =>
            handleOddInputChange(BetManager, uiUpdater, event)
        )
        .on('input', '.stake-input', (event) =>
            handleManualStakeInput(BetManager, uiUpdater, event)
        )
        .on('input', "[id^='bettingHouse']", (event) =>
            handleBettingHouseInput(BetManager, event)
        )
        .on('input', "[id^='odd']", (event) =>
            handleOddInput(BetManager, event)
        )
        .on('click', '.delete-bet', (event) =>
            handleDeleteBet(BetManager, uiUpdater, event)
        )
        .on('change', '.fixed-stake-radio', (event) =>
            handleFixedStakeChange(BetManager, uiUpdater, event)
        )
        .on('change', '.lay-bet-switch', (event) =>
            handleLayBet(BetManager, event, uiUpdater)
        )
        .on('input', '#totalStake', () => uiUpdater.handleTotalStakeBlur());
};
