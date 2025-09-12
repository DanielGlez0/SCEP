import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const ProtectedRoute = ({ children, redirectTo = '/login', requireMaster = false }) => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('Sesión no encontrada o error al obtenerla:', error?.message);
          navigate(redirectTo);
          return;
        }

        const email = session.user.email;

        if (requireMaster) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('is_master')
            .eq('email', email)
            .single();

          if (userError) {
            console.error('Error al consultar la base de datos:', userError.message);
            navigate(redirectTo);
            return;
          }

          if (!userData.is_master) {
            console.warn('Acceso denegado: el usuario no tiene permisos master');
            navigate('/cuestionario');
            return;
          }
        }

        setAutorizado(true);
      } catch (err) {
        console.error('Error inesperado:', err);
        navigate(redirectTo);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, [navigate, redirectTo, requireMaster]);

  if (cargando) {
    return <div className="p-4">Cargando... Verificando acceso</div>;
  }

  return autorizado ? children : null;
};

export default ProtectedRoute;
