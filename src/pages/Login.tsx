import { useState } from 'react'
import { ALLOWED_PHONES } from '../lib/store'

interface Props {
  onLogin: (phone: string) => void
}

export default function Login({ onLogin }: Props) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function submit() {
    const v = phone.trim()
    if (!v) return
    if (ALLOWED_PHONES.includes(v)) {
      onLogin(v)
    } else {
      setError('该账号无权限')
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <input
          className="text-input"
          style={{ letterSpacing: '0.02em' }}
          placeholder="手机号"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />

        <button className="login-btn" onClick={submit}>
          登录
        </button>

        {error && (
          <div className="alert-error">{error}</div>
        )}
      </div>
    </div>
  )
}
