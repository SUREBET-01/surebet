import BetsService from './services/BetsService.js';
import { setupEventListeners } from './events/eventDelegation.js';

$('.nav-link').click(function (e) {
    e.preventDefault();
    if ($(this).data('tab') === 'bets') {
        betsService.getAllBets();
        betsService.getSumarySportbook();
    }
});

const betsService = new BetsService();

$(document).ready(() => {
    betsService.getAllBets();
    betsService.getSumarySportbook();
    setupEventListeners();
});
