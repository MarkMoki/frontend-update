import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SecondPage from './components/SecondPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/secondpage" element={<SecondPage />} />
      </Routes>
    </Router>
  );
}

export default App;
