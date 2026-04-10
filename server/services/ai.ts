import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
  private static getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  static async generateInsights(prompt: string) {
    const model = this.getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  static async analyzeData(data: any, context: string) {
    const model = this.getModel();
    const prompt = `
      You are an expert AI Product Manager for JetLearn.
      Analyze the following data in the context of: ${context}
      Data: ${JSON.stringify(data)}
      Provide actionable insights and recommendations.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
