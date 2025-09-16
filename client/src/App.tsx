import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import MyReservations from "./pages/MyReservations";
import CabanaInfo from "./pages/CabanaInfo";
import CabanaReviews from "./pages/CabanaReviews";
import ReservationForm from "./pages/ReservationForm";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";
import { Rol } from "./constants/roles";
import BusinessSignIn from "./pages/BusinessSignIn";
import Dashboard from "./pages/Dashboard";
import BusinessProfile from "./pages/BusinessProfile"; // <-- import nou

const App = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-red-500 text-xl">
        Auth context is unavailable.
      </div>
    );
  }

  const { token, loading } = auth;

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/home" : "/signin"} replace />}
      />
      <Route
        path="/signin"
        element={token ? <Navigate to="/home" replace /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/home" replace /> : <SignUp />}
      />
      <Route
        path="/business-signin"
        element={
          token ? <Navigate to="/dashboard" replace /> : <BusinessSignIn />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-profile"
        element={
          <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR]}>
            <BusinessProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.TURIST]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute
            allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR, Rol.TURIST]}
          >
            <MyReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cabana/:id"
        element={
          <ProtectedRoute
            allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR, Rol.TURIST]}
          >
            <CabanaInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cabana/:id/reviews"
        element={
          <ProtectedRoute
            allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR, Rol.TURIST]}
          >
            <CabanaReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservation"
        element={
          <ProtectedRoute
            allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR, Rol.TURIST]}
          >
            <ReservationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute
            allowedRoles={[Rol.ADMIN, Rol.PROPRIETAR, Rol.TURIST]}
          >
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
