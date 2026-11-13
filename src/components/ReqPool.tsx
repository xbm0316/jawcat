import { useState, useEffect } from 'react'
import {
  REQ_STATUSES,
  PRIORITIES,
  type Requirement,
  type RequirementStatus,
  type Priority,
  uid,
} from '../lib/store'

interface Props {
  spaceId: string
  requirements: Requirement[]
  onAdd: (r: Requirement) => void
  onOpenTrack: (reqId: string) => void
  openSignal: number
}

export default function ReqPool({ spaceId, requirements, onAdd, onOpenTrack, openSignal }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [version, setVersion] = useState('V')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('P1')
  const [status, setStatus] = useState<RequirementStatus>('调研中')

  useEffect(() => {
    if (openSignal > 0) setShowForm(true)
  }, [openSignal])

  const list = requirements.filter((r) => r.spaceId === spaceId)

  function submit() {
    if (!name.trim()) return
    onAdd({
      id: uid(),
      spaceId,
      version: version.trim() || 'V',
      name: name.trim(),
      content: content.trim(),
      priority,
      status,
      createdAt: Date.now(),
    })
    setShowForm(false)
    setVersion('V')
    setName('')
    setContent('')
    setPriority('P1')
    setStatus('调研中')
  }

  return (
    <>
      <div className="status-groups">
        {REQ_STATUSES.map((st) => {
          const items = list.filter((r) => r.status === st)
          return (
            <div key={st} className="status-group">
              <div className="status-group__head">
                <span className="status-group__name">{st}</span>
                <span className="status-group__count">{items.length}</span>
              </div>
              <div className="status-group__body">
                {items.length === 0 ? (
                  <div className="status-group__empty">暂无需求</div>
                ) : (
                  items.map((r) => (
                    <button
                      key={r.id}
                      className="req-card"
                      onClick={() => onOpenTrack(r.id)}
                    >
                      <div className="req-card__top">
                        <span className="req-card__ver">{r.version}</span>
                        <span className={`pri pri--${r.priority.toLowerCase()}`}>{r.priority}</span>
                      </div>
                      <div className="req-card__name">{r.name}</div>
                      {r.content && <div className="req-card__content">{r.content}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">新增需求</div>

            <div className="form-row">
              <div style={{ flex: '0 0 110px' }}>
                <div className="field-label">需求版本</div>
                <input
                  className="text-input"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div className="field-label">需求名称</div>
                <input
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="一句话说清要做什么"
                  autoFocus
                />
              </div>
            </div>

            <div className="field-label" style={{ marginTop: 16 }}>
              需求内容
            </div>
            <textarea
              className="text-area"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="背景、目标、验收标准…"
            />

            <div className="form-row" style={{ marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="field-label">优先级</div>
                <div className="chip-row">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      className={`chip${priority === p ? ' chip--on' : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1.6 }}>
                <div className="field-label">需求状态</div>
                <div className="chip-row">
                  {REQ_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`chip${status === s ? ' chip--on' : ''}`}
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal__actions">
              <button className="btn-ghost" onClick={() => setShowForm(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={submit}
                style={{ opacity: name.trim() ? 1 : 0.45 }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
