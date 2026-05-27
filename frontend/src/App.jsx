/**
 * 应用入口：配置路由，并用 HazardProvider 包裹整个应用
 * 这样所有页面都能通过 useHazard() 共享同一份地点和风险数据
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HazardProvider } from './context/HazardContext';
import AppShell from './components/layout/AppShell';
import HazardMapPage from './pages/HazardMapPage';
import RiskDashboardPage from './pages/RiskDashboardPage';
import ComparisonPage from './pages/ComparisonPage';
import SimulationPage from './pages/SimulationPage';

function App() {
  return (
    // 全局数据提供者：管理当前搜索地点、地震/降雨数据
    <HazardProvider>
      <BrowserRouter>
        <Routes>
          {/* AppShell 是公共外壳：顶栏 + 导航 + 子页面出口 */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HazardMapPage />} />
            <Route path="/dashboard" element={<RiskDashboardPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HazardProvider>
  );
}

export default App;
