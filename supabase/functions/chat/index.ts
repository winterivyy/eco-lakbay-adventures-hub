import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// --- 1. GET THE NEW API KEY ---
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for Gemini's API structure
interface GeminiContent {
  role: 'user' | 'model'; // Gemini uses 'model' for the assistant's role
  parts: [{ text: string }];
}

interface GeminiRequest {
  message: string;
  history?: GeminiContent[]; // History should now follow Gemini's format
}

// Helper function to map your chat history to Gemini's required format
const mapToGeminiFormat = (chatMessage: any): GeminiContent => {
  return {
    role: chatMessage.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: chatMessage.content }],
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] }: GeminiRequest = await req.json();

    // The system prompt is now part of the history, not a separate object
    const systemPrompt = 'You are a helpful and friendly assistant for EcoLakbay, a sustainable tourism platform for Pampanga, Philippines. Your role is to answer questions about eco-tourism, suggest destinations from the platform, provide travel tips that promote sustainability, and explain how to use the EcoLakbay website. Keep your answers concise, positive, and focused on promoting responsible travel.';

    const contents: GeminiContent[] = [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ];

    // --- 2. UPDATE THE API CALL ---
    const response = await fetch(
      // The model name is part of the URL for Gemini
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents, // The main conversation history
          // Safety settings can be configured to reduce harmful responses
          safetySettings: [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
          ],
          // The system instruction is a separate part of the request body
          systemInstruction: {
            parts: { text: systemPrompt }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // --- 3. PARSE THE GEMINI RESPONSE ---
    // Gemini's response structure is different from OpenAI's
    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
