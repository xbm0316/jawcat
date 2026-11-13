import { useState } from 'react'
import Icon from '../components/Icon'
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
        <div className="login-title">工作空间</div>
        <div className="login-sub">输入手机号进入</div>

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
          进入
        </button>

        {error && (
          <div className="alert-error">
            <Icon name="warning" size={13} />
            <span>{error}</span>
          </div>
        )}

        <div className="login-hint">仅限指定账号使用</div>
      </div>
    </div>
  )
}
