import { civilbotSystemPrompt } from "@/prompts/civilbotsystemprompts";
import { error } from "console";
import { NextRequest, NextResponse } from 'next/server'

const CIVILBOT_API_URL = 'https://api.openai.com/v1/responses'
const CIVILBOT_MODEL = 'gpt-5.4'
const CIVILBOT_API_KEY = process.env.OPENAI_API_KEY ?? process.env.CIVILBOT_API_KEY

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type BeamContext = {
  beamType: string
  spans: number
  loads: number
  analysisType: string
}

export async function POST(request: NextRequest) {
  try {
    if (!CIVILBOT_API_KEY) {
      return NextResponse.json(
        {
          message: 'Server API key is not configured.',
          error: 'Missing OpenAI API key',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages, beamContext } = body as {
      messages?: ChatMessage[]
      beamContext?: BeamContext
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          message: 'No messages were provided.',
          error: 'Messages are required.',
        },
        { status: 400 }
      )
    }

 const beamDescription = beamContext
  ? `
Current Beam:
- Beam Type: ${beamContext.beamType}
- Number of Spans: ${beamContext.spans}
- Analysis Type: ${beamContext.analysisType}
- Loads: ${beamContext.loads}
`
  : "No beam has been configured.";

const instructions = `
${civilbotSystemPrompt}

${beamDescription}
`;

    const response = await fetch(CIVILBOT_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CIVILBOT_API_KEY}`,
  },
  body: JSON.stringify({
    model: CIVILBOT_MODEL,
    instructions,
    input: messages.map((message) => ({
    role: message.role,
    content: message.content,
  })),

    max_output_tokens: 500,
    
    tools: [
      {
        type: 'file_search',
        vector_store_ids: ['vs_6a5deafc2ddc8191992657576f6c5d50'],
      },
    ],
    tool_choice: 'auto',
  }),
});
 
const data = await response.json();
console.log("===== OPENAI RESPONSE =====");
console.dir(data, { depth: null });
console.log("===========================");

if (!response.ok) {
  return NextResponse.json(
    {
      message: "I encountered an error while contacting CivilBot.",
      error: data?.error?.message || `API error: ${response.status}`,
      details: data,
    },
    { status: response.status }
  );
}

const assistantMessage =
  data.output
    ?.filter((item: any) => item.type === "message")
    .flatMap((item: any) => item.content ?? [])
    .filter((content: any) => content.type === "output_text")
    .map((content: any) => content.text)
    .join("\n\n") || "No response returned.";

return NextResponse.json({
  message: assistantMessage || "No response returned.",
  responseId: data.id,
});
  } catch (error) {
    console.error('Chat API error:', error)

    return NextResponse.json(
      {
        message:
          'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}