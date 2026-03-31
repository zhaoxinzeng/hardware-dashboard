import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { AllNews } from './pages/AllNews';
import { AllCourses } from './pages/AllCourses';
import { AllActivities } from './pages/AllActivities';
import { AllHardwareProducts } from './pages/AllHardwareProducts';
import { AllFeedback } from './pages/AllFeedback';
import { AllCases } from './pages/AllCases';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<AllNews />} />
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/activities" element={<AllActivities />} />
          <Route path="/products" element={<AllHardwareProducts />} />
          <Route path="/feedback" element={<AllFeedback />} />
          <Route path="/cases" element={<AllCases />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
