import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiClipboardList, HiCurrencyDollar, HiUsers, HiCash, HiGift, HiX,
  HiUserGroup, HiCog, HiDocumentText, HiCreditCard } from 'react-icons/hi';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/tasks', label: 'Tasks', icon: HiClipboardList },
  { to: '/packages', label: 'Packages', icon: HiGift },
  { to: '/wallet', label: 'Wallet', icon: HiCurrencyDollar },
  { to: '/referral', label: 'Referrals', icon: HiUsers },
  { to: '/withdraw', label: 'Withdraw', icon: HiCash },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: HiHome },
  { to: '/admin/users', label: 'Users', icon: HiUserGroup },
  { to: '/admin/tasks', label: 'Tasks', icon: HiClipboardList },
  { to: '/admin/package-requests', label: 'Package Requests', icon: HiCreditCard },
  { to: '/admin/withdraw-requests', label: 'Withdrawals', icon: HiDocumentText },
  { to: '/admin/settings', label: 'Settings', icon: HiCog },
];

const Sidebar = ({ isAdmin }) => {
  const [open, setOpen] = useState(false);
  const links = isAdmin ? adminLinks : userLinks;

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('toggleSidebar', handler);
    return () => window.removeEventListener('toggleSidebar', handler);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200/60 z-40 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-semibold text-slate-700">Menu</span>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
