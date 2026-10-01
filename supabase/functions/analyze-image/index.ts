const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // ============================================================
    // 1. GET SIGHTENGINE API CREDENTIALS
    // ============================================================

    const API_USER = Deno.env.get("SIGHTENGINE_API_USER");
    const API_SECRET = Deno.env.get("SIGHTENGINE_API_SECRET");

    if (!API_USER || !API_SECRET) {
      return jsonResponse(
        {
          error:
            "Sightengine API credentials are not configured. Please add SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET to your Supabase Edge Function secrets.",
        },
        500,
      );
    }

    // ============================================================
    // 2. GET IMAGE FROM REQUEST
    // ============================================================

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return jsonResponse(
        {
          error: "No image file provided.",
        },
        400,
      );
    }

    // Check that the uploaded file is an image
    if (!imageFile.type.startsWith("image/")) {
      return jsonResponse(
        {
          error: "Please upload a valid image file.",
        },
        400,
      );
    }

    // Maximum file size: 10 MB
    if (imageFile.size > 10 * 1024 * 1024) {
      return jsonResponse(
        {
          error: "Image must be smaller than 10MB.",
        },
        400,
      );
    }

    // ============================================================
    // 3. SEND IMAGE TO SIGHTENGINE
    // ============================================================

    const sightengineForm = new FormData();

    sightengineForm.append("media", imageFile);
    sightengineForm.append("models", "genai");
    sightengineForm.append("api_user", API_USER);
    sightengineForm.append("api_secret", API_SECRET);

    const apiResponse = await fetch(
      "https://api.sightengine.com/1.0/check.json",
      {
        method: "POST",
        body: sightengineForm,
      },
    );

    // ============================================================
    // 4. HANDLE SIGHTENGINE ERRORS
    // ============================================================

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();

      console.error("Sightengine error:", errorText);

      let friendlyError = `Sightengine API error (${apiResponse.status})`;

      if (apiResponse.status === 401) {
        friendlyError =
          "Invalid Sightengine API credentials. Please check your API user and secret.";
      } else if (apiResponse.status === 429) {
        friendlyError =
          "Sightengine API usage limit reached. Please try again later.";
      } else if (apiResponse.status === 400) {
        friendlyError =
          "The image could not be processed. It may be corrupted or unsupported.";
      }

      return jsonResponse(
        {
          error: friendlyError,
        },
        apiResponse.status,
      );
    }

    // ============================================================
    // 5. READ SIGHTENGINE RESPONSE
    // ============================================================

    const data = await apiResponse.json();

    console.log(
      "Sightengine response:",
      JSON.stringify(data),
    );

    const aiScore = data?.type?.ai_generated;
    const realScore = data?.type?.real;

    if (typeof aiScore !== "number") {
      return jsonResponse(
        {
          error:
            "Unexpected response from Sightengine. AI-generated score was not found.",
        },
        502,
      );
    }

    // ============================================================
    // 6. CONVERT SCORE TO PERCENTAGE
    // ============================================================

    const aiPercentage = Math.round(aiScore * 100);

    const realPercentage =
      typeof realScore === "number"
        ? Math.round(realScore * 100)
        : 100 - aiPercentage;

    // ============================================================
    // 7. THREE DETECTION ZONES
    //
    // 0–30%   → LIKELY REAL
    // 30–70%  → UNCERTAIN
    // 70–100% → LIKELY AI
    // ============================================================

    let verdict:
      | "likely_real"
      | "uncertain"
      | "likely_ai";

    let status:
      | "safe"
      | "needs_review"
      | "danger";

    if (aiPercentage <= 30) {
      // ----------------------------------------------------------
      // ZONE 1: 0–30%
      // ----------------------------------------------------------

      verdict = "likely_real";
      status = "safe";
    } else if (aiPercentage < 70) {
      // ----------------------------------------------------------
      // ZONE 2: 30–70%
      // ----------------------------------------------------------

      verdict = "uncertain";
      status = "needs_review";
    } else {
      // ----------------------------------------------------------
      // ZONE 3: 70–100%
      // ----------------------------------------------------------

      verdict = "likely_ai";
      status = "danger";
    }

    // ============================================================
    // 8. CREATE SUMMARY
    // ============================================================

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

    // ============================================================
    // 9. CREATE OBSERVATIONS
    // ============================================================

    const observations: string[] = [];

    observations.push(
      `AI-generated probability: ${aiPercentage}%`,
    );

    observations.push(
      `Real photograph probability: ${realPercentage}%`,
    );

    // Zone-specific observations

    if (verdict === "likely_real") {
      observations.push(
        "The detector did not find strong indicators associated with AI-generated imagery.",
      );

      observations.push(
        "The result is consistent with a real photograph.",
      );
    }

    if (verdict === "uncertain") {
      observations.push(
        "The detector found mixed or inconclusive signals.",
      );

      observations.push(
        "The image cannot be confidently classified as either AI-generated or real.",
      );
    }

    if (verdict === "likely_ai") {
      observations.push(
        "The detector found patterns commonly associated with AI-generated imagery.",
      );

      observations.push(
        "The image should be treated as potentially synthetic until its original source is verified.",
      );
    }

    // ============================================================
    // 10. LIMITATIONS
    // ============================================================

    const limitations = [
      "AI-image detection is probabilistic and cannot guarantee authenticity.",
      "Image compression, resizing, screenshots, filters, and editing can affect detection accuracy.",
      "New AI image generators may produce images that are harder to detect.",
      "A high AI probability should be treated as an indicator rather than definitive proof.",
    ];

    // ============================================================
    // 11. RECOMMENDED ACTIONS
    // ============================================================

    const recommended_actions: string[] = [];

    if (verdict === "likely_real") {
      recommended_actions.push(
        "The image does not show strong evidence of AI generation.",
      );

      recommended_actions.push(
        "For important situations, verify the original source of the image.",
      );

      recommended_actions.push(
        "Use reverse image search if you need additional verification.",
      );
    }

    if (verdict === "uncertain") {
      recommended_actions.push(
        "Treat the image cautiously until its source can be verified.",
      );

      recommended_actions.push(
        "Look for the original source and publication date.",
      );

      recommended_actions.push(
        "Use reverse image search to find earlier versions of the image.",
      );
    }

    if (verdict === "likely_ai") {
      recommended_actions.push(
        "Treat the image as potentially AI-generated.",
      );

      recommended_actions.push(
        "Verify the original source before trusting the image.",
      );

      recommended_actions.push(
        "Use reverse image search to look for the original image.",
      );

      recommended_actions.push(
        "Do not rely on the image alone as evidence of a real event or person.",
      );
    }

    // ============================================================
    // 12. FINAL RESULT
    // ============================================================

    const result = {
      status,
      verdict,

      // Percentages shown in your frontend
      ai_percentage: aiPercentage,
      real_percentage: realPercentage,

      // Human-readable result
      summary,

      // Detailed information
      observations,
      limitations,
      recommended_actions,

      // Useful metadata
      detector: {
        provider: "Sightengine",
        model: "genai",
        ai_score: aiScore,
        real_score:
          typeof realScore === "number"
            ? realScore
            : null,
      },

      // Useful for your frontend if you want to display
      // the three detection zones
      detection_zone:
        aiPercentage <= 30
          ? "likely_real"
          : aiPercentage < 70
            ? "uncertain"
            : "likely_ai",
    };

    return jsonResponse(result, 200);

  } catch (err) {
    console.error("analyze-image error:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Unknown error occurred.";

    return jsonResponse(
      {
        error: message,
      },
      500,
    );
  }
});

// ============================================================
// HELPER FUNCTION
// ============================================================

function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}