import SportbookService from "../services/SportbookService.js";
import {closeModel } from "../events/eventHandlers.js"
const sportbookService = new SportbookService();
export const setupEventListeners = () => {
    $(document).on('click', '.editSportbook', (event) => sportbookService.getSportbookById(event));
    $(document).on('click', '#confirmWinnerBtn', (event) => betsService.updateSureBetWinner(event));
    $(document).on('click', '#closeModelBets', () => closeModel());
};
