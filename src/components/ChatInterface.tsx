"use client";

import { useState, useRef, useEffect } from "react";
import { advisors } from "@/lib/advisors";

interface Message {
  id: string;
  role: "user" | "advisor";
  content: string;
  advisorId?: string;
  advisorName?: string;
  timestamp: Date;
}

const randomTopics = [
  "What will technology look like in 2030?",
  "Will AGI be achieved in the next 5 years?",
  "Should we colonize Mars or fix Earth first?",
  "What's the biggest threat to humanity: AI, climate change, or something else?",
  "Will remote work dominate or will offices make a comeback?",
  "What's the next big breakthrough after AI?",
  "Should we regulate AI development more strictly?",
  "Will cryptocurrency replace traditional banking?",
  "What's the future of education with AI?",
  "How will quantum computing change the world?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isContinuingChat, setIsContinuingChat] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-start conversation on mount
  useEffect(() => {
    if (!hasAutoStarted && messages.length === 0) {
      setHasAutoStarted(true);
      const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
      setTimeout(() => {
        startConversation(randomTopic);
      }, 500);
    }
  }, []);

  const getAdvisorResponses = async (
    prompt: string,
    currentMessages: Message[]
  ) => {
    const conversationHistory = currentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      advisorId: msg.advisorId,
      advisorName: msg.advisorName,
    }));

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    const data = await response.json();
    return data.responses
      .filter((r: any) => r.content)
      .map((r: any) => ({
        advisorId: r.advisorId,
        advisorName: r.advisorName,
        content: r.content,
      }));
  };

  const startConversation = async (topic: string) => {
    setIsLoading(true);

    // Add topic as a system message
    const topicMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: topic,
      timestamp: new Date(),
    };

    setMessages([topicMessage]);

    try {
      const responses = await getAdvisorResponses(topic, []);

      const advisorMessages: Message[] = responses.map(
        (r: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          role: "advisor" as const,
          content: r.content,
          advisorId: r.advisorId,
          advisorName: r.advisorName,
          timestamp: new Date(),
        })
      );

      const messagesWithResponses = [topicMessage, ...advisorMessages];
      setMessages(messagesWithResponses);
      setIsLoading(false);

      // Continue the conversation
      continueConversation(messagesWithResponses);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setIsLoading(false);
    }
  };

  const continueConversation = async (currentMessages: Message[]) => {
    setIsContinuingChat(true);

    // Run 2-3 rounds of discussion
    const rounds = 2;
    let updatedMessages = [...currentMessages];

    for (let round = 0; round < rounds; round++) {
      // Small delay between rounds for natural flow
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the last few messages for context
      const recentContext = updatedMessages.slice(-6);
      const contextSummary = recentContext
        .map((m) => `${m.advisorName || "User"}: ${m.content}`)
        .join("\n\n");

      const prompt = `Continue the discussion. Build on what was just said:\n\n${contextSummary}\n\nProvide your perspective or response to the others' points.`;

      try {
        const responses = await getAdvisorResponses(prompt, updatedMessages);

        const newMessages: Message[] = responses.map(
          (r: any, index: number) => ({
            id: `${Date.now()}-${round}-${index}`,
            role: "advisor" as const,
            content: r.content,
            advisorId: r.advisorId,
            advisorName: r.advisorName,
            timestamp: new Date(),
          })
        );

        updatedMessages = [...updatedMessages, ...newMessages];
        setMessages(updatedMessages);
      } catch (error) {
        console.error("Error in continuation round:", error);
        break;
      }
    }

    setIsContinuingChat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const responses = await getAdvisorResponses(inputValue, messages);

      const advisorMessages: Message[] = responses.map(
        (r: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          role: "advisor" as const,
          content: r.content,
          advisorId: r.advisorId,
          advisorName: r.advisorName,
          timestamp: new Date(),
        })
      );

      const messagesWithResponses = [...newMessages, ...advisorMessages];
      setMessages(messagesWithResponses);
      setIsLoading(false);

      // Automatically continue the conversation
      continueConversation(messagesWithResponses);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "advisor",
        content: "Sorry, there was an error getting responses. Please try again.",
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  const getAdvisor = (advisorId?: string) => {
    return advisors.find((a) => a.id === advisorId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            🧠 Advisory Board
          </h1>
          <div className="flex gap-6">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={advisor.imageUrl}
                    alt={advisor.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {advisor.name}
                  </div>
                  <div className="text-xs text-gray-500">{advisor.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Starting conversation...
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto text-lg">
                Your advisory board is picking a topic to discuss.
              </p>
              <div className="mt-6 flex gap-1.5 justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const advisor = getAdvisor(message.advisorId);
            const isFirstMessage = index === 0;

            // Show topic as a centered banner
            if (isFirstMessage && message.role === "user") {
              return (
                <div key={message.id} className="text-center mb-8">
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
                    <div className="text-sm font-semibold">📢 Discussion Topic</div>
                    <div className="text-lg font-bold mt-1">{message.content}</div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 items-start ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                {message.role === "advisor" && advisor ? (
                  <div className="flex-shrink-0 mt-1">
                    <img
                      src={advisor.imageUrl}
                      alt={advisor.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      You
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                  style={{ maxWidth: "65%" }}
                >
                  {message.role === "advisor" && advisor && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {advisor.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                        message.role === "user" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <span className="text-xs text-gray-400 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {(isLoading || isContinuingChat) && (
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  {isContinuingChat && (
                    <span className="ml-2 text-xs text-gray-500">
                      discussing...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Jump in anytime with your question..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-[15px]"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: "48px" }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none h-[48px] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">
            The advisors will discuss the topic. You can jump in anytime! (Enter
            to send, Shift+Enter for new line)
          </p>
        </div>
      </div>
    </div>
  );
}
