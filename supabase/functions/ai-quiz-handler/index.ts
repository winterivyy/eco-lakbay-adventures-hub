// supabase/functions/ai-quiz-handler/index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  // IMPROVEMENT: For production, it's safer to specify your exact website URL.
  'Access-Control-Allow-Origin': '*', // Replace with 'https://eco-lakbay-adventures-hub.vercel.app' when live
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- INTERFACES (No changes needed) ---
interface FrontendChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
interface QuizRequest {
  message: string;
  history?: FrontendChatMessage[];
  stage: 'topic' | 'ongoing' | 'completed';
  score: number;
  questionCount: number;
}
interface GeminiPart { text: string; }
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

// --- HELPER FUNCTION (No changes needed) ---
const toGeminiContent = (message: FrontendChatMessage): GeminiContent => ({
  role: message.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: message.content }],
});

serve(async (req) => {
  // CORS Preflight Request Handling is correct.
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initial Setup & Validation is correct.
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY. Please set this in your Supabase Function's secrets.");
    }

    const { message, history = [], stage, score, questionCount }: QuizRequest = await req.json();

    // Dynamic AI Instructions are well-written. No changes needed.
    let systemPromptText = '';
    if (stage === 'topic') {
      systemPromptText = `You are an AI Quizmaster. The user wants a quiz on the topic of "${message}". Your task is to generate the first multiple-choice question for a quiz of 3 questions. Provide four options (A, B, C, D). After the question and options, you MUST state the correct answer on a new line in the format: "ANSWER: A".`;
    } else {
      systemPromptText = `You are an AI Quizmaster continuing a quiz. The user's previous answer is "${message}". First, evaluate if their answer was correct based on the last question in the history. Then, generate the next multiple-choice question (up to a total of 3). Provide four options (A, B, C, D). After the options, you MUST state the correct answer on a new line in the format: "ANSWER: B". If it is the final question, you MUST end your entire response with the phrase "QUIZ COMPLETE."`;
    }

    // Prepare Data for Gemini API is correct.
    const contents: GeminiContent[] = history.map(toGeminiContent);
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Call the Gemini API is correct.
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

    // FIX: Find the last assistant message by searching the history array backwards.
    // This ensures we always get the most recent question.
    const lastAssistantMessage = [...history].reverse().find(h => h.role === 'assistant')?.content || "";
    const correctAnswerMatch = lastAssistantMessage.match(/ANSWER:\s*([A-D])/i);
    
    if (stage === 'ongoing' && correctAnswerMatch) {
      const correctAnswer = correctAnswerMatch[1];
      if (message.trim().toUpperCase().startsWith(correctAnswer.toUpperCase())) {
        newScore++;
      }
    }

    // Determine the next stage of the quiz - this logic is correct.
    if (stage === 'topic') {
      newStage = 'ongoing';
      newQuestionCount = 1;
    } else if (stage === 'ongoing' && rawReply.includes("QUIZ COMPLETE.")) {
      newStage = 'completed';
      // IMPROVEMENT: Don't increment the question count on the last question
    } else if (stage === 'ongoing') {
      newQuestionCount++;
    }

    // Clean the AI's reply - this is correct.
    const replyText = rawReply.split(/ANSWER:\s*[A-D]/i)[0].trim();

    // Send the Final Response to the Frontend - this is correct.
    return new Response(
      JSON.stringify({ reply: replyText, newStage, newScore, newQuestionCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quiz function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
