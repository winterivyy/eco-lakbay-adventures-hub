import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- FIX #1: Add `startingPoint` to the interface ---
interface TripPlanRequest {
  startingPoint: string;
  duration: string;
  budget: string;
  interests: string[];
  travelStyle: string;
  groupSize: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in the function's environment variables.");
    }
    
    // Deconstruct the new `startingPoint` field from the request body
    const { startingPoint, duration, budget, interests, travelStyle, groupSize }: TripPlanRequest = await req.json();

    const systemPrompt = `You are an expert travel planner for EcoLakbay, a platform focused on sustainable tourism in Pampanga, Philippines. Your goal is to generate a personalized, day-by-day travel itinerary based on the user's preferences.

    **Instructions:**
    1.  **Prioritize the Starting Point:** The entire itinerary MUST begin from, and logically flow around, the user's specified starting point. All travel times should consider this.
    2.  **Be Specific:** Mention real places, eco-lodges, local restaurants, and sustainable activities available in Pampanga.
    3.  **Promote Sustainability:** Weave in eco-friendly tips.
    4.  **Format with Markdown:** Use headings (e.g., "# Day 1: ..."), bold text, and bullet points.
    5.  **Be Friendly and Engaging:** Write in a welcoming and inspiring tone.`;
    
    // --- FIX #2: Add the `startingPoint` to the prompt sent to the AI ---
    const userPrompt = `
      Please create a sustainable travel plan for me in Pampanga, Philippines with the following preferences:
      
      - **My Starting Point/Accommodation:** ${startingPoint}
      - **Trip Duration:** ${duration}
      - **My Budget:** ${budget} PHP
      - **Group Size:** ${groupSize} person(s)
      - **My Travel Style:** ${travelStyle}
      - **My Interests:** ${interests.join(', ')}

      Please structure the response as a clear, day-by-day itinerary that is easy to follow.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
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
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("Gemini returned an empty or blocked response. This might be due to safety settings.");
    }
    
    const tripPlan = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ tripPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trip planner function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});