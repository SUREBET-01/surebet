export class ApiHelper {
    static async makeRequest(action, data) {
        try {
            const response = await $.ajax({
                url: 'https://script.google.com/macros/s/AKfycbyhM5bbZeEhFsbH4kf6Bt_XV8zQ2xJJc31cJelkDfpBeJm7jwMLF-MjreQTHUQ30te2/exec',
                type: 'POST',
                contentType: 'text/plain',
                data: JSON.stringify({ action, ...data }),
            });

            return response;
        } catch (error) {
            throw new Error(error.message || error.responseText);
        }
    }
}
