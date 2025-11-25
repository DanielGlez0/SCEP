import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const PerfilPsicologo = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [pacientesRegistrados, setPacientesRegistrados] = useState(0);
  const [horasVistas, setHorasVistas] = useState(0);
  const [horasPlanificadas, setHorasPlanificadas] = useState(0);
  const [horasCanceladas, setHorasCanceladas] = useState(0);
  const [vistaPromedio, setVistaPromedio] = useState('semanal'); // 'semanal' o 'mensual'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (citas.length > 0) {
      calcularEstadisticas();
      generarDatosGrafica();
    }
  }, [citas, vistaPromedio, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error obteniendo usuario:', userError);
      return;
    }

    setUserId(user.id);

    // Obtener el ID del usuario en la tabla usuarios usando su email
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Error obteniendo datos del usuario:', usuarioError);
      return;
    }

    const usuarioId = usuarioData.id;

    // Cargar pacientes registrados
    const { data: pacientes, error: pacientesError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'Paciente')
      .eq('activo', true);

    if (!pacientesError) {
      setPacientesRegistrados(pacientes?.length || 0);
    }

    // Cargar todas las citas del psicólogo usando el ID de la tabla usuarios
    const { data: citasData, error: citasError } = await supabase
      .from('citas')
      .select('*')
      .eq('psicologo_id', usuarioId)
      .order('hora', { ascending: true });

    if (!citasError) {
      setCitas(citasData || []);
    }
  };

  const calcularEstadisticas = () => {
    const ahora = new Date();
    
    // Filtrar por rango de fechas si están definidas
    let citasFiltradas = citas;
    if (fechaInicio && fechaFin) {
      citasFiltradas = citas.filter(cita => {
        const fechaCita = new Date(cita.hora);
        return fechaCita >= new Date(fechaInicio) && fechaCita <= new Date(fechaFin);
      });
    }

    // Horas vistas (asumiendo 1 hora por sesión)
    const vistas = citasFiltradas.filter(c => c.vista).length;
    setHorasVistas(vistas);

    // Horas planificadas (todas las citas)
    setHorasPlanificadas(citasFiltradas.length);

    // Horas canceladas
    const canceladas = citasFiltradas.filter(c => c.cancelada).length;
    setHorasCanceladas(canceladas);
  };

  const generarDatosGrafica = () => {
    const ahora = new Date();
    let citasFiltradas = citas;

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
      citasFiltradas = citas.filter(cita => {
        const fechaCita = new Date(cita.hora);
        return fechaCita >= new Date(fechaInicio) && fechaCita <= new Date(fechaFin);
      });
    }

    if (vistaPromedio === 'semanal') {
      // Agrupar por semanas (últimas 8 semanas o rango personalizado)
      const semanas = {};
      
      citasFiltradas.forEach(cita => {
        const fechaCita = new Date(cita.hora);
        const inicioSemana = new Date(fechaCita);
        const dia = inicioSemana.getDay();
        const diff = inicioSemana.getDate() - dia + (dia === 0 ? -6 : 1);
        inicioSemana.setDate(diff);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const claveSemana = inicioSemana.toISOString().split('T')[0];
        
        if (!semanas[claveSemana]) {
          semanas[claveSemana] = {
            fecha: inicioSemana,
            vistas: 0,
            canceladas: 0
          };
        }
        
        if (cita.vista) {
          semanas[claveSemana].vistas += 1;
        }
        if (cita.cancelada) {
          semanas[claveSemana].canceladas += 1;
        }
      });

      const datos = Object.entries(semanas)
        .sort((a, b) => a[1].fecha - b[1].fecha)
        .slice(-8)
        .map(([_, data]) => ({
          label: data.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          vistas: data.vistas,
          canceladas: data.canceladas
        }));

      setDatosGrafica(datos);
    } else {
      // Agrupar por meses
      const meses = {};
      
      citasFiltradas.forEach(cita => {
        const fechaCita = new Date(cita.hora);
        const claveMes = `${fechaCita.getFullYear()}-${fechaCita.getMonth() + 1}`;
        
        if (!meses[claveMes]) {
          meses[claveMes] = {
            fecha: new Date(fechaCita.getFullYear(), fechaCita.getMonth(), 1),
            vistas: 0,
            canceladas: 0
          };
        }
        
        if (cita.vista) {
          meses[claveMes].vistas += 1;
        }
        if (cita.cancelada) {
          meses[claveMes].canceladas += 1;
        }
      });

      const datos = Object.entries(meses)
        .sort((a, b) => a[1].fecha - b[1].fecha)
        .slice(-6)
        .map(([_, data]) => ({
          label: data.fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          vistas: data.vistas,
          canceladas: data.canceladas
        }));

      setDatosGrafica(datos);
    }
  };

  const calcularPromedio = () => {
    if (datosGrafica.length === 0) return 0;
    const total = datosGrafica.reduce((sum, item) => sum + item.vistas, 0);
    return (total / datosGrafica.length).toFixed(1);
  };

  const maxHoras = datosGrafica.length > 0 ? Math.max(...datosGrafica.map(d => Math.max(d.vistas, d.canceladas))) : 1;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        ...theme.fondo,
        py: 4,
        position: 'relative',
      }}
    >
      {theme.overlay && <Box sx={theme.overlay} />}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Header con información del psicólogo */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: theme.fondoSecundario,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton
              onClick={() => navigate('/menu')}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
              title="Ir al menú principal"
            >
              <HomeIcon color="primary" />
            </IconButton>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: 3
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ ...(theme.modoOscuro && { bgcolor: 'rgba(0, 0, 0, 0.3)' }), px: 2, py: 1, borderRadius: 1, display: 'inline-block', mb: 1 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>
                  Dr. Juan Pérez
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Psicólogo Clínico • Especialista en Terapia Cognitivo-Conductual
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Cédula Profesional: 1234567 • 10 años de experiencia
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tarjetas de estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Pacientes Registrados */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: theme.colorCard,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#4caf50',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <PeopleIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Pacientes
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#4caf50">
                  {pacientesRegistrados}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Registrados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Horas Vistas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: theme.colorCard,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#2196f3',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sesiones Vistas
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#2196f3">
                  {horasVistas}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Horas Planificadas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: theme.colorCard,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#ff9800',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <EventIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Citas Totales
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#ff9800">
                  {horasPlanificadas}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Planificadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Horas Canceladas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                bgcolor: theme.colorCard,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#f44336',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <CancelIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Canceladas
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#f44336">
                  {horasCanceladas}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sesiones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Promedio */}
        <Card
          sx={{
            bgcolor: theme.colorCard,
            backdropFilter: 'blur(10px)',
            p: 3,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Promedio de Sesiones
            </Typography>
            <ToggleButtonGroup
              value={vistaPromedio}
              exclusive
              onChange={(e, newValue) => newValue && setVistaPromedio(newValue)}
              size="small"
            >
              <ToggleButton value="semanal">
                Semanal
              </ToggleButton>
              <ToggleButton value="mensual">
                Mensual
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h1" fontWeight="bold" color="primary">
              {calcularPromedio()}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              horas por {vistaPromedio === 'semanal' ? 'semana' : 'mes'}
            </Typography>
          </Box>
        </Card>

        {/* Filtros de fecha y gráfica */}
        <Card
          sx={{
            bgcolor: theme.colorCard,
            backdropFilter: 'blur(10px)',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Horas Trabajadas {vistaPromedio === 'semanal' ? 'por Semana' : 'por Mes'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <CalendarMonthIcon sx={{ color: 'primary.main' }} />
              <TextField
                label="Desde"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
              <TextField
                label="Hasta"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
              {(fechaInicio || fechaFin) && (
                <Chip
                  label="Limpiar filtros"
                  onDelete={() => {
                    setFechaInicio('');
                    setFechaFin('');
                  }}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          {datosGrafica.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AccessTimeIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hay datos para mostrar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ajusta el rango de fechas o espera a tener sesiones completadas
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              {/* Gráfica de columnas */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-around',
                  height: 300,
                  borderBottom: '2px solid #e0e0e0',
                  borderLeft: '2px solid #e0e0e0',
                  px: 2,
                  py: 2,
                  position: 'relative'
                }}
              >
                {/* Líneas de referencia horizontales */}
                {[...Array(5)].map((_, i) => {
                  const valor = Math.round((maxHoras / 4) * (4 - i));
                  return (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(i * 25)}%`,
                        borderTop: '1px dashed #e0e0e0',
                        '&::before': {
                          content: `"${valor}"`,
                          position: 'absolute',
                          left: -30,
                          top: -10,
                          fontSize: '0.75rem',
                          color: 'text.secondary'
                        }
                      }}
                    />
                  );
                })}

                {datosGrafica.map((item, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      maxWidth: 120,
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {/* Columnas lado a lado */}
                    <Box sx={{ display: 'flex', gap: 0.5, width: '90%', alignItems: 'flex-end' }}>
                      {/* Columna Vistas */}
                      <Box
                        sx={{
                          width: '50%',
                          height: `${(item.vistas / maxHoras) * 100}%`,
                          minHeight: item.vistas > 0 ? '20px' : '0px',
                          background: 'linear-gradient(180deg, #2196f3 0%, #1976d2 100%)',
                          borderRadius: '8px 8px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scaleY(1.05)',
                            boxShadow: 3
                          }
                        }}
                      >
                        {/* Valor encima de la columna */}
                        {item.vistas > 0 && (
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              color: '#2196f3',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem'
                            }}
                          >
                            {item.vistas}
                          </Typography>
                        )}
                      </Box>

                      {/* Columna Canceladas */}
                      <Box
                        sx={{
                          width: '50%',
                          height: `${(item.canceladas / maxHoras) * 100}%`,
                          minHeight: item.canceladas > 0 ? '20px' : '0px',
                          background: 'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)',
                          borderRadius: '8px 8px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scaleY(1.05)',
                            boxShadow: 3
                          }
                        }}
                      >
                        {/* Valor encima de la columna */}
                        {item.canceladas > 0 && (
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              color: '#f44336',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem'
                            }}
                          >
                            {item.canceladas}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Etiqueta */}
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'center',
                        width: '100%',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Leyenda */}
          {datosGrafica.length > 0 && (
            <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 20,
                    height: 12,
                    borderRadius: 1,
                    background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                    mr: 1
                  }}
                />
                <Typography variant="body2">Sesiones Vistas</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 20,
                    height: 12,
                    borderRadius: 1,
                    background: 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                    mr: 1
                  }}
                />
                <Typography variant="body2">Sesiones Canceladas</Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default PerfilPsicologo;

