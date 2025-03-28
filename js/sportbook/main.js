import { SportbookService } from './services/SportbookService.js';

const sportbookService = new SportbookService();

$('.nav-link').click(function (e) {
    e.preventDefault();
    if ($(this).data('tab') === 'sportbook') {
        sportbookService.getAllSportbook();
    }
});

$(document).ready(() => {
    sportbookService.getAllSportbook();
});
