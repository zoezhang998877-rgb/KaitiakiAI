/**
 * 应用公共外壳：顶栏、导航、全局 loading/错误提示
 * 子页面通过 <Outlet /> 渲染在下方
 */
import { NavLink, Outlet } from 'react-router-dom';
import { useHazard } from '../../context/HazardContext';

const navItems = [
  { to: '/', label: 'Hazard Map', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/comparison', label: 'Compare' },
  { to: '/simulation', label: 'Simulation' }
];

export default function AppShell() {
  const { isLoading, loadError, displayName } = useHazard();

  return (
    <div className="app-shell">
      {/* 顶部品牌栏，右侧显示当前活跃地点 */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <div className="brand__logo" aria-hidden="true">
              K
            </div>
            <div>
              <div className="brand__title">KaitiakiAI</div>
              <div className="brand__subtitle">
                Urban Hazard Intelligence · New Zealand
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Active: <strong style={{ color: 'var(--accent)' }}>{displayName}</strong>
          </div>
        </div>
      </header>

      {/* 页面导航，NavLink 会自动加 active 样式 */}
      <nav className="app-nav" aria-label="Main">
        <div className="app-nav__inner">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {/* 全局加载 / 错误提示（所有页面共享） */}
        {isLoading && (
          <div className="alert alert--info" role="status">
            <span className="alert__spinner" aria-hidden="true" />
            Loading live hazard data...
          </div>
        )}

        {loadError && !isLoading && (
          <div className="alert alert--error" role="alert">
            {loadError}
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
