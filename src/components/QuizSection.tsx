import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- DEFINE INTERFACES ---

// Interface for a message coming from your frontend
interface FrontendChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Interface for the request body from your frontend
interface QuizRequest {
  message: string;
  history?: FrontendChatMessage[];
  stage: 'topic' | 'ongoing' | 'completed';
  score: number;
  questionCount: number;
}

// Gemini-specific interfaces for the API call
interface GeminiPart { text: string; }
interface GeminiContent {
  role: 'user' | 'model'; // Gemini uses 'model' for the assistant
  parts: GeminiPart[];
}

// --- HELPER FUNCTION TO TRANSFORM DATA ---
const toGeminiContent = (message: FrontendChatMessage): GeminiContent => ({
  role: message.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: message.content }],
});


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY. Please set it in your function's secrets.");
    }

    const { message, history = [], stage, score, questionCount }: QuizRequest = await req.json();

    // --- SYSTEM PROMPT LOGIC ---
    let systemPromptText = '';
    if (stage === 'topic') {
      systemPromptText = `You are an AI Quizmaster. The user wants a quiz on the topic of "${message}". Your task is to generate the first multiple-choice question for a quiz of 3 questions. Ensure the question is clear and provide four options (A, B, C, D). Crucially, after the question and options, you MUST state the correct answer in the format: "ANSWER: A" on a new line. Do not add any other conversational text.`;
    } else { // 'ongoing' or 'completed'
      systemPromptText = `You are an AI Quizmaster continuing a quiz. The user's previous answer is "${message}". First, evaluate if this answer is correct by looking at the last question you asked in the history. Then, generate the next multiple-choice question (up to a total of 3). Provide four options (A, B, C, D). After the question and options, you MUST state the correct answer in the format: "ANSWER: B" on a new line. If this is the final question, say "QUIZ COMPLETE." at the very end.`;
    }

    // --- CORRECTLY FORMAT HISTORY FOR GEMINI ---
    const contents: GeminiContent[] = history.map(toGeminiContent);
    // Add the latest user message in the correct format
    contents.push({ role: 'user', parts: [{ text: message }] });


    // --- CALL GEMINI API ---
    const response = await fetch(
      `https://generativelan.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents, // Send the correctly formatted history
          systemInstruction: { parts: [{ text: systemPromptText }] },
          generationConfig: { temperature: 0.5, maxOutputTokens: 250 },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawReply) {
      throw new Error("Gemini returned an empty or invalid response.");
    }

    // --- PARSE THE AI'S RESPONSE TO UPDATE QUIZ STATE ---
    let replyText = rawReply;
    let newScore = score;
    let newQuestionCount = questionCount;
    let newStage = stage;

    // Logic to check correctness (this is a simplified example)
    const lastAssistantMessage = history.find(h => h.role === 'assistant')?.content || "";
    const correctAnswerMatch = lastAssistantMessage.match(/ANSWER: ([A-D])/);
    if (correctAnswerMatch && stage === 'ongoing') {
      const correctAnswer = correctAnswerMatch[1];
      if (message.trim().toUpperCase().startsWith(correctAnswer)) {
        newScore++;
      }
    }
    
    // Update stage and counts
    if (stage === 'topic') {
      newStage = 'ongoing';
      newQuestionCount = 1;
    } else if (stage === 'ongoing' && !rawReply.includes("QUIZ COMPLETE.")) {
      newQuestionCount++;
    } else if (rawReply.includes("QUIZ COMPLETE.")) {
      newStage = 'completed';
    }
    
    // Clean the reply to not show the answer to the user
    replyText = rawReply.split("ANSWER:")[0].trim();


    return new Response(JSON.stringify({
        reply: replyText,
        newStage,
        newScore,
        newQuestionCount
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in quiz function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
