import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  ChatSession,
  GenerationConfig,
  SafetySetting
} from "@google/generative-ai";

let chatSession: ChatSession | null = null;

function getChatSession(): ChatSession {
  if (chatSession) return chatSession;

  const apiKey: string = process.env.GEMINI_API_KEY as string;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Make sure .env.local exists in the project root.');
  }

  const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(apiKey);

  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings: SafetySetting[] = [
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
  ];

  chatSession = model.startChat({
    generationConfig,
    safetySettings,
  });

  return chatSession;
}

export { getChatSession };
