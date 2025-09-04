import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface from your frontend for a single message
interface FrontendChatMessage {
  role: 'user' | 'assistant';
  content: string; // The frontend uses 'content'
}
interface ChatRequest {
  message: string;
  history?: FrontendChatMessage[];
}

// Gemini-specific interfaces
interface GeminiPart { text: string; }
interface GeminiContent {
  role: 'user' | 'model'; // Gemini uses 'model'
  parts: GeminiPart[];
}

// Helper to convert frontend format to Gemini's format
const toGeminiContent = (message: FrontendChatMessage): GeminiContent => ({
  role: message.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: message.content }], // Convert 'content' to 'parts'
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY. Set it in your function's secrets.");
    }

    const { message, history = [] }: ChatRequest = await req.json();

    const systemPrompt = 'You are a helpful and friendly assistant for EcoLakbay, a sustainable tourism platform for Pampanga, Philippines. Your role is to answer questions about eco-tourism, suggest destinations from the platform, provide travel tips that promote sustainability, and explain how to use the EcoLakbay website. Keep your answers concise, positive, and focused on promoting responsible travel.';

    // --- THIS IS THE DEFINITIVE FIX ---
    // We now correctly use the `toGeminiContent` helper to map the incoming history
    // from the `{role, content}` format to the `{role, parts}` format.
    const contents: GeminiContent[] = history.map(toGeminiContent);
    // Add the latest user message in the correct format
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents, // Now sending the correctly formatted data
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text(); // Get text for better debug output
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      // Sometimes Gemini might return an empty response due to safety settings, so we handle that.
      const safetyFeedback = data.promptFeedback ? JSON.stringify(data.promptFeedback) : "No specific reason provided.";
      throw new Error(`Gemini returned an empty or blocked response. Safety feedback: ${safetyFeedback}`);
    }
    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});