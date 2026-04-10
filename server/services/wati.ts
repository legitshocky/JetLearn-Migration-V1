import axios from "axios";

export class WatiService {
  private static getBaseConfig() {
    const endpoint = process.env.WATI_API_ENDPOINT;
    const token = process.env.WATI_ACCESS_TOKEN;
    if (!endpoint || !token) throw new Error("WATI configuration is missing");
    
    return {
      baseUrl: endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint,
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  static async sendMessage(phoneNumber: string, templateName: string, parameters: { name: string; value: string }[]) {
    const { baseUrl, headers } = this.getBaseConfig();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const url = `${baseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`;

    const payload = {
      template_name: templateName,
      broadcast_name: "JetLearn_Notification",
      parameters: parameters.map(p => ({
        name: p.name,
        value: p.value || "N/A"
      })),
    };

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }
}
