import React, { useContext, useState } from 'react';
// 1. IMPORT useNavigate HERE:
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AppContext);
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useContext(AppContext);
  
  // 2. INITIALIZE useNavigate
  const navigate = useNavigate(); 
  
  const [openModalTrigger, setOpenModalTrigger] = useState(false);

  // 3. CREATE A SMART TRIGGER FUNCTION
  const handleOpenAddExpense = () => {
    navigate('/'); // Instantly jump back to the Dashboard...
    setTimeout(() => setOpenModalTrigger(true), 50); // ...and pop the modal open!
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 pb-20 md:pb-0 relative">
      
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E2330', 
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            fontWeight: '600',
            padding: '14px 24px',
            letterSpacing: '0.025em',
          },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* 4. PASS THE SMART TRIGGER TO THE NAVBAR */}
      {user && <Navbar onOpenAddExpense={handleOpenAddExpense} />} 
      
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard 
              openModalTrigger={openModalTrigger} 
              resetModalTrigger={() => setOpenModalTrigger(false)} 
            />
          </PrivateRoute>
        } />
        
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;