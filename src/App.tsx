import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Forza4 from './pages/Forza4';
import NonHoMai from './pages/NonHoMai';
import Dnd from './pages/Dnd';
import DndPro from './pages/DndPro';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forza4" element={<Forza4 />} />
        <Route path="/non-ho-mai" element={<NonHoMai />} />
        <Route path="/dnd" element={<Dnd />} />
        <Route path="/dnd-pro" element={<DndPro />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
