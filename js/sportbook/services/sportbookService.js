import { ApiHelper } from "../../utils/ApiHelper.js";
import { Utils } from "../../utils/Utils.js";

export default class sportbooksService {
    async getAllSportbook() {
        const userId = localStorage.getItem('userId');
        const data = {
            userId : userId
        }

        let sportbooks = await ApiHelper.makeRequest('sportbookbyuserid', data);
        
        if (sportbooks.sportbook) {
            this.populateTable(sportbooks.sportbook)
        }
    }

    populateTable(sportbooks) {
        const tableBody = $("#sportbookTableBody");
        tableBody.empty(); // Limpar dados anteriores
    
        if (sportbooks.length === 0) {
            tableBody.append('<tr><td colspan="6" class="text-center">Nenhuma aposta encontrada.</td></tr>');
            return;
        }
    
        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            const row = `
                <tr>
                    <td data-id="${sportbook.sportbookID}>${sportbook.sportbookID}</td>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${sportbook.ultimaAtualizacao}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="editSportbook(${sportbook.userId})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSportbook(${sportbook.userId})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    deleteSportbook(sportbooks) {
        const tableBody = $("#sportbookTableBody");
        tableBody.empty(); // Limpar dados anteriores
    
        if (sportbooks.length === 0) {
            tableBody.append('<tr><td colspan="6" class="text-center">Nenhuma aposta encontrada.</td></tr>');
            return;
        }
    
        sportbooks.forEach((sportbook) => {
            let saldo = Utils.formatToBRL(sportbook.saldo);
            const row = `
                <tr>
                    <td>${sportbook.userId}</td>
                    <td>${sportbook.nomedacasa}</td>
                    <td>${saldo}</td>
                    <td>${sportbook.proprietario}</td>
                    <td>${sportbook.ultimaAtualizacao}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="editSportbook(${sportbook.userId})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSportbook(${sportbook.userId})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }
    
}
