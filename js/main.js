import BetManager from './modules/BetManager.js';
import ResultCalculator from './modules/calculation/ResultCalculator.js';
import Validation from './utils/Validation.js';
import UIUpdater from './modules/UIUpdater.js';
import GoogleSheetsService from './services/GoogleSheetsService.js';
import ToastManager from './utils/ToastManager.js';
import { setupEventListeners } from './modules/eventDelegation.js';

const betManager = new BetManager();
const resultCalculator = new ResultCalculator();
const validation = new Validation();
const uiUpdater = new UIUpdater(betManager);
const toastManager = new ToastManager();
const googleSheetsService = new GoogleSheetsService(
    betManager,
    validation,
    uiUpdater
); 

$(document).ready(() => {
    uiUpdater.initializeDefaultBets();
    setupEventListeners(betManager, uiUpdater, googleSheetsService);
});
