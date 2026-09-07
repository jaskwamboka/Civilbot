
const CIVILBOT_API_URL = '/api/chat'

export interface CivilBotMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CivilBotRequest {
  input: CivilBotMessage[];
  beamContext?: {
    beamType: string
    spans: number;
    loads: number;
    analysisType: string;
  }
}

export interface CivilBotResponse {
  message: string
  error?: string
  responseId?: string
}

export async function sendMessageToCivilBot(
  request: CivilBotRequest
): Promise<CivilBotResponse> {
  try {
    const response = await fetch(CIVILBOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: request.input,
        beamContext: request.beamContext,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "Unknown API error")
    }

    return {
      message: data.message || 'No message returned.',
      responseId: data.responseId,
    }
    
  } catch (error) {
    console.error('CivilBot API error:', error)

    return {
      message:
        'I apologize, but I encountered an error connecting to the CivilBot service. Please check your API configuration and try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper function to format beam context for the chatbot
export function formatBeamContext(config: {
  beamType: string
  spans: { length: number }[]
  loads: { type: string; magnitude: number; position: number }[]
}) {
  return {
    beamType: config.beamType,
    spans: config.spans.length,
    loads: config.loads.length,
    analysisType:
      config.beamType === 'continuous'
        ? 'three-moment-equation'
        : 'equilibrium',
  }
}