import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- INTERFACES ---
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

// --- HELPERS ---
const toGeminiContent = (message: FrontendChatMessage): GeminiContent => ({
  role: message.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: message.content }],
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) throw new Error("Missing GEMINI_API_KEY.");

    const { message, history = [], stage, score, questionCount }: QuizRequest = await req.json();

    let systemPromptText = '';
    if (stage === 'topic') {
      systemPromptText = `You are an AI Quizmaster. The user wants a quiz on the topic of "${message}". 
      Generate the first multiple-choice question for a quiz of 3 questions. Provide four options (A, B, C, D).
      After the question and options, state the correct answer like: "ANSWER: A".`;
    } else {
      systemPromptText = `You are an AI Quizmaster continuing a quiz. The user's previous answer is "${message}".
      Check if it was correct based on the last question in history. Then generate the next multiple-choice question (up to 3 total).
      After options, state the correct answer like "ANSWER: B". 
      If it’s the last question, end with "QUIZ COMPLETE."`;
    }

    const contents: GeminiContent[] = history.map(toGeminiContent);
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          system_instruction: { parts: [{ text: systemPromptText }] },
          generationConfig: { temperature: 0.5, maxOutputTokens: 250 },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!rawReply) throw new Error("Gemini returned an empty response.");

    let replyText = rawReply;
    let newScore = score;
    let newQuestionCount = questionCount;
    let newStage = stage;

    const lastAssistantMessage = [...history].reverse().find(h => h.role === 'assistant')?.content || "";
    const correctAnswerMatch = lastAssistantMessage.match(/ANSWER:\s*([A-D])/i);
    if (correctAnswerMatch && stage === 'ongoing') {
      const correctAnswer = correctAnswerMatch[1];
      if (message.trim().toUpperCase().startsWith(correctAnswer)) {
        newScore++;
      }
    }

    if (stage === 'topic') {
      newStage = 'ongoing';
      newQuestionCount = 1;
    } else if (stage === 'ongoing' && !rawReply.includes("QUIZ COMPLETE.")) {
      newQuestionCount++;
    } else if (rawReply.includes("QUIZ COMPLETE.")) {
      newStage = 'completed';
    }

    replyText = rawReply.split(/ANSWER:\s*[A-D]/i)[0].trim();

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
