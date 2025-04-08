import BetManager from './models/BetManager.js';
import Validation from '../utils/Validation.js';
import UIUpdater from './components/UIUpdater.js';
import GoogleSheetsService from './services/GoogleSheetsService.js';
import { setupEventListeners } from './events/eventDelegation.js';
import LoginService from './services/LoginService.js';
import BetUIManager from './components/BetUIManager.js';

const betManager = new BetManager();
const validation = new Validation();
const loginService = new LoginService();
const uiUpdater = new UIUpdater(betManager);
const googleSheetsService = new GoogleSheetsService(
    betManager,
    validation,
    uiUpdater,
);

$(document).ready( async () => {
    loginService.checkLogin();
    uiUpdater.initializeDefaultBets();

    const betHouses = await googleSheetsService.getHousesByUserId();
    const betUIManager = new BetUIManager(betHouses, betManager, uiUpdater);

    setupEventListeners(betManager, uiUpdater, googleSheetsService, loginService, betUIManager);
    googleSheetsService.getHousesByUserId();
});
