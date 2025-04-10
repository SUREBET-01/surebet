import { setupEventListeners } from './events/eventDelegation.js';
import { SportbookService } from './services/sportbookService.js';

const sportbookService = new SportbookService();

$('.nav-link').click(function (e) {
    e.preventDefault();
    if ($(this).data('tab') === 'sportbook') {
        sportbookService.getAllSportbook();
    }
});

$(document).ready(() => {
    sportbookService.getAllSportbook();
    setupEventListeners();
});
