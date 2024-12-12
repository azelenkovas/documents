
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DocumentSelector from "./DocumentSelector";
import AppNavbar from './AppNavbar';
import PDFComparisonPage from './PDFComparisonPage';

const App: React.FC = () => {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<DocumentSelector />} />
        <Route path="/pdf-comparison" element={<PDFComparisonPage checks={[]} />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
