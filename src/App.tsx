import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { AllNews } from './pages/AllNews';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/news" element={<AllNews />} />
      </Routes>
    </Router>
  );
}

export default App;
