import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, Divider, IconButton, List, ListItem, ListItemText, Skeleton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuizIcon from '@mui/icons-material/Quiz';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { supabase } from '../supabaseClient';
import fondoMenu from '../assets/fondo-menu.png';

const Menu = () => {
  const navigate = useNavigate();
  const [contraida, setContraida] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(false);

  const buttonStyle = {
    py: 2.5,
    px: 3,
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 2,
    bgcolor: 'transparent',
    color: '#1976d2',
    border: 'none',
    justifyContent: 'flex-start',
    gap: 2,
    transition: 'all 0.3s ease',
    textTransform: 'none',
    '&:hover': {
      bgcolor: 'rgba(25, 118, 210, 0.1)',
      paddingLeft: 4,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  };

  const menuItems = [
    { label: 'Pacientes', path: '/datos-paciente', icon: PeopleAltIcon },
    { label: 'Perfil', path: '/perfil', icon: PersonIcon },
    { label: 'Agenda', path: '/agenda', icon: CalendarMonthIcon },
    { label: 'Cuestionarios', path: '/gestion-cuestionarios', icon: QuizIcon },
    { label: 'Subir Pregunta', path: '/subir-pregunta', icon: AddCircleIcon },
    { label: 'Subir Reporte', path: '/subir-reporte', icon: AssignmentIcon },
  ];

  const handleMenuClick = (item) => {
    setPanelAbierto(item);
    
    // Si es el módulo de Pacientes, cargar las consultas
    if (item.path === '/datos-paciente') {
      cargarConsultas();
    }
  };

  const cargarConsultas = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .order('hora', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error al cargar consultas:', error);
        setConsultas([]);
      } else {
        setConsultas(data || []);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setConsultas([]);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarPanel = () => {
    setPanelAbierto(null);
  };

  const handleNavigate = () => {
    if (panelAbierto) {
      navigate(panelAbierto.path);
      handleCerrarPanel();
    }
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${fondoMenu})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Overlay oscuro */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0,
        }}
      />

      {/* Barra lateral izquierda mejorada */}
      <Box
        sx={{
          width: contraida ? 80 : 300,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          p: 0,
          position: 'relative',
          zIndex: 2,
          overflowY: 'auto',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          flexShrink: 0,
        }}
      >
        {/* Header de la barra lateral */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'all 0.3s ease',
          }}
        >
          {!contraida && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MenuIcon sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Menú Principal
                </Typography>
              </Box>
            </>
          )}
          <IconButton
            onClick={() => setContraida(!contraida)}
            sx={{
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ChevronLeftIcon
              sx={{
                transform: contraida ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            />
          </IconButton>
        </Box>

        {!contraida && <Divider />}

        {/* Botones del menú */}
        <Stack spacing={0.5} sx={{ p: contraida ? 1 : 2, flex: 1 }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.path}
                fullWidth
                startIcon={<IconComponent sx={{ fontSize: 22 }} />}
                sx={{
                  ...buttonStyle,
                  px: contraida ? 1 : 3,
                  justifyContent: contraida ? 'center' : 'flex-start',
                  title: contraida ? item.label : '',
                  bgcolor: panelAbierto?.path === item.path ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
                }}
                onClick={() => handleMenuClick(item)}
              >
                {!contraida && item.label}
              </Button>
            );
          })}
        </Stack>

        {/* Botón Cerrar Sesión */}
        <Box sx={{ p: contraida ? 1 : 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 22 }} />}
            onClick={handleCerrarSesion}
            sx={{
              py: 2.5,
              px: 3,
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 2,
              bgcolor: '#ff4444',
              color: 'white',
              border: 'none',
              justifyContent: contraida ? 'center' : 'flex-start',
              gap: 2,
              transition: 'all 0.3s ease',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#cc0000',
                paddingLeft: contraida ? 3 : 4,
                boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
              },
            }}
          >
            {!contraida && 'Cerrar Sesión'}
          </Button>
        </Box>

        {/* Footer de la barra lateral */}
        {!contraida && (
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © 2025 Psicología WEB
            </Typography>
          </Box>
        )}
      </Box>

      {/* Panel derecho deslizante */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: panelAbierto ? 400 : 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header del panel */}
        {panelAbierto && (
          <>
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {panelAbierto.label}
              </Typography>
              <IconButton
                onClick={handleCerrarPanel}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider />

            {/* Contenido del panel */}
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
              {panelAbierto.path === '/datos-paciente' ? (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Últimas Consultas
                  </Typography>
                  
                  {cargando ? (
                    <>
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                    </>
                  ) : consultas.length > 0 ? (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                      {consultas.map((consulta, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={consulta.nombre}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {`Tel: ${consulta.telefono}`}
                                </Typography>
                                <br />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(consulta.hora).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No hay consultas registradas.
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Contenido de: <strong>{panelAbierto.label}</strong>
                  </Typography>
                  
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Aquí irá el contenido específico del módulo de {panelAbierto.label.toLowerCase()}.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Botones del panel */}
            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleNavigate}
                sx={{ mb: 2 }}
              >
                Ir a {panelAbierto.label}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleCerrarPanel}
              >
                Cerrar
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default Menu;

