import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import ProtectedRoute from "./ProtectedRoute";
import Cuestionario from "./components/Cuestionarios.jsx";
import Login from "./components/Login.jsx";
import { supabase } from "./supabaseClient";
import RegistroPaciente from "./components/RegistroPaciente.jsx";
import DatosPaciente from "./components/DatosPaciente.jsx";
import Menu from './components/Menu';
import SubirPregunta from './components/SubirPregunta';
import SubirReporte from "./components/SubirReporte";
import Agenda from "./components/Agenda";
import Perfil from './components/Perfil';

const App = () => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUsuario(data?.user || null);
      setCargando(false);
    };

    obtenerUsuario();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUsuario(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (cargando) return <div className="p-4">Cargando...</div>;

  return (
    <Router>
      <Routes>

        {/* Ruta protegida: Perfil */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute user={usuario}>
              <Perfil />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Agenda */}
        <Route
          path="/agenda"
          element={
            <ProtectedRoute user={usuario}>
              <Agenda />
            </ProtectedRoute>
          }
        />

        {/* Redirección desde la raíz */}
        <Route
          path="/"
          element={<Navigate to={usuario ? "/menu" : "/login"} />}
        />

        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta pública: Registro de pacientes */}
        <Route path="/registro" element={<RegistroPaciente />} />

        {/* Ruta protegida: Datos del paciente */}
        <Route
          path="/datos-paciente"
          element={
            <ProtectedRoute user={usuario}>
              <DatosPaciente />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Menú */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute user={usuario}>
              <Menu />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Subir pregunta */}
        <Route
          path="/subir-pregunta"
          element={
            <ProtectedRoute user={usuario}>
              <SubirPregunta />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Cuestionario */}
        <Route
          path="/cuestionario"
          element={
            <ProtectedRoute user={usuario}>
              <Cuestionario />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Subir reporte */}
        <Route
          path="/subir-reporte"
          element={
            <ProtectedRoute user={usuario}>
              <SubirReporte />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto: Página no encontrada */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </Router>
  );
};

export default App;