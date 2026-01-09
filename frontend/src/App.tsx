import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AssetLibrary } from './pages/AssetLibrary';
import { Workflows } from './pages/Workflows';
import { Team } from './pages/Team';
import { GroupDetail } from './pages/GroupDetail';
import { Workbench } from './pages/Workbench';
import { EventDetail } from './pages/EventDetail';
import { ParameterPool } from './pages/ParameterPool';
import { PageManagement } from './pages/PageManagement';
import { ConfigurationCenter } from './pages/ConfigurationCenter';
import { EnumManagementView } from './pages/configuration/EnumManagementView';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { TreeProvider } from './context/TreeContext';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
// Tracking Plan V2 (新模块)
import TrackingPlanV2Layout from './pages/tracking-plan-v2/TrackingPlanV2Layout';
import PlanListPage from './pages/tracking-plan-v2/pages/PlanListPage';
import PlanDetailPage from './pages/tracking-plan-v2/pages/PlanDetailPage';
import TrackingTestPage from './pages/tracking-test/TrackingTestPage';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-sm">该模块正在开发中...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UIProvider>
        <TreeProvider>
          <Router>
            <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
              <Sidebar />
              <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/assets" element={<AssetLibrary />} />
                  <Route path="/assets/event/:id" element={<EventDetail />} />

                  {/* Configuration Center Routes */}
                  <Route path="/configuration" element={<ConfigurationCenter />}>
                    <Route index element={<Navigate to="/configuration/parameters" replace />} />
                    <Route path="pages" element={<PageManagement />} />
                    <Route path="parameters" element={<ParameterPool />} />
                    <Route path="enums" element={<EnumManagementView />} />
                  </Route>

                  {/* Legacy routes - redirect to new configuration center */}
                  <Route path="/assets/parameters" element={<Navigate to="/configuration/parameters" replace />} />
                  <Route path="/assets/pages" element={<Navigate to="/configuration/pages" replace />} />

                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workbench/:id" element={<Workbench />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/team/group/:groupId" element={<GroupDetail />} />
                  <Route path="/notifications" element={<PlaceholderPage title="通知中心" />} />
                  <Route path="/settings" element={<PlaceholderPage title="系统设置" />} />

                  {/* Tracking Plan V2 - 埋点全生命周期管理模块 */}
                  <Route path="/tracking-v2" element={<TrackingPlanV2Layout />}>
                    <Route index element={<PlanListPage />} />
                    <Route path=":id" element={<PlanDetailPage />} />
                  </Route>

                  <Route path="/tracking-test" element={<TrackingTestPage />} />
                </Routes>
              </main>
              <Modal />
              <Toast />
            </div>
          </Router>
        </TreeProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
