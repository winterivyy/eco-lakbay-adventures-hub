import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Define the CORS headers that your function will use
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or 'https://eco-lakbay-adventures-hub.vercel.app' for production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ... (keep your interfaces here: FrontendChatMessage, QuizRequest, etc.) ...
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
// ... and so on for the Gemini interfaces

serve(async (req) => {
  // --- THIS IS THE CRUCIAL FIX ---
  // The browser sends an OPTIONS request first to check CORS policy.
  // We must handle this immediately and return a 200 OK response.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Your existing logic for handling the POST request goes here.
    // No changes are needed in the rest of your try/catch block.
    
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const { message, history = [], stage, score, questionCount }: QuizRequest = await req.json();
    
    // ... all your AI logic ...

    const reply = "This is a response from the AI."; // Placeholder for your Gemini call's result
    
    return new Response(JSON.stringify({ reply /*, newStage, newScore, etc. */ }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Also include CORS headers in your error responses
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});