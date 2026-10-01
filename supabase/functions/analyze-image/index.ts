import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured on the server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No image file provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = imageFile.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const prompt = `You are an expert AI image forensics analyst. Analyze this image and determine whether it is AI-generated (synthetic) or a real photograph. Look for these telltale signs of AI generation:

- Unnatural skin texture (too smooth, plastic-like, or waxy)
- Inconsistent lighting or shadows that don't follow real physics
- Blurred or warped background details
- Extra, missing, or distorted fingers, teeth, or facial features
- Asymmetric facial features that look subtly wrong
- Unusual artifacts in text, logos, or repetitive patterns
- Overly perfect or uncanny appearance
- Inconsistent resolution between subject and background
- Strange geometry in objects or architecture

Respond with ONLY a valid JSON object (no markdown, no code fences) in this exact format:
{
  "status": "safe" | "needs_review" | "danger",
  "is_ai_generated": true | false,
  "confidence": "high" | "medium" | "low",
  "summary": "A 2-3 sentence overall assessment of whether this image appears AI-generated or real.",
  "observations": ["Specific finding 1", "Specific finding 2", ...],
  "limitations": ["What the analysis cannot determine", ...],
  "recommended_actions": ["What the user should do next", ...]
}

Guidelines for status:
- "safe" = image appears to be a real photograph with high confidence
- "needs_review" = some suspicious signs but inconclusive
- "danger" = strong indicators of AI generation

Provide 3-6 observations, 2-3 limitations, and 2-4 recommended_actions. Be specific and technical in observations.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openaiResponse.status} — ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response content from AI model." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip any markdown code fences if present
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const validStatuses = ["safe", "needs_review", "danger"];
    if (!validStatuses.includes(parsed.status)) {
      parsed.status = "needs_review";
    }
    if (!Array.isArray(parsed.observations)) parsed.observations = [];
    if (!Array.isArray(parsed.limitations)) parsed.limitations = [];
    if (!Array.isArray(parsed.recommended_actions)) parsed.recommended_actions = [];

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
