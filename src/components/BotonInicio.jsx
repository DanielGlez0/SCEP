import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BotonInicio = ({ sx = {} }) => {
  const navigate = useNavigate();
  const [esPsicologo, setEsPsicologo] = useState(false);

  useEffect(() => {
    const verificarPsicologo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from('usuarios')
          .select('is_master')
          .eq('email', user.email)
          .single();

        setEsPsicologo(userData?.is_master || false);
      } catch (error) {
        console.error('Error al verificar rol:', error);
      }
    };

    verificarPsicologo();
  }, []);

  if (!esPsicologo) return null;

  return (
    <IconButton
      onClick={() => navigate('/menu')}
      sx={{
        bgcolor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        '&:hover': { bgcolor: '#f5f5f5' },
        ...sx,
      }}
      title="Ir al inicio"
    >
      <HomeIcon color="primary" />
    </IconButton>
  );
};

export default BotonInicio;
