import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './Layouts/RootLayout';
import Regression from './components/Regression/Regression';
import Distributions from './components/Distributions';
import Intro from './components/Home-intro/Intro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Intro />} />
          <Route path="/regression" element={<Regression />} />
          <Route path="distributions" element={<Distributions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;