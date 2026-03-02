import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { AllNews } from './pages/AllNews';
import { AllCourses } from './pages/AllCourses';
import { AllActivities } from './pages/AllActivities';
import { AllHardwareProducts } from './pages/AllHardwareProducts';
import { AllFeedback } from './pages/AllFeedback';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/news" element={<AllNews />} />
        <Route path="/courses" element={<AllCourses />} />
        <Route path="/activities" element={<AllActivities />} />
        <Route path="/products" element={<AllHardwareProducts />} />
        <Route path="/feedback" element={<AllFeedback />} />
      </Routes>
    </Router>
  );
}

export default App;
