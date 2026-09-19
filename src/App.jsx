import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from './routes/PrivateRoute';
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import { Home } from './pages/Home';
import ListClients from './pages/clients/ListClients';
import ClientDetail from './pages/clients/ClientDetail';
import ListEvents from './pages/Events/ListEvents';
import PaymentList from './pages/Payments/PaymentList'
import Staff from './pages/Staff/Staff';
import AdminDashboard from './pages/Analytics/AdminDashboard';
import Settings from './pages/Integrations/IntegrationSettings';
import ViewAllBookings from "./pages/Bookings/ViewAllBookings";
import ViewGallery from "./pages/Gallery/ViewGallery";
import NotFound from "./pages/NotFound";

function App() {
  const { accessToken, role } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />  {/* ← home is now "/" */}
          <Route path="/clients" element={<ListClients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/events" element={<ListEvents />} />
          <Route
            path='/AdminDashboard'
            element={role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path='/Settings'
            element={role === "ADMIN" ? <Settings /> : <Navigate to="/" replace />}
          />
          <Route
            path="/bookings"
            element={<ViewAllBookings />}
          />
          <Route
            path="/gallery"
            element={ <ViewGallery />}
          />
          <Route
            path='/payments'
            element={role === "ADMIN" ? <PaymentList /> : <Navigate to="/" replace />}
          />
          <Route
            path='/staff'
            element={role === "ADMIN" ? <Staff /> : <Navigate to="/" replace />}
          />
        </Route>

        <Route
          path="/login"
          element={accessToken ? <Navigate to="/" replace /> : <Login />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 