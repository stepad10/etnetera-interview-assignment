import { useState, useRef, useEffect } from "react";
import type { Message } from "~/types/chat";
import MessageBubble from "./MessageBubble";

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "👋 Hi! I'm your internal development Q&A assistant. Ask me anything about our processes, tools, and infrastructure — or ask who to contact for a specific topic.",
};

export type AvailableModels = {
  openaiAvailable: boolean;
  geminiAvailable: boolean;
};

export default function ChatInterface({
  availableModels,
}: Readonly<{ availableModels?: AvailableModels }>) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gemini" | "openai">(
    availableModels?.geminiAvailable !== false ? "gemini" : "openai",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(e?: React.SyntheticEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    // Don't include the welcome message in the API call history
    const history = messages.filter((m) => m !== WELCOME_MESSAGE);
    const newHistory = [...history, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: { role: "assistant"; content: string } | { error: string } =
        await response.json();

      if ("error" in data) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  function handleNewConversation() {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gray-900/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-sm">🔧</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">
              Dev Q&amp;A Assistant
            </h1>
            <p className="text-xs text-gray-400">Internal knowledge base</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            id="new-conversation-btn"
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600 transition-all duration-150 cursor-pointer"
          >
            <span>✦ </span>
            <span>New conversation</span>
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#374151 transparent",
        }}
      >
        {messages.map((message, idx) => (
          <MessageBubble
            key={`${message.role}-${idx}-${message.content.slice(0, 20)}`}
            message={message}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 mt-1 shadow-lg">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-800/80 border border-gray-700/50 shadow-md">
              <div className="flex gap-1 items-center h-4">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center mb-4">
            <div className="px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm max-w-lg text-center">
              ⚠️ {error}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col bg-[#1e1e24] border border-gray-700/60 rounded-2xl shadow-lg focus-within:ring-1 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all duration-200"
          >
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              disabled={isLoading}
              className="w-full block bg-transparent border-none resize-none px-4 pt-4 pb-2 text-[15px] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed min-h-[56px]"
              style={{
                maxHeight: "200px",
                overflow: "auto",
              }}
            />

            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-1">
                <div className="relative group flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 group-hover:text-gray-300">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={(e) =>
                      setSelectedModel(e.target.value as "gemini" | "openai")
                    }
                    className="appearance-none bg-transparent hover:bg-gray-800/80 border border-transparent hover:border-gray-700/50 text-sm font-medium text-gray-400 hover:text-gray-200 rounded-md py-1.5 pl-7 pr-3 outline-none transition-all duration-150 cursor-pointer"
                    aria-label="Select AI Model"
                  >
                    <option
                      value="gemini"
                      disabled={availableModels?.geminiAvailable === false}
                      className="bg-gray-900 text-gray-200 disabled:text-gray-500 disabled:italic"
                    >
                      Gemini 3.0 Flash
                      {availableModels?.geminiAvailable === false &&
                        " (Key missing)"}
                    </option>
                    <option
                      value="openai"
                      disabled={!availableModels?.openaiAvailable}
                      className="bg-gray-900 text-gray-200 disabled:text-gray-500 disabled:italic"
                    >
                      OpenAI GPT-4o mini
                      {!availableModels?.openaiAvailable && " (Key missing)"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="send-btn"
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-gray-200 flex items-center justify-center transition-all duration-150 cursor-pointer"
                  aria-label="Send message"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-gray-500/80 mt-3">
            Internal knowledge base assistant. Responses may vary based on model
            choice.
          </p>
        </div>
      </div>
    </div>
  );
}
