import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OKRProvider } from './context/OKRContext';
import { Navbar } from './components/Layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CompanyOKRs } from './pages/CompanyOKRs';
import { TeamOKRs } from './pages/TeamOKRs';
import { IndividualOKRs } from './pages/IndividualOKRs';
import { AlignmentView } from './pages/AlignmentView';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter basename="/okr-manager">
      <OKRProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/company" element={<CompanyOKRs />} />
              <Route path="/team" element={<TeamOKRs />} />
              <Route path="/individual" element={<IndividualOKRs />} />
              <Route path="/alignment" element={<AlignmentView />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </OKRProvider>
    </BrowserRouter>
  );
}

export default App;
