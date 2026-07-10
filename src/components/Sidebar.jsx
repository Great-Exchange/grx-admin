import { LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen, menuItems, handleLogout }) {
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#FF006A] text-white transition-all duration-300 fixed h-screen overflow-y-auto shadow-lg`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold mx-auto">GRX</h1>}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-[#FF006A] p-2 rounded"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/u/${item.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? "bg-[#f06ea5]" : "hover:bg-[#f06ea5]"
              } ${!isOpen ? "justify-center" : ""}`
            }
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-8 left-4 right-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-700 transition ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
