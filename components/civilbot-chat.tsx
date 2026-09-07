'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessageToCivilBot, formatBeamContext } from '@/lib/civilbot-api'
import type { ChatMessage, BeamConfiguration } from '@/lib/types'

interface CivilBotChatProps {
  beamConfiguration: BeamConfiguration
}

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        code: ({ children }) => (
          <code className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs">{children}</code>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6">{children}</ol>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function CivilBotChat({ beamConfiguration }: CivilBotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! 👋 I'm CivilBot, your AI civil engineering tutor.

I'm here to help you understand structural analysis clearly and gently, step by step — not just give you the final answer.

I can help you:
- Calculate support reactions
- Explain equilibrium equations
- Solve continuous beams using the Three-Moment Equation
- Draw and interpret SFDs and BMDs
- Check your calculations and explain where mistakes happen

Simply build your beam on the left, then ask me a question.

What would you like to work on today?`,
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessageToCivilBot({
        input: messages.map((m) => ({ role: m.role, content: m.content })).concat({
          role: 'user',
          content: input.trim(),
        }),
        beamContext: formatBeamContext({
          beamType: beamConfiguration.type,
          spans: beamConfiguration.spans,
          loads: beamConfiguration.loads.map((l) => ({
            type: l.type,
            magnitude: l.magnitude,
            position: l.position,
          })),
        }),
      })

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const quickPrompts = [
    'Calculate the reactions',
    'Draw the SFD and BMD',
    'Explain the three-moment equation',
    'Check my beam setup',
  ]

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="flex-shrink-0 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl">
            🏗️
          </div>
          <div>
            <CardTitle className="text-base">CivilBot</CardTitle>
            <p className="text-xs text-muted-foreground">Engineering Analysis Assistant</p>
          </div>
          <div className="ml-auto flex h-2 w-2 rounded-full bg-accent" title="Online" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex h-full flex-col justify-end gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-full rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    <MessageContent content={message.content} />
                  </div>
                  <div
                    suppressHydrationWarning
                    className={`mt-1 text-[10px] ${
                      message.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Let me work through that...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about beam analysis..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
