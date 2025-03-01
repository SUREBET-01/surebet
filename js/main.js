import BetManager from './models/BetManager.js';
import ResultCalculator from './calculations/ResultCalculator.js';
import Validation from './utils/Validation.js';
import UIUpdater from './components/UIUpdater.js';
import GoogleSheetsService from './services/GoogleSheetsService.js';
import ToastManager from './utils/ToastManager.js';
import { setupEventListeners } from './events/eventDelegation.js';

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
