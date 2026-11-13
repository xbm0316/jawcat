import Icon from './Icon'
import type { TypeName } from '../lib/store'

interface Props {
  title: string
  types?: TypeName[]
  activeType?: TypeName
  onTypeChange?: (t: TypeName) => void
  theme: 'light' | 'dark'
  onThemeChange: (t: 'light' | 'dark') => void
  onBackToHome?: () => void
  onLogout?: () => void
  searchQuery?: string
  onSearchChange?: (value: string) => void
  hideTitle?: boolean
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
  onBackToHome,
  onLogout,
  searchQuery = '',
  onSearchChange,
  hideTitle = false,
  sidebarCollapsed,
  onToggleSidebar,
}: Props) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        {onToggleSidebar && sidebarCollapsed && (
          <button
            className="icon-btn"
            onClick={onToggleSidebar}
            title="展开菜单"
          >
            <Icon name="panelRight" size={15} />
          </button>
        )}
        {!hideTitle && !types?.length && <div className="topbar__title">{title}</div>}
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

      <div className="topbar__center">
        {onSearchChange && (
          <label className="topbar__search">
            <Icon name="search" size={15} />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索需求、竞品、复盘…"
              aria-label="全局搜索"
            />
            {searchQuery && (
              <button
                type="button"
                className="topbar__search-clear"
                onClick={() => onSearchChange('')}
                aria-label="清空搜索"
              >
                ×
              </button>
            )}
          </label>
        )}
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
        <button
          className="icon-btn"
          onClick={onBackToHome || onLogout}
          title={onBackToHome ? '返回工作空间' : '退出登录'}
        >
          <Icon name={onBackToHome ? 'arrowLeft' : 'logout'} size={15} />
        </button>
      </div>
    </header>
  )
}
