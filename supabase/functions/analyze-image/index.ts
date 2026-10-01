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
    const API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key is not configured on the server." }),
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
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
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
  "observations": ["Specific finding 1", "Specific finding 2"],
  "limitations": ["What the analysis cannot determine"],
  "recommended_actions": ["What the user should do next"]
}

Guidelines for status:
- "safe" = image appears to be a real photograph with high confidence
- "needs_review" = some suspicious signs but inconclusive
- "danger" = strong indicators of AI generation

Provide 3-6 observations, 2-3 limitations, and 2-4 recommended_actions. Be specific and technical in observations.`;

    const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
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
        response_format: { type: "json_object" },
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return new Response(
        JSON.stringify({ error: `API error: ${apiResponse.status} — ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiResponse.json();
    const content = apiData.choices?.[0]?.message?.content;

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
