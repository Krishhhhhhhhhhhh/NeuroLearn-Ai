import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not set. Make sure .env.local exists in the project root.",
      );
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateVideoSummary(
    title: string,
    description: string,
  ): Promise<string> {
    try {
      const modelName = "gemini-2.0-flash";

      const prompt = `
        Create a concise, educational summary of this video based on its title and description:

        Title: ${title}
        Description: ${description}

        Provide a clear, structured summary that:
        1. Explains what the viewer will learn
        2. Highlights key concepts covered
        3. Mentions the target audience level
        4. Keeps it under 150 words

        Format as plain text with bullet points where appropriate.
      `;

      const result = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = result.text ?? "";
      console.log("[Gemini DEBUG] Raw summary response:", text);
      return text;
    } catch (error: any) {
      if (error && error.status === 404) {
        console.error(
          "[Gemini ERROR] Model not found. Please check the model name and your API access.",
        );
      }
      console.error("Gemini API Error:", error);
      return "Summary unavailable. Please watch the video for full content.";
    }
  }

  async generateQuiz(title: string, description: string): Promise<any[]> {
    try {
      const modelName = "gemini-2.0-flash";

      const prompt = `
        Based on this educational video, create 3 multiple-choice questions:

        Title: ${title}
        Description: ${description}

        Generate questions that:
        1. Test understanding of key concepts
        2. Are appropriate for the content level
        3. Have 4 answer options each
        4. Include explanations for correct answers

        Return as JSON array with this structure:
        [
          {
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Why this is correct"
          }
        ]

        Return only valid JSON, no additional text.
      `;

      const result = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = result.text ?? "";
      console.log("[Gemini DEBUG] Raw quiz response:", text);

      // Extract the first JSON array from the response
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e) {
          console.error("[Gemini DEBUG] JSON parse error:", e);
        }
      }

      // Fallback if JSON parsing fails
      return [
        {
          question: "What is the main topic of this video?",
          options: ["Concept A", "Concept B", "Concept C", "All of the above"],
          correctAnswer: 3,
          explanation: "This video covers multiple related concepts.",
        },
      ];
    } catch (error: any) {
      if (error && error.status === 404) {
        console.error(
          "[Gemini ERROR] Model not found. Please check the model name and your API access.",
        );
      }
      console.error("Gemini Quiz Generation Error:", error);
      return [];
    }
  }

  async enhanceJobKeywords(jobTitle: string, jobDescription: string) {
    try {
      const prompt = `
      You are an AI career and learning assistant. Your task is to analyze a job description and provide a structured learning plan.

      Analyze the following job title and description and return a JSON object with three properties:
      1. "title": A concise, curated job title (e.g., "Full Stack Developer").
      2. "summary": A brief, one-sentence summary of the core technical requirements for this role.
      3. "keywords": An array of the top 10 most critical technologies and concepts from the description.

      Do not include any conversational text, explanations, or code formatting. The entire response must be a valid JSON object.

      Job Title: ${jobTitle}
      Job Description:
      ${jobDescription}
    `;

      const result = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      let jsonString = (result.text ?? "").trim();

      // Clean response (remove markdown code fences if Gemini adds them)
      jsonString = jsonString.replace(/```json|```/g, "").trim();

      console.log("[Gemini DEBUG] Cleaned JSON:", jsonString);

      const enhancedData = JSON.parse(jsonString);
      return enhancedData;
    } catch (error) {
      console.error("Error enhancing job keywords with Gemini:", error);
      return {
        title: jobTitle,
        summary: "Failed to generate AI-enhanced data.",
        keywords: [],
      };
    }
  }

  async categorizeDifficulty(
    title: string,
    description: string,
  ): Promise<string> {
    try {
      const prompt = `
        Categorize the difficulty level of this educational content:

        Title: ${title}
        Description: ${description}

        Return only one word: "beginner", "intermediate", or "advanced"

        Guidelines:
        - beginner: Basic concepts, no prerequisites, introductory
        - intermediate: Some background knowledge needed, building on basics
        - advanced: Complex topics, assumes prior knowledge, specialized
      `;

      const result = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const difficulty = (result.text ?? "").toLowerCase().trim();

      if (["beginner", "intermediate", "advanced"].includes(difficulty)) {
        return difficulty;
      }
      return "beginner"; // default fallback
    } catch (error: any) {
      console.warn(
        "[Gemini] Error categorizing difficulty (using fallback):",
        error?.message,
      );
      // Use keyword-based fallback when Gemini API is unavailable or rate-limited
      return this.categorizeDifficultyFallback(title, description);
    }
  }

  private categorizeDifficultyFallback(
    title: string,
    description: string,
  ): string {
    const text = `${title} ${description}`.toLowerCase();

    // Advanced keywords
    const advancedKeywords = [
      "advanced",
      "expert",
      "professional",
      "complex",
      "optimization",
      "architecture",
      "system design",
      "deep dive",
      "specialized",
      "enterprise",
      "performance tuning",
      "advanced concepts",
    ];

    // Intermediate keywords
    const intermediateKeywords = [
      "intermediate",
      "building",
      "development",
      "implementation",
      "project",
      "application",
      "best practices",
      "design patterns",
      "practical",
      "hands-on",
      "build",
    ];

    if (advancedKeywords.some((keyword) => text.includes(keyword))) {
      return "advanced";
    }

    if (intermediateKeywords.some((keyword) => text.includes(keyword))) {
      return "intermediate";
    }

    return "beginner";
  }
}
