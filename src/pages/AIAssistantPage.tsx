import { useRef, useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Loader2, Trash2, ChevronLeft, AlertCircle, Sparkles, User } from "lucide-react";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const SUGGESTED_QUESTIONS = [
  "How can I tell if an image is AI-generated?",
  "What should I do if I'm being harassed online?",
  "How does SheShield's image analyzer work?",
  "What are common online scam patterns?",
];

export function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "list_conversations" }),
      });
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // silently fail — conversations list is non-critical
    } finally {
      setLoadingConvs(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadConversation = useCallback(
    async (convId: string) => {
      setError(null);
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "get_messages", conversation_id: convId }),
        });
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        setMessages(data.messages ?? []);
        setCurrentConvId(convId);
        setShowSidebar(false);
      } catch {
        setError("Could not load this conversation. Please try again.");
      }
    },
    [apiUrl],
  );

  const startNewConversation = () => {
    setCurrentConvId(null);
    setMessages([]);
    setError(null);
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || loading) return;

    setError(null);
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "send_message",
          message: text,
          conversation_id: currentConvId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const assistantMsg: ChatMessage = {
        id: undefined,
        role: "assistant",
        content: data.content,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.conversation_id && data.conversation_id !== currentConvId) {
        setCurrentConvId(data.conversation_id);
        loadConversations();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      // Remove the user message if the request failed and there's no conversation yet
      if (!currentConvId) {
        setMessages((prev) => prev.filter((m) => m !== userMsg));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "delete_conversation", conversation_id: convId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      if (convId === currentConvId) {
        startNewConversation();
      }
      loadConversations();
    } catch {
      setError("Could not delete this conversation.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Safety Assistant</h1>
            <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">
              Ask about digital safety, online harassment, or how to use SheShield.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden p-2 rounded-lg bg-ink-800 border border-ink-700 text-ink-300 hover:text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4">
        {/* Conversation sidebar */}
        <div className={`${showSidebar ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-3 space-y-2">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" /> New Chat
            </button>
            <div className="space-y-1 max-h-64 md:max-h-96 overflow-y-auto">
              {loadingConvs ? (
                <p className="text-xs text-ink-500 text-center py-4">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-ink-500 text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      conv.id === currentConvId ? "bg-ink-700 text-white" : "text-ink-300 hover:bg-ink-700/50"
                    }`}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <span className="flex-1 text-xs truncate">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-w-0 flex flex-col rounded-2xl bg-ink-800/30 border border-ink-700 overflow-hidden" style={{ minHeight: "60vh" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Ask me anything about digital safety</p>
                <p className="text-xs text-ink-400 mb-6 max-w-xs">
                  I can help with AI-generated image detection, online harassment, scam patterns, and using SheShield.
                </p>
                <div className="grid gap-2 w-full max-w-sm">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs text-ink-200 bg-ink-800 hover:bg-ink-700 border border-ink-700 hover:border-brand-500/40 rounded-xl px-3 py-2.5 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={msg.id ?? i} message={msg} />
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-ink-800 border border-ink-700 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-ink-700 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                rows={1}
                maxLength={2000}
                disabled={loading}
                className="flex-1 resize-none bg-ink-800 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand-500/50 transition-colors max-h-32 disabled:opacity-60"
                style={{ minHeight: "42px" }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-ink-500 mt-1.5 text-center">
              AI responses are advisory and may not always be accurate. For emergencies, call 112.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-ink-700" : "bg-gradient-to-br from-brand-500 to-brand-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-ink-300" /> : <Sparkles className="w-4 h-4 text-white" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-500 text-white rounded-tr-sm"
            : "bg-ink-800 border border-ink-700 text-ink-100 rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
