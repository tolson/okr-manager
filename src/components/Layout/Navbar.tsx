import { NavLink } from 'react-router-dom';
import { useOKR } from '../../context/OKRContext';
import { getQuarterOptions } from '../../utils/storage';

export function Navbar() {
  const { selectedQuarter, setSelectedQuarter } = useOKR();
  const quarters = getQuarterOptions();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">OKR Manager</h1>
            <div className="flex items-center space-x-2">
              <NavLink to="/" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/company" className={linkClass}>
                Company
              </NavLink>
              <NavLink to="/team" className={linkClass}>
                Team
              </NavLink>
              <NavLink to="/individual" className={linkClass}>
                Individual
              </NavLink>
              <NavLink to="/alignment" className={linkClass}>
                Alignment
              </NavLink>
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="quarter" className="text-sm text-gray-600">
              Quarter:
            </label>
            <select
              id="quarter"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
