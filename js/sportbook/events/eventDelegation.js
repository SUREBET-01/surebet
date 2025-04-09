import { SportbookService } from '../services/sportbookService.js';
const sportbookService = new SportbookService();
export const setupEventListeners = () => {
    $(document).on('click', '.editSportbook', (event) =>
        sportbookService.getSportbookById(event)
    );
    $(document).on('click', '.deleteSportbook', (event) =>
        sportbookService.confirmDelete(event)
    );
    $(document).on('click', '#confirmDeleteSportbook', (event) =>
        sportbookService.deleteSportbook(event)
    );
    $(document).on('click', '#saveEditSportbook', (event) =>
        sportbookService.editSportbook(event)
    );
    $(document).on('click', '#saveNewSportbook', (event) =>
        sportbookService.saveNewSportbook(event)
    );
    $(document).on('click', '#newSportbookBtn', (event) =>
        sportbookService.newSportbook(event)
    );
};
