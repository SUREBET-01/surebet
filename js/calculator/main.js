import BetManager from './models/BetManager.js';
import Validation from '../utils/Validation.js';
import UIUpdater from './components/UIUpdater.js';
import GoogleSheetsService from './services/GoogleSheetsService.js';
import { setupEventListeners } from './events/eventDelegation.js';
import LoginService from './services/LoginService.js';

const betManager = new BetManager();
const validation = new Validation();
const loginService = new LoginService();
const uiUpdater = new UIUpdater(betManager);
const googleSheetsService = new GoogleSheetsService(
    betManager,
    validation,
    uiUpdater,
);

$(document).ready(() => {
    loginService.checkLogin();
    uiUpdater.initializeDefaultBets();
    setupEventListeners(betManager, uiUpdater, googleSheetsService, loginService);
});
