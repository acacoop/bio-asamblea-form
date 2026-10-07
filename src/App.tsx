import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Form from "./pages/Form/Form";
import Metrics from "./pages/Metrics/Metrics";

function App() {
  return (
    <Router basename="/bio-asamblea-form">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
        <Route path="/metrics-dashboard-2025" element={<Metrics />} />
      </Routes>
    </Router>
  );
}

export default App;
