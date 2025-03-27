export default class Utils {
    static getSheetId(url) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    static formatToBRL(value) {
        
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(value);
    }
     
    static formatDateToBRL(dateString) {
        const date = new Date(dateString);
        
        // Format date (DD/MM/YYYY)
        const formattedDate = date.toLocaleDateString("pt-BR");
        
        // Format time (HH:mm)
        const formattedTime = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        
        return `${formattedDate} ${formattedTime}`;
    }
    
}
