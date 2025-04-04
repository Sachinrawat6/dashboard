import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, FileText, User } from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation(); // Get current route

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } h-screen bg-gray-800 text-white transition-all duration-300 p-4`}
      >
        <button onClick={() => setIsOpen(!isOpen)} className="mb-6">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="space-y-4">
          <h1 className="text-center font-bold bg-blue-400 p-3 truncate rounded-md text-white">
            Employee Dashboard
          </h1>

          <Link
            to="/"
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              location.pathname === "/" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <LayoutDashboard size={20} />
            {isOpen && <span>Dashboard</span>}
          </Link>
          <Link
            to="/reports"
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              location.pathname === "/reports" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FileText size={20} />
            {isOpen && <span>View Reports</span>}
          </Link>

          <Link
            to="/products"
            className={` items-center hidden space-x-2 p-3 rounded-lg ${
              location.pathname === "/products" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FileText size={20} />
            {isOpen && <span>View Products</span>}
          </Link>
          
         
            <Link
            to="/status"
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              location.pathname === "/status" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <User size={20} />
            {isOpen && <span>Employee Status</span>}
          </Link>
            
          <Link
            to="/orders"
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              location.pathname === "/orders" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FileText size={20} />
            {isOpen && <span>Orders Preport</span>}
          </Link>

        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
