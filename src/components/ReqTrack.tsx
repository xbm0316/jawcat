import { useEffect, useState } from 'react'
import Icon from './Icon'
import {
  REQ_STATUSES,
  type Requirement,
  type RequirementStatus,
  type RequirementAttachment,
} from '../lib/store'

interface Props {
  spaceId: string
  requirements: Requirement[]
  onStatusChange: (reqId: string, status: RequirementStatus) => void
  focusId: string | null
  searchQuery?: string
}

export default function ReqTrack({ spaceId, requirements, onStatusChange, focusId, searchQuery = '' }: Props) {
  const [detailId, setDetailId] = useState<string | null>(null)
  const [previewAttachment, setPreviewAttachment] = useState<RequirementAttachment | null>(null)

  useEffect(() => {
    if (!previewAttachment) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPreviewAttachment(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewAttachment])

  const query = searchQuery.trim().toLocaleLowerCase()
  const spaceList = requirements.filter((r) => r.spaceId === spaceId)
  const list = spaceList
    .filter((r) => !query || [r.name, r.content, r.version, r.priority, r.status].join(' ').toLocaleLowerCase().includes(query))
    .sort((a, b) => b.createdAt - a.createdAt)
  const detail = spaceList.find((r) => r.id === (detailId || focusId))
  const current = detail || (focusId ? spaceList.find((r) => r.id === focusId) : null)

  if (detail || (focusId && current)) {
    const r = detail || current!
    const idx = REQ_STATUSES.indexOf(r.status)
    return (
      <>
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
          <div className="progress__track">
            {REQ_STATUSES.slice(0, -1).map((_, i) => (
              <div
                key={`connector-${i}`}
                className={`progress__connector${i < idx ? ' progress__connector--done' : ''}`}
                style={{ left: `${i * 25}%`, width: '25%' }}
              />
            ))}
            {REQ_STATUSES.map((st, i) => {
              const done = i <= idx
              return (
                <div
                  key={st}
                  className={`progress__node${i === 0 ? ' progress__node--first' : ''}${i === REQ_STATUSES.length - 1 ? ' progress__node--last' : ''}`}
                  style={{ left: `${(i / (REQ_STATUSES.length - 1)) * 100}%` }}
                >
                  <div className="progress__dot-wrap">
                    <div className={`progress__dot${done ? ' progress__dot--done' : ''}${i === idx ? ' progress__dot--current' : ''}`} />
                  </div>
                  <div className="progress__label-row">
                    <span className={`progress__label${done ? ' progress__label--done' : ''}${i === idx ? ' progress__label--current' : ''}`}>
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
        </div>

        {r.content && (
          <div className="track-detail__content">
            <div className="field-label">需求内容</div>
            <div className="track-detail__text">{r.content}</div>
          </div>
        )}

        {r.attachments && r.attachments.length > 0 && (
          <div className="track-detail__attachments">
            <div className="field-label">附件</div>
            <div className="track-attachment-list">
              {r.attachments.map((attachment) => (
                <button
                  className="track-attachment"
                  key={attachment.id}
                  type="button"
                  onClick={() => setPreviewAttachment(attachment)}
                >
                  {attachment.kind === 'image' ? (
                    <img src={attachment.url} alt={attachment.name} />
                  ) : (
                    <span className="track-attachment__file">文件</span>
                  )}
                  <span>{attachment.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
        {previewAttachment && (
        <div className="overlay" onClick={() => setPreviewAttachment(null)}>
          <div className="modal attachment-preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{previewAttachment.name}</div>
            {previewAttachment.kind === 'image' ? (
              <img className="attachment-preview__image" src={previewAttachment.url} alt={previewAttachment.name} />
            ) : (
              <div className="attachment-preview__file">
                <span className="attachment-preview__file-icon">文件</span>
                <span>{previewAttachment.type || '未知文件类型'}</span>
                <span>{previewAttachment.size ? `${Math.ceil(previewAttachment.size / 1024)} KB` : '大小未知'}</span>
              </div>
            )}
            <div className="modal__actions">
              <a className="btn-ghost attachment-preview__download" href={previewAttachment.url} download={previewAttachment.name}>下载附件</a>
              <button className="btn-primary" onClick={() => setPreviewAttachment(null)}>关闭</button>
            </div>
          </div>
        </div>
        )}
      </>
    )
  }

  return (
    <>
      {list.length === 0 ? (
        <div className="empty" style={{ padding: '36px 12px' }}>
          <div style={{ fontSize: 12.5 }}>{query ? '没有匹配结果' : '暂无追踪单'}</div>
          {!query && <div className="empty__hint">在需求池新建需求后自动生成</div>}
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
