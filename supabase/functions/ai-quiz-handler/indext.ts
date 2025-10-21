import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Ensure you have set this in your Supabase project's secrets
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Define the CORS headers to allow requests from your web app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Looser for development, consider changing to your Vercel URL in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- INTERFACES ---
// Describes a message from the frontend's perspective
interface FrontendChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
// Describes the entire request body sent from the frontend
interface QuizRequest {
  message: string;
  history?: FrontendChatMessage[];
  stage: 'topic' | 'ongoing' | 'completed';
  score: number;
  questionCount: number;
}
// Describes the format Gemini API expects for its content
interface GeminiPart { text: string; }
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

// --- HELPER FUNCTION ---
// Converts a frontend message to the format Gemini API requires
const toGeminiContent = (message: FrontendChatMessage): GeminiContent => ({
  role: message.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: message.content }],
});


serve(async (req) => {
  // --- CORS Preflight Request Handling ---
  // This block is essential. It handles the browser's security check.
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Initial Setup & Validation ---
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY. Please set this in your Supabase Function's secrets.");
    }

    const { message, history = [], stage, score, questionCount }: QuizRequest = await req.json();

    // --- Dynamic AI Instructions (System Prompt) ---
    let systemPromptText = '';
    if (stage === 'topic') {
      systemPromptText = `You are an AI Quizmaster. The user wants a quiz on the topic of "${message}". 
      Your task is to generate the first multiple-choice question for a quiz of 3 questions. Provide four options (A, B, C, D).
      After the question and options, you MUST state the correct answer on a new line in the format: "ANSWER: A".`;
    } else {
      systemPromptText = `You are an AI Quizmaster continuing a quiz. The user's previous answer is "${message}".
      First, evaluate if their answer was correct based on the last question in the history. Then, generate the next multiple-choice question (up to a total of 3).
      Provide four options (A, B, C, D). After the options, you MUST state the correct answer on a new line in the format: "ANSWER: B". 
      If it is the final question, you MUST end your entire response with the phrase "QUIZ COMPLETE."`;
    }

    // --- Prepare Data for Gemini API ---
    const contents: GeminiContent[] = history.map(toGeminiContent);
    contents.push({ role: 'user', parts: [{ text: message }] });

    // --- Call the Gemini API ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPromptText }] },
          generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`The AI service failed with status: ${response.status}`);
    }

    const data = await response.json();
    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawReply) {
      throw new Error("The AI returned an empty or invalid response.");
    }

    // --- Process the AI's Response and Update Quiz State ---
    let newScore = score;
    let newStage = stage;
    let newQuestionCount = questionCount;

    // Find the correct answer from the last assistant message in the history
    const lastAssistantMessage = history.find(h => h.role === 'assistant')?.content || "";
    const correctAnswerMatch = lastAssistantMessage.match(/ANSWER:\s*([A-D])/i);
    
    // Check if the user's answer was correct
    if (stage === 'ongoing' && correctAnswerMatch) {
      const correctAnswer = correctAnswerMatch[1];
      if (message.trim().toUpperCase().startsWith(correctAnswer.toUpperCase())) {
        newScore++;
      }
    }

    // Determine the next stage of the quiz
    if (stage === 'topic') {
      newStage = 'ongoing';
      newQuestionCount = 1;
    } else if (stage === 'ongoing' && rawReply.includes("QUIZ COMPLETE.")) {
      newStage = 'completed';
    } else if (stage === 'ongoing') {
        newQuestionCount++;
    }

    // Clean the AI's reply to hide the "ANSWER: X" part before sending it to the user
    const replyText = rawReply.split(/ANSWER:\s*[A-D]/i)[0].trim();

    // --- Send the Final Response to the Frontend ---
    return new Response(
      JSON.stringify({ reply: replyText, newStage, newScore, newQuestionCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quiz function:', error);
    // Ensure CORS headers are included in error responses too
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});