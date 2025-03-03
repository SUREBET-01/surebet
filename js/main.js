import BetManager from './models/BetManager.js';
import Validation from './utils/Validation.js';
import UIUpdater from './components/UIUpdater.js';
import GoogleSheetsService from './services/GoogleSheetsService.js';
import { setupEventListeners } from './events/eventDelegation.js';

const betManager = new BetManager();
const validation = new Validation();
const uiUpdater = new UIUpdater(betManager);
const googleSheetsService = new GoogleSheetsService(
    betManager,
    validation,
    uiUpdater
);

$(document).ready(() => {
    uiUpdater.initializeDefaultBets();
    setupEventListeners(betManager, uiUpdater, googleSheetsService);
});
