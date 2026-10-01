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
    const API_USER = Deno.env.get("SIGHTENGINE_API_USER");
    const API_SECRET = Deno.env.get("SIGHTENGINE_API_SECRET");

    if (!API_USER || !API_SECRET) {
      return new Response(
        JSON.stringify({ error: "Sightengine API credentials are not configured on the server. Please add SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET as edge function secrets." }),
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

    // Build multipart form for Sightengine API
    const sightengineForm = new FormData();
    sightengineForm.append("media", imageFile);
    sightengineForm.append("models", "genai");
    sightengineForm.append("api_user", API_USER);
    sightengineForm.append("api_secret", API_SECRET);

    const apiResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: sightengineForm,
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      let friendlyError = `Sightengine API error (${apiResponse.status})`;

      if (apiResponse.status === 401) {
        friendlyError = "Invalid Sightengine API credentials. Please check your API user and secret.";
      } else if (apiResponse.status === 429) {
        friendlyError = "You have reached your Sightengine API usage limit. Please check your plan or try again later.";
      } else if (apiResponse.status === 400) {
        friendlyError = "The image could not be processed. It may be corrupted or in an unsupported format.";
      }

      return new Response(
        JSON.stringify({ error: friendlyError, details: errText }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await apiResponse.json();

    // Sightengine genai response format:
    // { type: { ai_generated: 0.95, real: 0.05 }, ... }
    const aiScore = data?.type?.ai_generated;
    const realScore = data?.type?.real;

    if (typeof aiScore !== "number") {
      return new Response(
        JSON.stringify({ error: "Unexpected response from Sightengine. No AI-generated score found." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiPercentage = Math.round(aiScore * 100);
    const realPercentage = realScore !== undefined ? Math.round(realScore * 100) : 100 - aiPercentage;

    // Determine verdict: aiScore >= 0.5 = Likely AI-Generated, <= 0.3 = Likely Real, between = Uncertain
    let verdict: "likely_ai" | "likely_real" | "uncertain";
    let status: "safe" | "needs_review" | "danger";

    if (aiScore >= 0.5) {
      verdict = "likely_ai";
      status = "danger";
    } else if (aiScore <= 0.3) {
      verdict = "likely_real";
      status = "safe";
    } else {
      verdict = "uncertain";
      status = "needs_review";
    }

    // Build user-friendly summary
    let summary: string;
    if (verdict === "likely_ai") {
      summary = `This image is likely AI-generated. Sightengine's detection model found a ${aiPercentage}% probability that this image was created by an AI image generator. Only ${(aiPercentage < 100 ? 100 - aiPercentage : 0)}% suggests it could be real.`;
    } else if (verdict === "likely_real") {
      summary = `This image appears to be a real photograph. Sightengine's detection model found only ${aiPercentage}% probability of AI generation, with ${realPercentage}% confidence that it is authentic.`;
    } else {
      summary = `This image is uncertain. Sightengine's detection model found a ${aiPercentage}% probability of AI generation, which is not high enough to confidently classify it as either AI-generated or real.`;
    }

    // Build observations based on score and any sub-scores
    const observations: string[] = [];

    observations.push(`AI-generated probability: ${aiPercentage}%`);

    if (realScore !== undefined) {
      observations.push(`Real photograph probability: ${realPercentage}%`);
    }

    // Check for per-generator scores (Sightengine may return these)
    const possibleGenerators = ["midjourney", "stable_diffusion", "dalle", "firefly", "gan", "stylegan", "sora", "gpt", "segedream", "seedream", "nanobanana", "imagen"];
    const generatorScores: { name: string; score: number }[] = [];

    if (data && typeof data === "object") {
      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase().replace(/[-\s]/g, "_");
        if (possibleGenerators.some((g) => lowerKey.includes(g)) && typeof data[key] === "number") {
          generatorScores.push({ name: key, score: data[key] });
        }
      }
    }

    if (generatorScores.length > 0) {
      generatorScores.sort((a, b) => b.score - a.score);
      const top = generatorScores.slice(0, 3);
      for (const g of top) {
        const pct = Math.round(g.score * 100);
        if (pct > 5) {
          observations.push(`Match for ${g.name} generator: ${pct}% confidence`);
        }
      }
    } else if (verdict === "likely_ai") {
      observations.push("Specific AI generator could not be identified, but synthetic patterns were detected.");
    }

    if (verdict === "likely_ai") {
      observations.push("The image shows patterns commonly found in AI-generated content, such as unnatural textures or artifacts.");
    } else if (verdict === "likely_real") {
      observations.push("No significant AI-generation markers were detected in the image.");
    } else {
      observations.push("Some indicators are ambiguous — the image has mixed signals that prevent a confident classification.");
    }

    // Limitations
    const limitations = [
      "No AI detector is 100% accurate. Results should be treated as advisory, not definitive proof.",
      "Heavily edited or compressed real photos may trigger false positives.",
      "Very high-quality AI images may occasionally pass as real.",
    ];

    // Recommended actions
    const recommended_actions: string[] = [];
    if (verdict === "likely_ai") {
      recommended_actions.push("Do not trust this image as evidence of a real event or person.");
      recommended_actions.push("Try to verify the source — check if it comes from a reputable news outlet or official channel.");
      recommended_actions.push("Use reverse image search to see if the photo appears elsewhere online.");
    } else if (verdict === "uncertain") {
      recommended_actions.push("Treat this image with caution until you can verify its source.");
      recommended_actions.push("Try a reverse image search to check for the original version.");
      recommended_actions.push("If this image involves a person you know, contact them directly to confirm.");
    } else {
      recommended_actions.push("This image appears genuine, but always verify the source for important decisions.");
      recommended_actions.push("If something seems off, trust your instincts and investigate further.");
    }

    const result = {
      status,
      verdict,
      ai_percentage: aiPercentage,
      real_percentage: realPercentage,
      summary,
      observations,
      limitations,
      recommended_actions,
    };

    return new Response(
      JSON.stringify(result),
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
