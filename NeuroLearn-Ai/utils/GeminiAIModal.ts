import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Chat,
} from "@google/genai";

let chatSession: Chat | null = null;

function getChatSession(): Chat {
  if (chatSession) return chatSession;

  const apiKey: string = process.env.GEMINI_API_KEY as string;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. Make sure .env.local exists in the project root.",
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  chatSession = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    },
  });

  return chatSession;
}

export { getChatSession };
