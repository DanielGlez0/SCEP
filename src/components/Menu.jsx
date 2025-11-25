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
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { supabase } from '../supabaseClient';
import { useTheme } from '../ThemeContext';
import fondoMenu from '../assets/fondo-menu.png';

const Menu = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
    { label: 'Subir Reporte', path: '/subir-reporte', icon: AssignmentIcon },
  ];

  const [psicologoInfo, setPsicologoInfo] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [cuestionarios, setCuestionarios] = useState([]);
  const [reportes, setReportes] = useState([]);

  const handleMenuClick = (item) => {
    setPanelAbierto(item);
    
    // Cargar datos según el módulo seleccionado
    switch (item.path) {
      case '/datos-paciente':
        cargarConsultas();
        break;
      case '/perfil':
        cargarInfoPsicologo();
        break;
      case '/agenda':
        cargarCitasHoy();
        break;
      case '/gestion-cuestionarios':
        cargarCuestionarios();
        break;
      case '/subir-reporte':
        cargarReportes();
        break;
      default:
        break;
    }
  };

  const cargarConsultas = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('citas')
        .select('nombre, telefono, hora, vista, cancelada')
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

  const cargarInfoPsicologo = async () => {
    setCargando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No hay usuario autenticado');
        return;
      }

      console.log('Usuario autenticado:', user.email);

      // Obtener datos del usuario por email
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, nombre, email, telefono, edad')
        .eq('email', user.email)
        .maybeSingle();

      console.log('Datos del usuario:', userData, 'Error:', userError);

      if (!userError && userData) {
        // Obtener estadísticas
        const { data: pacientes } = await supabase
          .from('usuarios')
          .select('id')
          .eq('rol', 'Paciente')
          .eq('activo', true);

        const { data: citas } = await supabase
          .from('citas')
          .select('id, vista, cancelada');

        const citasVistas = citas?.filter(c => c.vista).length || 0;
        const citasCanceladas = citas?.filter(c => c.cancelada).length || 0;

        const info = {
          nombre: userData?.nombre || 'Psicólogo',
          email: userData?.email || user.email,
          pacientes: pacientes?.length || 0,
          totalCitas: citas?.length || 0,
          citasVistas,
          citasCanceladas
        };

        console.log('Info del psicólogo cargada:', info);
        setPsicologoInfo(info);
      } else {
        console.error('No se encontró usuario en la tabla usuarios');
      }
    } catch (err) {
      console.error('Error cargando info psicólogo:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarCitasHoy = async () => {
    setCargando(true);
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const { data, error } = await supabase
        .from('citas')
        .select('nombre, telefono, hora, vista, cancelada')
        .gte('hora', hoy.toISOString())
        .lt('hora', manana.toISOString())
        .order('hora', { ascending: true });

      if (error) {
        console.error('Error cargando citas de hoy:', error);
        setCitasHoy([]);
      } else {
        setCitasHoy(data || []);
      }
    } catch (err) {
      console.error('Error inesperado cargando citas de hoy:', err);
      setCitasHoy([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarCuestionarios = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('cuestionarios')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error en Supabase al cargar cuestionarios:', error);
      } else {
        setCuestionarios(data || []);
      }
    } catch (err) {
      console.error('Error cargando cuestionarios:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      // Cargar reportes
      const { data: reportesData, error: reportesError } = await supabase
        .from('reportes')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(8);

      if (reportesError) {
        console.error('Error en Supabase al cargar reportes:', reportesError);
        return;
      }

      // Cargar nombres de pacientes para cada reporte
      if (reportesData && reportesData.length > 0) {
        const pacientesIds = [...new Set(reportesData.map(r => r.paciente_id))];
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .in('id', pacientesIds);

        if (!pacientesError && pacientesData) {
          // Combinar reportes con nombres de pacientes
          const reportesConNombres = reportesData.map(reporte => ({
            ...reporte,
            paciente_nombre: pacientesData.find(p => p.id === reporte.paciente_id)?.nombre || 'Desconocido'
          }));
          setReportes(reportesConNombres);
        } else {
          setReportes(reportesData);
        }
      } else {
        setReportes([]);
      }
    } catch (err) {
      console.error('Error cargando reportes:', err);
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
        ...theme.fondo,
        minHeight: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {theme.overlay && <Box sx={theme.overlay} />}

      {/* Barra lateral izquierda mejorada */}
      <Box
        sx={{
          width: contraida ? 80 : 300,
          backgroundColor: theme.colorPaper,
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
            p: contraida ? 1.5 : 3,
            background: theme.fondoSecundario,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: contraida ? 'center' : 'space-between',
            flexDirection: contraida ? 'column' : 'row',
            gap: contraida ? 1 : 2,
            transition: 'all 0.3s ease',
          }}
        >
          {!contraida ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MenuIcon sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Menú Principal
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={theme.toggleModoOscuro}
                  sx={{
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  title={theme.modoOscuro ? 'Modo claro' : 'Modo oscuro'}
                >
                  {theme.modoOscuro ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
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
                      transform: 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <IconButton
                onClick={theme.toggleModoOscuro}
                size="small"
                sx={{
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                title={theme.modoOscuro ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme.modoOscuro ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
              <IconButton
                onClick={() => setContraida(false)}
                size="small"
                sx={{
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                title="Expandir menú"
              >
                <ChevronLeftIcon
                  fontSize="small"
                  sx={{
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </IconButton>
            </>
          )}
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
          backgroundColor: theme.colorPaper,
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
                background: theme.fondoSecundario,
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
              {/* Panel de Pacientes */}
              {panelAbierto.path === '/datos-paciente' && (
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
                        <ListItem key={index} disablePadding sx={{ mb: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <ListItemText
                            primary={consulta.nombre}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {`Tel: ${consulta.telefono}`}
                                </Typography>
                                <br />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(consulta.hora).toLocaleString('es-ES')}
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
              )}

              {/* Panel de Perfil */}
              {panelAbierto.path === '/perfil' && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Información General
                  </Typography>
                  
                  {cargando ? (
                    <>
                      <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                    </>
                  ) : psicologoInfo ? (
                    <>
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Nombre
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {psicologoInfo.nombre}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {psicologoInfo.email}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                        Estadísticas
                      </Typography>

                      <Box sx={{ mb: 1.5, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Pacientes Activos
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {psicologoInfo.pacientes}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5, p: 2, bgcolor: '#e8f5e9', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Sesiones Vistas
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {psicologoInfo.citasVistas}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5, p: 2, bgcolor: '#ffebee', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Sesiones Canceladas
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          {psicologoInfo.citasCanceladas}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total de Citas
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {psicologoInfo.totalCitas}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No se pudo cargar la información del perfil.
                    </Typography>
                  )}
                </>
              )}

              {/* Panel de Agenda */}
              {panelAbierto.path === '/agenda' && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Citas de Hoy
                  </Typography>
                  
                  {cargando ? (
                    <>
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                    </>
                  ) : citasHoy.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {citasHoy.map((cita, index) => (
                        <ListItem 
                          key={index} 
                          disablePadding 
                          sx={{ 
                            mb: 1.5, 
                            p: 1.5, 
                            bgcolor: cita.vista ? '#e8f5e9' : cita.cancelada ? '#ffebee' : '#e3f2fd', 
                            borderRadius: 1,
                            borderLeft: `4px solid ${cita.vista ? '#4caf50' : cita.cancelada ? '#f44336' : '#2196f3'}`
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="bold">
                                  {cita.nombre}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="primary">
                                  {new Date(cita.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {cita.telefono}
                                </Typography>
                                <br />
                                {cita.vista && (
                                  <Typography component="span" variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                    ✓ Vista
                                  </Typography>
                                )}
                                {cita.cancelada && (
                                  <Typography component="span" variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                    ✗ Cancelada
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No hay citas programadas para hoy.
                    </Typography>
                  )}
                </>
              )}

              {/* Panel de Cuestionarios */}
              {panelAbierto.path === '/gestion-cuestionarios' && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Cuestionarios Disponibles
                  </Typography>
                  
                  {cargando ? (
                    <>
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                    </>
                  ) : cuestionarios.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {cuestionarios.map((cuestionario, index) => (
                        <ListItem 
                          key={index} 
                          disablePadding 
                          sx={{ mb: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="bold">
                                {cuestionario.Titulo}
                              </Typography>
                            }
                            secondary={
                              cuestionario.Descripcion && (
                                <Typography variant="caption" color="text.secondary">
                                  {cuestionario.Descripcion}
                                </Typography>
                              )
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No hay cuestionarios disponibles.
                    </Typography>
                  )}
                </>
              )}

              {/* Panel de Reportes */}
              {panelAbierto.path === '/subir-reporte' && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Últimos Reportes
                  </Typography>
                  
                  {cargando ? (
                    <>
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                    </>
                  ) : reportes.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {reportes.map((reporte, index) => (
                        <ListItem 
                          key={index} 
                          disablePadding 
                          sx={{ mb: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="bold">
                                {reporte.titulo}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 'bold', display: 'block' }}>
                                  Paciente: {reporte.paciente_nombre || 'Desconocido'}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(reporte.creado_en).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No hay reportes registrados.
                    </Typography>
                  )}
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

