import { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import ReqPool from '../components/ReqPool'
import CompAnalysis from '../components/CompAnalysis'
import ReqTrack from '../components/ReqTrack'
import ReqPrd from '../components/ReqPrd'
import RetroList from '../components/RetroList'
import {
  MENUS,
  uid,
  type Space,
  type TypeName,
  type Requirement,
  type RequirementStatus,
  type RequirementPrd,
  type Competitor,
  type Retro,
} from '../lib/store'
import {
  fetchRequirements,
  insertRequirement,
  updateRequirementStatus,
  fetchCompetitors,
  insertCompetitor,
  fetchRetros,
  insertRetro,
} from '../lib/api'

interface Props {
  space: Space
  theme: 'light' | 'dark'
  onThemeChange: (t: 'light' | 'dark') => void
  onBackToHome: () => void
}

const CARD_MIN_W = 280

export default function Workspace({
  space,
  theme,
  onThemeChange,
  onBackToHome,
}: Props) {
  const [activeType, setActiveType] = useState<TypeName>(space.types[0])
  const [openKeys, setOpenKeys] = useState<string[]>([MENUS[space.types[0]][0].key])
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [widths, setWidths] = useState<Record<string, number>>({})
  const [containerW, setContainerW] = useState(0)
  const [addSignal, setAddSignal] = useState<Record<string, number>>({})
  const [trackTarget, setTrackTarget] = useState<string | null>(null)
  const [prdTarget, setPrdTarget] = useState<{ reqId: string; mode: 'view' | 'edit' } | null>(null)
  const [prdDocs, setPrdDocs] = useState<Record<string, RequirementPrd>>({})
  const [draggingHandle, setDraggingHandle] = useState<string | null>(null)
  const [closingKeys, setClosingKeys] = useState<string[]>([])
  const [switching, setSwitching] = useState(false)
  const closeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const cardsRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ key: string; nextKey: string; startX: number; startW: number; nextW: number } | null>(null)

  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [retros, setRetros] = useState<Retro[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const [rs, cs, rt] = await Promise.all([
        fetchRequirements(),
        fetchCompetitors(),
        fetchRetros(),
      ])
      setRequirements(rs)
      setCompetitors(cs)
      setRetros(rt)
    })()
  }, [])

  const menus = MENUS[activeType] || []
  const activeMenus = menus.filter((m) => openKeys.includes(m.key))
  const renderedMenus = menus.filter((m) => openKeys.includes(m.key) || closingKeys.includes(m.key))

  useEffect(() => {
    const el = cardsRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth))
    ro.observe(el)
    setContainerW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setWidths({})
  }, [openKeys.length, activeType, containerW])

  useEffect(() => {
    if (!trackTarget) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setTrackTarget(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [trackTarget])

  function switchType(t: TypeName) {
    setSwitching(true)
    setActiveType(t)
    setClosingKeys([])
    setTrackTarget(null)
    setPrdTarget(null)
    const first = MENUS[t]?.[0]
    if (first) {
      setOpenKeys([first.key])
      setExpanded(null)
    }
    window.setTimeout(() => setSwitching(false), 220)
  }

  function toggleMenu(key: string) {
    setExpanded(null)
    if (key === 'req') setTrackTarget(null)
    if (closeTimers.current[key]) {
      clearTimeout(closeTimers.current[key])
      delete closeTimers.current[key]
    }
    setOpenKeys((prev) => {
      if (prev.includes(key)) {
        setClosingKeys((keys) => (keys.includes(key) ? keys : [...keys, key]))
        closeTimers.current[key] = setTimeout(() => {
          setClosingKeys((keys) => keys.filter((k) => k !== key))
          delete closeTimers.current[key]
        }, 260)
        return prev.filter((k) => k !== key)
      }
      setClosingKeys((keys) => keys.filter((k) => k !== key))
      return [...prev, key]
    })
  }

  function closeMenu(key: string) {
    if (!openKeys.includes(key)) return
    if (expanded === key) setExpanded(null)
    if (key === 'req') setTrackTarget(null)
    setClosingKeys((keys) => (keys.includes(key) ? keys : [...keys, key]))
    setOpenKeys((prev) => prev.filter((k) => k !== key))
    if (closeTimers.current[key]) clearTimeout(closeTimers.current[key])
    closeTimers.current[key] = setTimeout(() => {
      setClosingKeys((keys) => keys.filter((k) => k !== key))
      delete closeTimers.current[key]
    }, 260)
  }

  function getCardWidth(key: string): number {
    if (widths[key] != null) return widths[key]
    const base = containerW || 800
    const n = activeMenus.length || 1
    const gapW = 9 * (n - 1)
    return Math.max(CARD_MIN_W, (base - gapW) / n)
  }

  const onMouseDown = useCallback(
    (e: React.MouseEvent, key: string, nextKey: string) => {
      e.preventDefault()
      const handleKey = `${key}:${nextKey}`
      setDraggingHandle(handleKey)
      const startW = getCardWidth(key)
      const nextW = getCardWidth(nextKey)
      dragRef.current = { key, nextKey, startX: e.clientX, startW, nextW }

      function move(ev: MouseEvent) {
        const d = dragRef.current
        if (!d) return
        const delta = ev.clientX - d.startX
        let a = d.startW + delta
        let b = d.nextW - delta
        if (a < CARD_MIN_W) { b -= CARD_MIN_W - a; a = CARD_MIN_W }
        if (b < CARD_MIN_W) { a -= CARD_MIN_W - b; b = CARD_MIN_W }
        setWidths((prev) => ({ ...prev, [d.key]: a, [d.nextKey]: b }))
      }
      function up() {
        dragRef.current = null
        setDraggingHandle(null)
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    },
    [widths, activeMenus.length]
  )

  function updateReqStatus(reqId: string, status: RequirementStatus) {
    setRequirements((prev) => prev.map((r) => (r.id === reqId ? { ...r, status } : r)))
    updateRequirementStatus(reqId, status)
  }

  function addRequirement(r: Requirement) {
    setRequirements((prev) => [...prev, r])
    insertRequirement(r)
  }

  function addCompetitor(c: Competitor) {
    setCompetitors((prev) => [...prev, c])
    insertCompetitor(c)
  }

  function addRetro(reqId: string, content: string) {
    const r: Retro = { id: uid(), reqId, content, createdAt: Date.now() }
    setRetros((prev) => [...prev, r])
    insertRetro(r)
  }

  function savePrd(reqId: string, prd: RequirementPrd) {
    setPrdDocs((prev) => ({ ...prev, [reqId]: prd }))
    setRequirements((prev) => prev.map((requirement) => requirement.id === reqId ? { ...requirement, prd } : requirement))
  }

  function openPrd(reqId: string, mode: 'view' | 'edit') {
    setPrdTarget({ reqId, mode })
    setExpanded('prd')
  }

  function closePrd() {
    setPrdTarget(null)
    setExpanded((current) => current === 'prd' ? null : current)
  }

  function triggerAdd(menuKey: string) {
    setAddSignal((prev) => ({ ...prev, [menuKey]: (prev[menuKey] || 0) + 1 }))
  }

  function needsAddBtn(menuKey: string) {
    return menuKey === 'req' || menuKey === 'comp' || menuKey === 'prd'
  }

  function renderCardContent(menuKey: string) {
    if (menuKey === 'req') {
      return (
        <ReqPool
          spaceId={space.id}
          requirements={requirements}
          activeReqId={trackTarget}
          onAdd={addRequirement}
          onOpenTrack={(reqId) => {
            setTrackTarget((current) => (current === reqId ? null : reqId))
          }}
          openSignal={addSignal['req'] || 0}
          searchQuery={searchQuery}
        />
      )
    }
    if (menuKey === 'comp') {
      return (
        <CompAnalysis
          spaceId={space.id}
          competitors={competitors}
          onAdd={addCompetitor}
          openSignal={addSignal['comp'] || 0}
          searchQuery={searchQuery}
        />
      )
    }
    if (menuKey === 'prd') {
      const target = prdTarget ? requirements.find((requirement) => requirement.id === prdTarget.reqId) : null
      if (target && prdTarget) {
        return (
          <ReqPrd
            requirement={{ ...target, prd: prdDocs[target.id] || target.prd }}
            mode={prdTarget.mode}
            onClose={closePrd}
            onSave={(prd) => savePrd(target.id, prd)}
          />
        )
      }
      return (
        <ReqPool
          spaceId={space.id}
          requirements={requirements}
          activeReqId={prdTarget?.reqId || null}
          onAdd={addRequirement}
          onOpenTrack={() => undefined}
          openSignal={addSignal['prd'] || 0}
          searchQuery={searchQuery}
          variant="prd"
          onOpenPrd={openPrd}
        />
      )
    }
    if (menuKey === 'retro') {
      return (
        <RetroList
          spaceId={space.id}
          requirements={requirements}
          retros={retros}
          onAddRetro={addRetro}
          searchQuery={searchQuery}
        />
      )
    }
    return (
      <div className="empty" style={{ padding: '36px 12px' }}>
        <div style={{ fontSize: 12.5 }}>该模块暂未开放</div>
      </div>
    )
  }

  return (
    <>
      <TopBar
        title={space.name}
        types={space.types}
        activeType={activeType}
        onTypeChange={switchType}
        theme={theme}
        onThemeChange={onThemeChange}
        onBackToHome={onBackToHome}
        hideTitle
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed(false)}
      />

      <div className="main">
        <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
          <div className="sidebar__head">
            <button
              className="icon-btn"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? '展开菜单' : '收起菜单'}
            >
              <Icon name={collapsed ? 'panelRight' : 'panelLeft'} size={15} />
            </button>
          </div>

          {menus.map((m) => {
            const on = openKeys.includes(m.key)
            return (
              <button
                key={m.key}
                className={`nav-item${on ? ' nav-item--active' : ''}${collapsed ? ' nav-item--icon' : ''}`}
                onClick={() => toggleMenu(m.key)}
                title={collapsed ? m.label : undefined}
              >
                {on && !collapsed && <span className="nav-item__bar" />}
                <Icon name={m.icon} size={collapsed ? 17 : 16} />
                {!collapsed && <span>{m.label}</span>}
                {on && collapsed && <span className="nav-item__dot" />}
              </button>
            )
          })}
        </aside>

        <section className="content">
          {renderedMenus.length === 0 ? (
            <div className="empty" style={{ flex: 1 }}>
              <div>没有打开的菜单</div>
              <div className="empty__hint">点击左侧菜单打开对应内容</div>
            </div>
          ) : (
            <div className={`cards${switching ? ' cards--switching' : ''}`} ref={cardsRef}>
              {renderedMenus.map((m, i) => {
                const isExpanded = expanded === m.key
                const isClosing = closingKeys.includes(m.key)
                const visible = !expanded || isExpanded
                const w = expanded ? '100%' : `${getCardWidth(m.key)}px`

                return (
                  <Fragment key={m.key}>
                    {i > 0 && !expanded && !isClosing && !closingKeys.includes(renderedMenus[i - 1].key) && (
                      <div
                        className={`resize-handle${draggingHandle === `${renderedMenus[i - 1].key}:${m.key}` ? ' is-dragging' : ''}`}
                        onMouseDown={(e) => onMouseDown(e, renderedMenus[i - 1].key, m.key)}
                      />
                    )}
                    {visible && (
                    <div
                      className={`card${isClosing ? ' card--closing' : ' card--entering'}`}
                        style={
                          expanded
                            ? { width: '100%', flex: '1 0 100%' }
                            : { width: w }
                        }
                      >
                        <div className="card__head">
                          <span className="card__title">{m.label}</span>
                          <div className="card__spacer" />
                          {needsAddBtn(m.key) && !(m.key === 'prd' && prdTarget) && (
                            <button
                              className="card__act"
                              onClick={() => triggerAdd(m.key)}
                              title="新增"
                            >
                              <Icon name="plus" size={15} />
                            </button>
                          )}
                          <button
                            className="card__act"
                            onClick={() => setExpanded(isExpanded ? null : m.key)}
                            title={isExpanded ? '恢复并排' : '展开显示'}
                            aria-label={isExpanded ? '恢复并排' : '展开显示'}
                          >
                            <Icon name={isExpanded ? 'collapse' : 'expand'} size={14} />
                          </button>
                          <button
                            className="card__act card__act--close"
                            onClick={() => closeMenu(m.key)}
                            title="收起卡片"
                            aria-label="收起卡片"
                          >
                            <Icon name="minus" size={14} />
                          </button>
                        </div>
                        <div className="card__body">
                          {renderCardContent(m.key)}
                        </div>
                        {m.key === 'req' && trackTarget && (
                          <div className="overlay requirement-detail-overlay" onClick={() => setTrackTarget(null)}>
                            <div
                              className="modal requirement-detail-modal"
                              role="dialog"
                              aria-modal="true"
                              aria-label="需求追踪详情"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                className="requirement-detail-modal__close"
                                type="button"
                                onClick={() => setTrackTarget(null)}
                                aria-label="关闭需求追踪详情"
                                title="关闭"
                              >
                                <Icon name="close" size={16} />
                              </button>
                              <ReqTrack
                                spaceId={space.id}
                                requirements={requirements}
                                onStatusChange={updateReqStatus}
                                focusId={trackTarget}
                                searchQuery={searchQuery}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          )}
        </section>
      </div>

    </>
  )
}
