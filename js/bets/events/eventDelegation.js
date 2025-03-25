import BetsService from "../services/BetsService.js";
const betsService = new BetsService();
export const setupEventListeners = () => {
    $(document).on('click', '.surebetRow', (event) => betsService.getSurebetByid(event));
    $(document).on('click', '#confirmWinnerBtn', (event) => betsService.updateSureBetWinner(event));
};
