import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AssetLibrary } from './pages/AssetLibrary';
import { Workflows } from './pages/Workflows';
import { Team } from './pages/Team';
import { Workbench } from './pages/Workbench';
import { EventDetail } from './pages/EventDetail';
import { ParameterPool } from './pages/ParameterPool';
import { PageManagement } from './pages/PageManagement';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { TreeProvider } from './context/TreeContext';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';

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
                  <Route path="/assets/parameters" element={<ParameterPool />} />
                  <Route path="/assets/pages" element={<PageManagement />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workbench/:id" element={<Workbench />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/notifications" element={<PlaceholderPage title="通知中心" />} />
                  <Route path="/settings" element={<PlaceholderPage title="系统设置" />} />
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
