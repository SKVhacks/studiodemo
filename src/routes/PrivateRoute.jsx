import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const PrivateRoute = () => {
  const { accessToken } = useAuth();

  if (!accessToken) return <Navigate to="/login" />;

  return (
    <>
      <Navbar >
        <Outlet />
      </Navbar>
    </>
  );
};

export default PrivateRoute;
