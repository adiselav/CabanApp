import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Rol } from "../constants/roles";

interface Props {
  children: React.ReactElement;
  allowedRoles?: Rol[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Checking authentication...
      </div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/signin" replace />;
  }

  if (
    allowedRoles &&
    (!auth.user || !allowedRoles.includes(auth.user.rol as Rol))
  ) {
    return (
      <div className="text-center text-red-500 mt-10">
        You are not authorized to view this page.
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
