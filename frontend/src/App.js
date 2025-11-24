import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import PublicarProducto from './pages/PublicarProducto';
import DetalleProducto from './pages/DetalleProducto';
import Favoritos from './pages/Favoritos';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';
import EditarProducto from "./pages/EditarProducto";
import VerificarEmail from "./pages/VerificarEmail";
import RecuperarPassword from "./pages/RecuperarPassword";
import DetalleServicio from "./pages/DetalleServicio";
import EditarServicio from './pages/EditarServicio';
import SelectorModo from './pages/SelectorModo';
import DashboardAdmin from './pages/DashboardAdmin';
import GestionIncidencias from './pages/GestionIncidencias';
import GestionUsuarios from './pages/GestionUsuarios';
import RegistrarModerador from './pages/RegistrarModerador';
import Mensajes from './pages/Mensajes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/publicar" element={<PublicarProducto />} />
        
        <Route path="/selector-modo" element={<SelectorModo />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/gestion-incidencias" element={<GestionIncidencias />} />
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/registrar-moderador" element={<RegistrarModerador />} />
        <Route path="/mensajes" element={<Mensajes />} />
        
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/editar-producto/:id" element={<EditarProducto />} />
        <Route path="/verificar" element={<VerificarEmail />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/servicio/:id" element={<DetalleServicio />} />
        <Route path="/editar-servicio/:id" element={<EditarServicio />} />
      </Routes>
    </Router>
  );
}

export default App;