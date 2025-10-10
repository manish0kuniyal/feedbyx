import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import LandingPage from './components/LandingPage/LandingPage';
import NotFound from './components/NotFound';
import FormView from './forms/FormView';
function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forms/:formId" element={<FormView />} /> 
        <Route path="*" element={<NotFound />} />
      </Routes>
  
  );
}

export default App;
