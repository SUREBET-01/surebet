import BetsService from './services/BetsService.js';

$(".nav-link").click(function (e) {
    e.preventDefault();
    if ($(this).data("tab") === 'bets') {
        betsService.getAllBets();
    }
});

const betsService = new BetsService();

$(document).ready(() => {
    betsService.getAllBets();
});
