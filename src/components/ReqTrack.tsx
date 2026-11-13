import { useState } from 'react'
import Icon from './Icon'
import {
  REQ_STATUSES,
  type Requirement,
  type RequirementStatus,
} from '../lib/store'

interface Props {
  spaceId: string
  requirements: Requirement[]
  onStatusChange: (reqId: string, status: RequirementStatus) => void
  focusId: string | null
}

export default function ReqTrack({ spaceId, requirements, onStatusChange, focusId }: Props) {
  const [detailId, setDetailId] = useState<string | null>(null)

  const list = requirements.filter((r) => r.spaceId === spaceId)
  const detail = list.find((r) => r.id === (detailId || focusId))
  const current = detail || (focusId ? list.find((r) => r.id === focusId) : null)

  if (detail || (focusId && current)) {
    const r = detail || current!
    const idx = REQ_STATUSES.indexOf(r.status)
    return (
      <div className="track-detail">
        <div className="track-detail__head">
          {detailId && (
            <button className="track-detail__back" onClick={() => setDetailId(null)}>
              ← 返回列表
            </button>
          )}
          <span className="track-detail__ver">{r.version}</span>
          <span className={`pri pri--${r.priority.toLowerCase()}`}>{r.priority}</span>
        </div>

        <div className="track-detail__name">{r.name}</div>

        <div className="progress">
          {REQ_STATUSES.map((st, i) => {
            const done = i <= idx
            return (
              <div key={st} className="progress__node">
                <div className="progress__dot-wrap">
                  <div className={`progress__dot${done ? ' progress__dot--done' : ''}`} />
                  {i < REQ_STATUSES.length - 1 && (
                    <div className={`progress__line${i < idx ? ' progress__line--done' : ''}`} />
                  )}
                </div>
                <div className="progress__label-row">
                  <span className={`progress__label${done ? ' progress__label--done' : ''}`}>
                    {st}
                  </span>
                  <button
                    className={`progress__check${i === idx ? ' progress__check--done' : ''}`}
                    onClick={() => onStatusChange(r.id, st)}
                    title={`标记为${st}`}
                  >
                    <Icon name="check" size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {r.content && (
          <div className="track-detail__content">
            <div className="field-label">需求内容</div>
            <div className="track-detail__text">{r.content}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {list.length === 0 ? (
        <div className="empty" style={{ padding: '36px 12px' }}>
          <div style={{ fontSize: 12.5 }}>暂无追踪单</div>
          <div className="empty__hint">在需求池新建需求后自动生成</div>
        </div>
      ) : (
        <div className="comp-grid">
          {list.map((r) => (
            <button key={r.id} className="track-card" onClick={() => setDetailId(r.id)}>
              <div className="track-card__top">
                <span className="track-card__ver">{r.version}</span>
                <span className={`pri pri--${r.priority.toLowerCase()}`}>{r.priority}</span>
              </div>
              <div className="track-card__name">{r.name}</div>
              <div className="track-card__status">
                <span className="track-card__dot" />
                {r.status}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
