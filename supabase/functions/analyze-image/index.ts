const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const API_USER = Deno.env.get("SIGHTENGINE_API_USER");
    const API_SECRET = Deno.env.get("SIGHTENGINE_API_SECRET");

    if (!API_USER || !API_SECRET) {
      return jsonResponse(
        {
          error:
            "Sightengine API credentials are not configured. Please add SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET as edge function secrets.",
        },
        500,
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return jsonResponse({ error: "No image file provided." }, 400);
    }

    if (!imageFile.type.startsWith("image/")) {
      return jsonResponse({ error: "Please upload a valid image file." }, 400);
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return jsonResponse({ error: "Image must be smaller than 10MB." }, 400);
    }

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
      const errorBody = await apiResponse.json().catch(() => null);
      console.error("Sightengine error:", JSON.stringify(errorBody));

      let friendlyError = `Sightengine API error (${apiResponse.status})`;

      const errType = errorBody?.error?.type;
      const errMsg = errorBody?.error?.message;

      if (apiResponse.status === 401 || errType === "credentials_error") {
        friendlyError = "Invalid Sightengine API credentials. Please check your API user and secret.";
      } else if (apiResponse.status === 429 || errType === "usage_limit") {
        friendlyError = "Sightengine API usage limit reached. Please try again later or check your plan.";
      } else if (apiResponse.status === 400 || errType === "argument_error" || errType === "media_error") {
        friendlyError = errMsg || "The image could not be processed. It may be corrupted or in an unsupported format.";
      } else if (errType === "plan_error") {
        friendlyError = "Your Sightengine plan does not support this model. Please check your plan settings.";
      } else if (errMsg) {
        friendlyError = errMsg;
      }

      return jsonResponse({ error: friendlyError }, apiResponse.status);
    }

    const data = await apiResponse.json();

    // Sightengine may return 200 with status "failure" in rare cases
    if (data?.status === "failure") {
      const errMsg = data?.error?.message || "Sightengine reported a failure.";
      return jsonResponse({ error: errMsg }, 502);
    }

    // The genai model returns scores under data.type
    // ai_generated: 0-1 confidence the image is AI-made
    // real: 0-1 confidence the image is a real photo
    const aiScore = data?.type?.ai_generated;
    const realScore = data?.type?.real;

    if (typeof aiScore !== "number") {
      console.error("Unexpected Sightengine response:", JSON.stringify(data));
      return jsonResponse(
        { error: "Unexpected response from Sightengine. AI-generated score was not found." },
        502,
      );
    }

    const aiPercentage = Math.round(aiScore * 100);
    const realPercentage =
      typeof realScore === "number" ? Math.round(realScore * 100) : 100 - aiPercentage;

    let verdict: "likely_real" | "uncertain" | "likely_ai";
    let status: "safe" | "needs_review" | "danger";

    if (aiPercentage <= 30) {
      verdict = "likely_real";
      status = "safe";
    } else if (aiPercentage < 70) {
      verdict = "uncertain";
      status = "needs_review";
    } else {
      verdict = "likely_ai";
      status = "danger";
    }

    let summary: string;
    if (verdict === "likely_real") {
      summary =
        `The image is likely real. The AI detector estimated ` +
        `${aiPercentage}% probability of AI generation and ` +
        `${realPercentage}% probability of being a real photograph.`;
    } else if (verdict === "uncertain") {
      summary =
        `The result is uncertain. The AI detector estimated ` +
        `${aiPercentage}% probability of AI generation. ` +
        `This falls within the uncertain range and should be verified further.`;
    } else {
      summary =
        `The image is likely AI-generated. The AI detector estimated ` +
        `${aiPercentage}% probability of AI generation.`;
    }

    const observations: string[] = [
      `AI-generated probability: ${aiPercentage}%`,
      `Real photograph probability: ${realPercentage}%`,
    ];

    if (verdict === "likely_real") {
      observations.push("The detector did not find strong indicators associated with AI-generated imagery.");
      observations.push("The result is consistent with a real photograph.");
    } else if (verdict === "uncertain") {
      observations.push("The detector found mixed or inconclusive signals.");
      observations.push("The image cannot be confidently classified as either AI-generated or real.");
    } else {
      observations.push("The detector found patterns commonly associated with AI-generated imagery.");
      observations.push("The image should be treated as potentially synthetic until its original source is verified.");
    }

    const limitations = [
      "AI-image detection is probabilistic and cannot guarantee authenticity.",
      "Image compression, resizing, screenshots, filters, and editing can affect detection accuracy.",
      "New AI image generators may produce images that are harder to detect.",
      "A high AI probability should be treated as an indicator rather than definitive proof.",
    ];

    const recommended_actions: string[] = [];

    if (verdict === "likely_real") {
      recommended_actions.push("The image does not show strong evidence of AI generation.");
      recommended_actions.push("For important situations, verify the original source of the image.");
      recommended_actions.push("Use reverse image search if you need additional verification.");
    } else if (verdict === "uncertain") {
      recommended_actions.push("Treat the image cautiously until its source can be verified.");
      recommended_actions.push("Look for the original source and publication date.");
      recommended_actions.push("Use reverse image search to find earlier versions of the image.");
    } else {
      recommended_actions.push("Treat the image as potentially AI-generated.");
      recommended_actions.push("Verify the original source before trusting the image.");
      recommended_actions.push("Use reverse image search to look for the original image.");
      recommended_actions.push("Do not rely on the image alone as evidence of a real event or person.");
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
      detector: {
        provider: "Sightengine",
        model: "genai",
        ai_score: aiScore,
        real_score: typeof realScore === "number" ? realScore : null,
      },
    };

    return jsonResponse(result, 200);
  } catch (err) {
    console.error("analyze-image error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
