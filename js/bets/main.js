import BetsService from './services/BetsService.js';

const betsService = new BetsService();

$(document).ready(() => {
    betsService.getAllBets();
});
