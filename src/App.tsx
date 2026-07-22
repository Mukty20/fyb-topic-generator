import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Stage1 from "./pages/Stage1";
import Stage2 from "./pages/Stage2";
import Stage3 from "./pages/Stage3";
import Stage4 from "./pages/Stage4";
import Stage5 from "./pages/Stage5";
import Stage6 from "./pages/Stage6";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — must be logged in */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/stage1" element={
          <ProtectedRoute><Stage1 /></ProtectedRoute>
        } />
        <Route path="/stage2" element={
          <ProtectedRoute><Stage2 /></ProtectedRoute>
        } />
        <Route path="/stage3" element={
          <ProtectedRoute><Stage3 /></ProtectedRoute>
        } />
        <Route path="/stage4" element={
          <ProtectedRoute><Stage4 /></ProtectedRoute>
        } />
        <Route path="/stage5" element={
          <ProtectedRoute><Stage5 /></ProtectedRoute>
        } />
        <Route path="/stage6" element={
          <ProtectedRoute><Stage6 /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;