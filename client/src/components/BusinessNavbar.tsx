import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle, MdLogout, MdEdit } from "react-icons/md";
import logo from "/1280px-Emblem_of_ONT_Carpați.svg.png";
import { AuthContext } from "../context/AuthContext";

const BusinessNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const auth = useContext(AuthContext);
  const { user, logout, token } = auth ?? {};

  const handleLogout = () => {
    logout?.();
    setDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/business-profile");
    setDropdownOpen(false);
  };

  const handleDashboard = () => navigate("/dashboard");

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  if (!token || !user) return null;

  return (
    <div className="w-full fixed top-0 left-0 flex justify-between items-center bg-[#161b22]/95 p-4 shadow-md border-b border-[#30363d] z-10">
      <div
        onClick={handleDashboard}
        className="flex items-center gap-2 select-none cursor-pointer"
        title="Mergi la dashboard"
      >
        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
        <div className="text-xl font-bold text-white hover:underline">
          CabanApp
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-[#2d333b] hover:bg-[#3a3f46] text-white px-3 py-1 rounded text-sm font-semibold transition"
          >
            <MdAccountCircle className="text-2xl" />
            {user.nume} {user.prenume}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#21262d] border border-[#30363d] rounded-lg shadow-lg z-20 py-1 space-y-1">
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#21262d] hover:bg-[#2a2f36] transition font-medium rounded"
              >
                <MdEdit className="text-lg" />
                <span className="truncate">Editare profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 bg-[#21262d] hover:bg-[#2a2f36] transition font-medium rounded"
              >
                <MdLogout className="text-lg" />
                <span className="truncate">Delogare</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessNavbar;
