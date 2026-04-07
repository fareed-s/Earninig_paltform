import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="text-center">
      <p className="text-8xl font-extrabold text-slate-200">404</p>
      <h1 className="text-2xl font-bold text-slate-800 mt-4">Page Not Found</h1>
      <p className="text-slate-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;
