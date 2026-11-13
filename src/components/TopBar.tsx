import Icon from './Icon'
import type { TypeName } from '../lib/store'

interface Props {
  title: string
  types?: TypeName[]
  activeType?: TypeName
  onTypeChange?: (t: TypeName) => void
  theme: 'light' | 'dark'
  onThemeChange: (t: 'light' | 'dark') => void
  onLogout: () => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export default function TopBar({
  title,
  types,
  activeType,
  onTypeChange,
  theme,
  onThemeChange,
  onLogout,
  sidebarCollapsed,
  onToggleSidebar,
}: Props) {
  return (
    <header className="topbar">
      {onToggleSidebar && sidebarCollapsed && (
        <button
          className="icon-btn"
          style={{ marginRight: 12 }}
          onClick={onToggleSidebar}
          title="展开菜单"
        >
          <Icon name="panelRight" size={15} />
        </button>
      )}

      <div className="topbar__title">{title}</div>

      <div className="topbar__center">
        {types?.map((t) => (
          <button
            key={t}
            className={`tab${t === activeType ? ' tab--active' : ''}`}
            onClick={() => onTypeChange?.(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="topbar__right">
        <div className="theme-switch">
          <button
            className={`theme-switch__opt${theme === 'light' ? ' theme-switch__opt--active' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            浅色
          </button>
          <button
            className={`theme-switch__opt${theme === 'dark' ? ' theme-switch__opt--active' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            深色
          </button>
        </div>
        <button className="icon-btn" onClick={onLogout} title="退出登录">
          <Icon name="logout" size={15} />
        </button>
      </div>
    </header>
  )
}
