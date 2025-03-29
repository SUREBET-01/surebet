import { SportbookService } from "../services/SportbookService.js";
import {closeModel } from "../events/eventHandlers.js"
const sportbookService = new SportbookService();
export const setupEventListeners = () => {
    $(document).on('click', '.editSportbook', (event) => sportbookService.getSportbookById(event));
    $(document).on('click', '.deleteSportbook', (event) => sportbookService.confirmDelete(event));
    $(document).on('click', '#confirmDeleteSportbook',  (event) => sportbookService.deleteSportbook(event));
    $(document).on('click', '#saveEditSportbook',  (event) => sportbookService.editSportbook(event));
    $(document).on('click', '#saveNewSportbook',  (event) => sportbookService.newSportbook(event));
};
