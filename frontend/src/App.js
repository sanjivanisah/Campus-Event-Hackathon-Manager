import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Submissions from './pages/Submissions';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/submissions" element={<Submissions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
