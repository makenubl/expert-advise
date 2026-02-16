import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { advisors, getAdvisorById } from "@/lib/advisors";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Get responses from all three advisors in parallel
    const responses = await Promise.all(
      advisors.map(async (advisor) => {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
          });

          // Build conversation history for context
          // Keep all user messages AND this advisor's messages
          let chatHistory = conversationHistory
            ?.filter((msg: any) => !msg.advisorId || msg.advisorId === advisor.id)
            .map((msg: any) => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content }],
            })) || [];

          // Ensure history starts with user message or is empty
          if (chatHistory.length > 0 && chatHistory[0].role !== "user") {
            chatHistory = [];
          }

          const chat = model.startChat({
            history: chatHistory,
          });

          // Prepend system instruction to the message
          const fullMessage = `${advisor.systemPrompt}\n\nUser question: ${message}`;

          const result = await chat.sendMessage(fullMessage);
          const response = result.response;
          const text = response.text();

          return {
            advisorId: advisor.id,
            advisorName: advisor.name,
            content: text,
            error: null,
          };
        } catch (error) {
          console.error(`Error getting response from ${advisor.name}:`, error);
          return {
            advisorId: advisor.id,
            advisorName: advisor.name,
            content: null,
            error: `Failed to get response from ${advisor.name}`,
          };
        }
      })
    );

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
