import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import Withdraw from './pages/Withdraw';
import Packages from './pages/Packages';
import NotFound from './pages/NotFound';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminTasks from './admin/AdminTasks';
import AdminPackageRequests from './admin/AdminPackageRequests';
import AdminWithdrawRequests from './admin/AdminWithdrawRequests';
import AdminSettings from './admin/AdminSettings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 mt-16">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isAdmin />
      <div className="flex">
        <Sidebar isAdmin />
        <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 mt-16">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserLayout><Dashboard /></UserLayout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><UserLayout><Tasks /></UserLayout></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><UserLayout><Wallet /></UserLayout></ProtectedRoute>} />
      <Route path="/referral" element={<ProtectedRoute><UserLayout><Referral /></UserLayout></ProtectedRoute>} />
      <Route path="/withdraw" element={<ProtectedRoute><UserLayout><Withdraw /></UserLayout></ProtectedRoute>} />
      <Route path="/packages" element={<ProtectedRoute><UserLayout><Packages /></UserLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute><AdminLayout><AdminTasks /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/package-requests" element={<ProtectedRoute><AdminLayout><AdminPackageRequests /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/withdraw-requests" element={<ProtectedRoute><AdminLayout><AdminWithdrawRequests /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
