import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Forza4 from './pages/Forza4';
import NonHoMai from './pages/NonHoMai';
import Dnd from './pages/Dnd';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forza4" element={<Forza4 />} />
        <Route path="/non-ho-mai" element={<NonHoMai />} />
        <Route path="/dnd" element={<Dnd />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
