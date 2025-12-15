import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ActivationCodes from './pages/ActivationCodes';
import UserManagement from './pages/UserManagement';
import BusinessManagement from './pages/BusinessManagement';
import RevenueReports from './pages/RevenueReports';

function App() {
  const isAuthenticated = !!localStorage.getItem('adminToken');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/activation-codes"
          element={isAuthenticated ? <ActivationCodes /> : <Navigate to="/" />}
        />
        <Route
          path="/users"
          element={isAuthenticated ? <UserManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/businesses"
          element={isAuthenticated ? <BusinessManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/revenue"
          element={isAuthenticated ? <RevenueReports /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
