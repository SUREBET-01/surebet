import {
    handleAddBet,
    handleStakeInputChange,
    handleOddInputChange,
    handleFixedStakeChange,
    handleDeleteBet,
    handleManualStakeInput,
    handleBettingHouseInput,
    handleOddInput,
    handleCpfCountInput,
} from './eventHandlers.js';

export const setupEventListeners = (
    betManager,
    uiUpdater,
    googleSheetsService, // Add googleSheetsService as a parameter
) => {
    $('#addBetButton').click(() => handleAddBet(betManager, uiUpdater));
    $('#roundStakesCheckbox').change(() => uiUpdater.handleCalculation());
    $('#isFreeBet').change(() => uiUpdater.toggleFreeBetFields());
    $('#cpfCount').on('input', (event) => handleCpfCountInput(event));
    $('#saveButton').click(() => googleSheetsService.saveToGoogleSheets()); // Use googleSheetsService

    $(document)
        .on('input', '.auto-calc, #totalStake', () => uiUpdater.handleCalculation())
        .on('input', ".auto-calc[id^='stake']", (event) => handleStakeInputChange(uiUpdater, event))
        .on('input', ".auto-calc[id^='odd']", (event) => handleOddInputChange(betManager, uiUpdater, event))
        .on('focus', '#totalStake', () => uiUpdater.handleTotalStakeFocus())
        .on('blur', '#totalStake', () => uiUpdater.handleTotalStakeBlur())
        .on('focus', '.stake-input', () => uiUpdater.handleStakeInputFocus())
        .on('blur', '.stake-input', () => uiUpdater.handleStakeInputBlur())
        .on('change', '.fixed-stake-radio', (event) => handleFixedStakeChange(betManager, uiUpdater, event))
        .on('click', '.delete-bet', (event) => handleDeleteBet(betManager, uiUpdater, event))
        .on('input', '.stake-input', (event) => handleManualStakeInput(betManager, uiUpdater, event))
        .on('input', "[id^='bettingHouse']", (event) => handleBettingHouseInput(betManager, event))
        .on('input', "[id^='odd']", (event) => handleOddInput(betManager, event))

};