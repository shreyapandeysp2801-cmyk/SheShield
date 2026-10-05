import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are SheShield AI, a helpful safety assistant built into the SheShield women's safety platform. Your role is to:

1. Help users understand digital safety threats — AI-generated images, deepfakes, online harassment, phishing, and scam patterns.
2. Provide practical, actionable safety advice for women navigating online spaces.
3. Explain how SheShield's features work (Image Analyzer, Audio Analyzer, Video Analyzer, Emergency Hub, Simulated Call, Safety Tips).
4. Answer questions about online safety, digital harassment, and what to do if someone encounters suspicious or harmful content.
5. Be supportive, clear, and concise. Avoid overly long responses.

Guidelines:
- Keep responses concise (3-5 sentences unless the user asks for more detail).
- Be empathetic and non-judgmental.
- If someone seems to be in immediate danger, remind them to contact emergency services (112 in India, or local emergency number).
- Do not provide legal advice — suggest consulting authorities or helplines for that.
- You are an AI assistant, not a human. Be honest about your limitations.
- If asked about topics unrelated to safety or SheShield, gently steer the conversation back to safety topics.

SheShield features you can reference:
- Image Analyzer: Detects if an image is AI-generated using Sightengine
- Audio Analyzer: Transcribes and analyzes audio for scam patterns
- Video Analyzer: Extracts frames and analyzes video for manipulation
- Emergency Hub: Quick access to emergency contacts and resources
- Simulated Call: Fakes an incoming call to safely exit uncomfortable situations
- Safety Tips: Offline-accessible women's safety tips`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!API_KEY) {
      return jsonResponse(
        { error: "AI service is not configured. Please add GROQ_API_KEY to your edge function secrets." },
        500,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ error: "Database connection is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const action = body.action as string;

    // ── ACTION: Send message ──────────────────────────────────
    if (action === "send_message") {
      const conversationId: string | null = body.conversation_id ?? null;
      const userMessage: string = body.message?.trim();

      if (!userMessage || typeof userMessage !== "string") {
        return jsonResponse({ error: "Message is required." }, 400);
      }

      if (userMessage.length > 2000) {
        return jsonResponse({ error: "Message is too long. Please keep it under 2000 characters." }, 400);
      }

      let convId = conversationId;

      // Create a new conversation if none provided
      if (!convId) {
        const title = userMessage.length > 50 ? userMessage.slice(0, 50) + "..." : userMessage;
        const { data: conv, error: convError } = await supabase
          .from("chat_conversations")
          .insert({ title })
          .select("id")
          .maybeSingle();

        if (convError || !conv) {
          return jsonResponse({ error: "Could not create conversation." }, 500);
        }
        convId = conv.id;
      }

      // Save user message
      const { error: insertUserMsg } = await supabase
        .from("chat_messages")
        .insert({ conversation_id: convId, role: "user", content: userMessage });

      if (insertUserMsg) {
        return jsonResponse({ error: "Could not save your message." }, 500);
      }

      // Fetch conversation history (last 20 messages for context)
      const { data: history, error: historyError } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(20);

      if (historyError) {
        return jsonResponse({ error: "Could not load conversation history." }, 500);
      }

      // Build messages for Groq
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      // Call Groq API
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        console.error("Groq API error:", errText);

        let friendlyError = "The AI service is temporarily unavailable. Please try again in a moment.";
        if (groqResponse.status === 429) {
          friendlyError = "The AI service is busy right now. Please wait a few seconds and try again.";
        } else if (groqResponse.status === 401) {
          friendlyError = "The AI service API key is not valid. Please check the GROQ_API_KEY secret.";
        }

        return jsonResponse({ error: friendlyError, conversation_id: convId }, groqResponse.status);
      }

      const groqData = await groqResponse.json();
      const assistantContent = groqData.choices?.[0]?.message?.content;

      if (!assistantContent || typeof assistantContent !== "string") {
        return jsonResponse(
          { error: "The AI service returned an empty response. Please try again.", conversation_id: convId },
          502,
        );
      }

      // Save assistant message
      const { error: insertAssistantMsg } = await supabase
        .from("chat_messages")
        .insert({ conversation_id: convId, role: "assistant", content: assistantContent });

      if (insertAssistantMsg) {
        console.error("Failed to save assistant message:", insertAssistantMsg);
      }

      // Update conversation timestamp
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId);

      return jsonResponse({
        conversation_id: convId,
        role: "assistant",
        content: assistantContent,
      }, 200);
    }

    // ── ACTION: List conversations ────────────────────────────
    if (action === "list_conversations") {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id, title, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) {
        return jsonResponse({ error: "Could not load conversations." }, 500);
      }

      return jsonResponse({ conversations: data ?? [] }, 200);
    }

    // ── ACTION: Get conversation messages ─────────────────────
    if (action === "get_messages") {
      const convId: string = body.conversation_id;
      if (!convId) {
        return jsonResponse({ error: "conversation_id is required." }, 400);
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) {
        return jsonResponse({ error: "Could not load messages." }, 500);
      }

      return jsonResponse({ messages: data ?? [] }, 200);
    }

    // ── ACTION: Delete conversation ───────────────────────────
    if (action === "delete_conversation") {
      const convId: string = body.conversation_id;
      if (!convId) {
        return jsonResponse({ error: "conversation_id is required." }, 400);
      }

      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", convId);

      if (error) {
        return jsonResponse({ error: "Could not delete conversation." }, 500);
      }

      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: "Unknown action. Use: send_message, list_conversations, get_messages, or delete_conversation." }, 400);
  } catch (err) {
    console.error("ai-chat error:", err);
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
