import { useState, useRef, useEffect } from 'react'
import { Client } from '@langchain/langgraph-sdk'
import styles from './Chat.module.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:2024'
const client = new Client({ apiUrl: API_BASE })

function ChatMessage({ role, content }) {
  return (
    <div className={`${styles.message} ${role === 'user' ? styles.user : styles.agent}`}>
      <div className={styles.bubble}>
        <span className={styles.role}>{role === 'user' ? 'You' : 'AI'}</span>
        <p className={styles.content}>{content}</p>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello! How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const assistantId = 'agent'
      const thread = await client.threads.create()
      const stream = client.runs.stream(
        thread.thread_id,
        assistantId,
        {
          input: { changeme: text },
          streamMode: 'values',
        },
      )

      let lastContent = ''

      for await (const event of stream) {
        if (event.event === 'values' && event.data?.changeme) {
          lastContent = String(event.data.changeme)
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: lastContent || 'No response from agent.' },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <h1>AUTO TRAIN AGENTS</h1>
      </header>

      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} aria-hidden="true" />
            Agent is thinking…
          </div>
        )}
        {error && <div className={styles.error}>Error: {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          disabled={loading}
          aria-label="Message"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
