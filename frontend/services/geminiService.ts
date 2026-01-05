import { GoogleGenAI } from "@google/genai";
import { InvestigationCase } from "../types";

const SYSTEM_INSTRUCTION = `
You are Elias Thorne, a world-renowned private investigator. 
Your persona is inspired by Benoit Blanc: brilliant, slightly theatrical, Southern-mannered, and incredibly observant.
You speak with a sophisticated but grounded drawl, using colorful metaphors to describe the complexities of a case.

Your goal is to assist the user (your fellow investigator) in solving murder mysteries. 
Analyze the data provided: suspects, clues, timelines, and theories.
Point out contradictions, suggest new lines of inquiry, and challenge the user's reasoning in a helpful, inquisitive way.

Keep your responses concise but flavored with your unique personality. 
Never reveal the "true" answer unless the user presents a flawless accusation. 
Always refer to the case files provided in the context.
`;

export class DetectiveAI {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Use Vite's import.meta.env for environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeCase(activeCase: InvestigationCase, userMessage: string): Promise<string> {
    if (!this.ai) {
      return "I apologize, but my connection to the investigation network seems to be down. Please check your API configuration.";
    }

    const caseContext = `
    CURRENT CASE DATA:
    Title: ${activeCase.title}
    Description: ${activeCase.description}
    Suspects: ${activeCase.suspects.map(s => `${s.name} (${s.role}): ${s.description}. Alibi: ${s.alibi}. Motive: ${s.motive}`).join(' | ')}
    Clues: ${activeCase.clues.map(c => `${c.title}: ${c.description} (Source: ${c.source}, Confidence: ${c.confidence})`).join(' | ')}
    Timeline: ${activeCase.timeline.map(t => `${t.time} - ${t.description} ${t.isGap ? '[GAP]' : ''}`).join(' | ')}
    Statements: ${activeCase.statements.map(s => `${s.speakerName} (${s.timestamp}): "${s.content}"`).join(' | ')}
    Theories: ${activeCase.theories.map(t => `${t.title}: ${t.content}`).join(' | ')}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: `CONTEXT: ${caseContext}` },
          { text: `USER QUESTION: ${userMessage}` }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });

      return response.text || "I'm afraid I've lost my train of thought, dear friend. Let's look at those clues again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "The fog seems to have settled in on my reasoning. Let me take a moment to clear my head.";
    }
  }

  // Quick analysis methods for prompt shortcuts
  async analyzeTimeline(activeCase: InvestigationCase): Promise<string> {
    return this.analyzeCase(activeCase, "Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
  }

  async analyzeSuspect(activeCase: InvestigationCase, suspectId: string): Promise<string> {
    const suspect = activeCase.suspects.find(s => s.id === suspectId);
    if (!suspect) return "I don't have that suspect in my files, I'm afraid.";
    return this.analyzeCase(activeCase, `Analyze suspect ${suspect.name}. Examine their alibi, motive, and any statements they've made.`);
  }

  async challengeTheory(activeCase: InvestigationCase, theoryId: string): Promise<string> {
    const theory = activeCase.theories.find(t => t.id === theoryId);
    if (!theory) return "I don't see that theory in the case files.";
    return this.analyzeCase(activeCase, `Challenge this theory: "${theory.title} - ${theory.content}". Find any flaws or contradictions.`);
  }
}

export const detectiveAI = new DetectiveAI();

