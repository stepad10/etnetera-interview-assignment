import { useLoaderData } from "react-router";
import ChatInterface from "~/components/ChatInterface";

export async function loader() {
  return {
    openaiAvailable: !!process.env.OPENAI_API_KEY,
    geminiAvailable:
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      !!process.env.GEMINI_API_KEY,
  };
}

export function meta() {
  return [
    { title: "Dev Q&A Assistant" },
    {
      name: "description",
      content: "Internal developer knowledge base assistant",
    },
  ];
}

export default function Index() {
  const models = useLoaderData<typeof loader>();
  return <ChatInterface availableModels={models} />;
}
