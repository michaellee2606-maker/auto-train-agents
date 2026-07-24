import { useState } from 'react'
import { useAuth } from '../../context/useAuth.js'
import styles from './Login.module.css'

export default function Login() {
  const { setHfToken } = useAuth()
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) return

    setSubmitting(true)
    setHfToken(trimmed)
  }

  return (
    <div className={styles.login}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome</h1>
        <p className={styles.subtitle}>Enter your Hugging Face token to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Hugging Face Token
            <input
              className={styles.input}
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="hf_..."
              autoComplete="off"
              aria-label="Hugging Face token"
              required
            />
          </label>

          <button
            className={styles.button}
            type="submit"
            disabled={submitting || !token.trim()}
          >
            Continue
          </button>
        </form>

        <p className={styles.note}>
          Your token is kept in memory only and is used to authenticate with the LangGraph server.
        </p>
      </div>
    </div>
  )
}
