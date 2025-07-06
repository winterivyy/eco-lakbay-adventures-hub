import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TripPlanRequest {
  duration: string;
  budget: string;
  interests: string[];
  travelStyle: string;
  groupSize: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { duration, budget, interests, travelStyle, groupSize }: TripPlanRequest = await req.json();

    const prompt = `Create a detailed eco-friendly trip plan for Pampanga, Philippines with the following preferences:
    
Duration: ${duration}
Budget: ${budget}
Interests: ${interests.join(', ')}
Travel Style: ${travelStyle}
Group Size: ${groupSize} people

Please include:
1. Day-by-day itinerary with specific eco-friendly destinations in Pampanga
2. Sustainable accommodation recommendations
3. Local eco-friendly activities and attractions
4. Transportation suggestions that minimize carbon footprint
5. Local sustainable restaurants and food experiences
6. Estimated costs breakdown
7. Tips for responsible tourism and supporting local communities
8. Carbon footprint considerations and how to minimize impact

Focus on authentic Pampanga experiences that benefit local communities and preserve the environment.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert eco-tourism travel planner specializing in sustainable travel in Pampanga, Philippines. Create detailed, practical trip plans that emphasize environmental responsibility, local community support, and authentic cultural experiences.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const tripPlan = data.choices[0].message.content;

    return new Response(JSON.stringify({ tripPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-trip-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});