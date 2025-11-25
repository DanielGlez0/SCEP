import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GoogleIcon from '@mui/icons-material/Google';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const Agenda = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [esNuevoPaciente, setEsNuevoPaciente] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [hora, setHora] = useState("");
  const [citas, setCitas] = useState([]);
  const [userId, setUserId] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState('todas');
  const [fechaBusqueda, setFechaBusqueda] = useState('');

  useEffect(() => {
    const fetchUserAndCitas = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error obteniendo el usuario:", error);
        return;
      }

      setUserId(user.id);
      fetchCitas(user.id);
      fetchPacientes();
    };

    fetchUserAndCitas();
  }, []);

  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, telefono")
      .eq("is_master", false)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error obteniendo pacientes:", error);
    } else {
      setPacientes(data || []);
    }
  };

  const fetchCitas = async (psicologo_id) => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .order("hora", { ascending: true });

    if (error) {
      console.error("Error obteniendo citas:", error);
    } else {
      setCitas(data || []);
    }
  };

  const abrirDialogo = () => {
    setDialogoAbierto(true);
    setPacienteSeleccionado(null);
    setEsNuevoPaciente(false);
    setNombreNuevo("");
    setTelefonoNuevo("");
    setHora("");
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setMensaje("");
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let nombreCita, telefonoCita;

    if (esNuevoPaciente) {
      if (!nombreNuevo || !telefonoNuevo) {
        setMensaje("Completa el nombre y teléfono del nuevo paciente.");
        setError(true);
        setTimeout(() => setMensaje(""), 3000);
        return;
      }
      nombreCita = nombreNuevo;
      telefonoCita = telefonoNuevo;
    } else {
      if (!pacienteSeleccionado) {
        setMensaje("Selecciona un paciente o marca como nuevo.");
        setError(true);
        setTimeout(() => setMensaje(""), 3000);
        return;
      }
      nombreCita = pacienteSeleccionado.nombre;
      telefonoCita = pacienteSeleccionado.telefono;
    }

    if (!hora) {
      setMensaje("Selecciona la fecha y hora de la cita.");
      setError(true);
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const { error: citaError } = await supabase.from("citas").insert([
      {
        nombre: nombreCita,
        telefono: telefonoCita,
        hora,
        psicologo_id: userId,
      },
    ]);

    if (citaError) {
      console.error("Error agendando cita:", citaError);
      setMensaje("Error al agendar la cita.");
      setError(true);
      setTimeout(() => setMensaje(""), 3000);
    } else {
      setMensaje("✓ Cita agendada correctamente");
      setError(false);
      setTimeout(() => {
        setMensaje("");
        cerrarDialogo();
      }, 2000);
      fetchCitas(userId);
    }
  };

  const marcarComoVista = async (citaId, estadoActual) => {
    const { error } = await supabase
      .from("citas")
      .update({ 
        vista: !estadoActual,
        cancelada: false  // Si se marca como vista, no puede estar cancelada
      })
      .eq("id", citaId);

    if (error) {
      console.error("Error actualizando cita:", error);
      alert("Error al actualizar la cita");
    } else {
      fetchCitas(userId);
    }
  };

  const marcarComoCancelada = async (citaId, estadoActual) => {
    const { error } = await supabase
      .from("citas")
      .update({ 
        cancelada: !estadoActual,
        vista: false  // Si se marca como cancelada, no puede estar vista
      })
      .eq("id", citaId);

    if (error) {
      console.error("Error actualizando cita:", error);
      alert("Error al actualizar la cita");
    } else {
      fetchCitas(userId);
    }
  };

  const eliminarCita = async (citaId) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar esta cita?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("citas")
      .delete()
      .eq("id", citaId);

    if (error) {
      console.error("Error eliminando cita:", error);
      alert("Error al eliminar la cita");
    } else {
      fetchCitas(userId);
    }
  };

  const agregarAGoogleCalendar = (cita) => {
    // Formatear fecha y hora para Google Calendar
    const fechaCita = new Date(cita.hora);
    const fechaFin = new Date(fechaCita.getTime() + 60 * 60 * 1000); // +1 hora
    
    // Formato: YYYYMMDDTHHmmss
    const formatearFecha = (fecha) => {
      return fecha.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const detalles = `Cita con ${cita.nombre}\nTeléfono: ${cita.telefono}`;
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cita: ' + cita.nombre)}&dates=${formatearFecha(fechaCita)}/${formatearFecha(fechaFin)}&details=${encodeURIComponent(detalles)}&location=&sf=true&output=xml`;
    
    window.open(url, '_blank');
  };

  const filtrarCitas = () => {
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
    const hoyFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
    
    // Inicio de la semana (lunes)
    const diaActual = ahora.getDay();
    const diasHastaLunes = diaActual === 0 ? 6 : diaActual - 1;
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - diasHastaLunes);
    inicioSemana.setHours(0, 0, 0, 0);
    
    // Fin de la semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    let citasFiltradas = citas;

    // Filtrar por fecha específica si se seleccionó
    if (fechaBusqueda) {
      const fechaSeleccionada = new Date(fechaBusqueda);
      const inicioFecha = new Date(fechaSeleccionada.setHours(0, 0, 0, 0));
      const finFecha = new Date(fechaSeleccionada.setHours(23, 59, 59, 999));
      
      citasFiltradas = citasFiltradas.filter(cita => {
        const fechaCita = new Date(cita.hora);
        return fechaCita >= inicioFecha && fechaCita <= finFecha;
      });
    } else {
      // Aplicar filtro predeterminado solo si no hay búsqueda por fecha
      citasFiltradas = citasFiltradas.filter(cita => {
        const fechaCita = new Date(cita.hora);
        
        switch(filtro) {
          case 'pasadas':
            return fechaCita < ahora;
          case 'hoy':
            return fechaCita >= hoyInicio && fechaCita <= hoyFin;
          case 'semana':
            return fechaCita >= inicioSemana && fechaCita <= finSemana;
          case 'futuras':
            return fechaCita > ahora;
          case 'todas':
          default:
            return true;
        }
      });
    }

    return citasFiltradas;
  };

  const citasFiltradas = filtrarCitas();

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
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={6}
          sx={{
            background: theme.fondoSecundario,
            color: 'white',
            p: 4,
            borderRadius: 3,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarMonthIcon sx={{ fontSize: 48 }} />
              <Box sx={{ ...(theme.modoOscuro && { bgcolor: 'rgba(0, 0, 0, 0.3)' }), px: 2, py: 1, borderRadius: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  Agenda de Citas
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Gestiona las citas de tus pacientes
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              {citasFiltradas.length > 0 && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    citasFiltradas.forEach(cita => agregarAGoogleCalendar(cita));
                    alert(`✓ Se abrieron ${citasFiltradas.length} ventanas para agregar las citas a Google Calendar`);
                  }}
                  sx={{
                    bgcolor: '#4285F4',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    boxShadow: 4,
                    '&:hover': {
                      bgcolor: '#357ae8',
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Exportar Todo a Google
                </Button>
              )}
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={abrirDialogo}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  boxShadow: 4,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Nueva Cita
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Filtros */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: theme.modoOscuro ? theme.colorCard : '#ffffff',
            borderRadius: 2,
            border: theme.modoOscuro ? 'none' : '3px solid #667eea',
            position: 'relative',
            zIndex: 2
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Búsqueda por fecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Buscar por fecha:
              </Typography>
              <TextField
                type="date"
                value={fechaBusqueda}
                onChange={(e) => {
                  setFechaBusqueda(e.target.value);
                  if (e.target.value) {
                    setFiltro(''); // Limpiar filtro cuando se busca por fecha
                  }
                }}
                size="small"
                sx={{ 
                  bgcolor: theme.modoOscuro ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                  borderRadius: 1,
                  minWidth: 200,
                  '& .MuiInputBase-input': {
                    color: theme.modoOscuro ? 'white' : 'inherit'
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              {fechaBusqueda && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFechaBusqueda('');
                    setFiltro('futuras');
                  }}
                  sx={{ fontWeight: 'bold' }}
                >
                  Limpiar
                </Button>
              )}
            </Box>

            <Divider />

            {/* Filtros predeterminados */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Filtrar por:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Todas (${citas.length})`}
                  onClick={() => {
                    setFiltro('todas');
                    setFechaBusqueda('');
                  }}
                  color={filtro === 'todas' && !fechaBusqueda ? 'primary' : 'default'}
                  sx={{ 
                    fontWeight: filtro === 'todas' && !fechaBusqueda ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filtro === 'todas' ? undefined : 'rgba(0,0,0,0.08)' }
                  }}
                />
                <Chip
                  label={`Pasadas (${citas.filter(c => new Date(c.hora) < new Date()).length})`}
                  onClick={() => {
                    setFiltro('pasadas');
                    setFechaBusqueda('');
                  }}
                  color={filtro === 'pasadas' && !fechaBusqueda ? 'error' : 'default'}
                  sx={{ 
                    fontWeight: filtro === 'pasadas' && !fechaBusqueda ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filtro === 'pasadas' ? undefined : 'rgba(0,0,0,0.08)' }
                  }}
                />
                <Chip
                  label={`Hoy (${citas.filter(c => {
                    const fecha = new Date(c.hora);
                    const hoy = new Date();
                    return fecha.getDate() === hoy.getDate() && 
                           fecha.getMonth() === hoy.getMonth() && 
                           fecha.getFullYear() === hoy.getFullYear();
                  }).length})`}
                  onClick={() => {
                    setFiltro('hoy');
                    setFechaBusqueda('');
                  }}
                  color={filtro === 'hoy' && !fechaBusqueda ? 'success' : 'default'}
                  sx={{ 
                    fontWeight: filtro === 'hoy' && !fechaBusqueda ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filtro === 'hoy' ? undefined : 'rgba(0,0,0,0.08)' }
                  }}
                />
                <Chip
                  label={`Esta Semana (${citas.filter(c => {
                    const fecha = new Date(c.hora);
                    const ahora = new Date();
                    const diaActual = ahora.getDay();
                    const diasHastaLunes = diaActual === 0 ? 6 : diaActual - 1;
                    const inicioSemana = new Date(ahora);
                    inicioSemana.setDate(ahora.getDate() - diasHastaLunes);
                    inicioSemana.setHours(0, 0, 0, 0);
                    const finSemana = new Date(inicioSemana);
                    finSemana.setDate(inicioSemana.getDate() + 6);
                    finSemana.setHours(23, 59, 59, 999);
                    return fecha >= inicioSemana && fecha <= finSemana;
                  }).length})`}
                  onClick={() => {
                    setFiltro('semana');
                    setFechaBusqueda('');
                  }}
                  color={filtro === 'semana' && !fechaBusqueda ? 'info' : 'default'}
                  sx={{ 
                    fontWeight: filtro === 'semana' && !fechaBusqueda ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filtro === 'semana' ? undefined : 'rgba(0,0,0,0.08)' }
                  }}
                />
                <Chip
                  label={`Futuras (${citas.filter(c => new Date(c.hora) > new Date()).length})`}
                  onClick={() => {
                    setFiltro('futuras');
                    setFechaBusqueda('');
                  }}
                  color={filtro === 'futuras' && !fechaBusqueda ? 'secondary' : 'default'}
                  sx={{ 
                    fontWeight: filtro === 'futuras' && !fechaBusqueda ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filtro === 'futuras' ? undefined : 'rgba(0,0,0,0.08)' }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Lista de citas */}
        {citasFiltradas.length === 0 ? (
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: theme.colorCard,
              borderRadius: 3
            }}
          >
            <EventIcon sx={{ fontSize: 80, color: '#667eea', opacity: 0.5, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              {fechaBusqueda 
                ? `No hay citas para ${new Date(fechaBusqueda + 'T00:00:00').toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}`
                : filtro === 'todas' ? 'No hay citas agendadas' : `No hay citas ${
                    filtro === 'pasadas' ? 'pasadas' :
                    filtro === 'hoy' ? 'para hoy' :
                    filtro === 'semana' ? 'esta semana' :
                    'futuras'
                  }`
              }
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {fechaBusqueda
                ? 'Intenta buscar otra fecha o limpia el filtro para ver todas las citas'
                : filtro === 'todas' 
                  ? 'Comienza agendando la primera cita con un paciente'
                  : 'Prueba cambiando el filtro para ver otras citas'
              }
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={abrirDialogo}
              sx={{
                borderWidth: 2,
                borderColor: '#667eea',
                color: '#667eea',
                fontWeight: 'bold',
                px: 4,
                py: 1,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: '#667eea',
                  color: 'white'
                }
              }}
            >
              Agendar Primera Cita
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {citasFiltradas.map((cita) => (
              <Box key={cita.id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                <Card
                  elevation={4}
                  sx={{
                    bgcolor: theme.colorCard,
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={new Date(cita.hora).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                          sx={{
                            bgcolor: 'rgba(102, 126, 234, 0.15)',
                            color: '#667eea',
                            fontWeight: 'bold'
                          }}
                        />
                        {cita.vista && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Vista"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(76, 175, 80, 0.15)',
                              color: '#4caf50',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        {cita.cancelada && (
                          <Chip
                            icon={<CancelIcon />}
                            label="Cancelada"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(244, 67, 54, 0.15)',
                              color: '#f44336',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => marcarComoVista(cita.id, cita.vista)}
                          sx={{
                            color: cita.vista ? '#4caf50' : '#9e9e9e',
                            bgcolor: cita.vista ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                            '&:hover': {
                              bgcolor: cita.vista ? 'rgba(76, 175, 80, 0.2)' : 'rgba(158, 158, 158, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => marcarComoCancelada(cita.id, cita.cancelada)}
                          sx={{
                            color: cita.cancelada ? '#f44336' : '#9e9e9e',
                            bgcolor: cita.cancelada ? 'rgba(244, 67, 54, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                            '&:hover': {
                              bgcolor: cita.cancelada ? 'rgba(244, 67, 54, 0.2)' : 'rgba(158, 158, 158, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => agregarAGoogleCalendar(cita)}
                          sx={{
                            color: '#4285F4',
                            bgcolor: 'rgba(66, 133, 244, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(66, 133, 244, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <GoogleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => eliminarCita(cita.id)}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: '#667eea' }} />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {cita.nombre}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        {cita.telefono}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        {new Date(cita.hora).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<GoogleIcon />}
                      onClick={() => agregarAGoogleCalendar(cita)}
                      sx={{
                        borderColor: '#4285F4',
                        color: '#4285F4',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#4285F4',
                          bgcolor: 'rgba(66, 133, 244, 0.1)'
                        }
                      }}
                    >
                      Agregar a Google Calendar
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Diálogo Nueva Cita */}
        <Dialog
          open={dialogoAbierto}
          onClose={cerrarDialogo}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 10
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Agendar Nueva Cita
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Selecciona un paciente o registra uno nuevo
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ mt: 3 }}>
            {mensaje && (
              <Alert severity={error ? "error" : "success"} sx={{ mb: 3 }}>
                {mensaje}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Selector de paciente */}
              {!esNuevoPaciente && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: '#667eea' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Buscar Paciente
                    </Typography>
                  </Box>
                  <Autocomplete
                    options={pacientes}
                    getOptionLabel={(option) => `${option.nombre} - ${option.telefono}`}
                    value={pacienteSeleccionado}
                    onChange={(event, newValue) => {
                      setPacienteSeleccionado(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Buscar por nombre o teléfono..."
                        variant="outlined"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {option.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tel: {option.telefono}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    noOptionsText="No se encontraron pacientes"
                  />
                </Box>
              )}

              {/* Nuevo paciente */}
              {esNuevoPaciente && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Nombre del Paciente"
                      value={nombreNuevo}
                      onChange={(e) => setNombreNuevo(e.target.value)}
                      placeholder="Nombre completo"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={telefonoNuevo}
                      onChange={(e) => setTelefonoNuevo(e.target.value)}
                      placeholder="Número de contacto"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Botón toggle */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Button
                  variant="text"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setEsNuevoPaciente(!esNuevoPaciente)}
                  sx={{
                    color: '#667eea',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  {esNuevoPaciente ? 'Seleccionar paciente existente' : '¿Paciente nuevo?'}
                </Button>
              </Box>

              {/* Fecha y hora */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTimeIcon sx={{ color: '#667eea' }} />
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Fecha y Hora
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="datetime-local"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
            <Button
              onClick={cerrarDialogo}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)'
                }
              }}
            >
              Agendar Cita
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Agenda;
