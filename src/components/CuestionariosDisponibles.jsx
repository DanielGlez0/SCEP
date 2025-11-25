import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Container,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import fondoMenu from '../assets/fondo-menu.png';

const CuestionariosDisponibles = () => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  const cargarCuestionarios = async () => {
    try {
      setCargando(true);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se pudo obtener el usuario');

      // Obtener el ID del usuario en la tabla usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (usuarioError) {
        console.error('Error al obtener usuario:', usuarioError);
        throw usuarioError;
      }
      
      if (!usuarioData) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      // Obtener cuestionarios asignados
      const { data: asignaciones, error: errorAsignaciones } = await supabase
        .from('cuestionarios_asignados')
        .select('id, cuestionario_id, completado, puntaje_total, fecha_completado, fecha_asignacion')
        .eq('paciente_id', usuarioData.id)
        .order('fecha_asignacion', { ascending: false });

      if (errorAsignaciones) throw errorAsignaciones;

      // Filtrar para mostrar solo la asignación más reciente de cada cuestionario
      // Si hay un pendiente, mostrar solo ese; si todos están completados, mostrar el más reciente
      const cuestionariosUnicos = new Map();
      
      (asignaciones || []).forEach(asignacion => {
        const cuestionarioId = asignacion.cuestionario_id;
        const actual = cuestionariosUnicos.get(cuestionarioId);
        
        // Si no hay ninguna asignación de este cuestionario, agregarla
        if (!actual) {
          cuestionariosUnicos.set(cuestionarioId, asignacion);
        } else {
          // Si la actual es pendiente, mantenerla
          // Si la nueva es pendiente y la actual está completada, reemplazar
          if (!actual.completado) {
            // Ya tenemos una pendiente, no hacer nada
          } else if (!asignacion.completado) {
            // La nueva es pendiente y la actual está completada, reemplazar
            cuestionariosUnicos.set(cuestionarioId, asignacion);
          }
          // Si ambas están completadas, mantener la más reciente (que ya está por el order)
        }
      });

      // Obtener los IDs únicos de cuestionarios
      const cuestionarioIds = Array.from(cuestionariosUnicos.keys());

      if (cuestionarioIds.length === 0) {
        setCuestionarios([]);
        return;
      }

      // Obtener información de los cuestionarios
      const { data: cuestionariosData, error: errorCuestionarios } = await supabase
        .from('cuestionarios')
        .select('id, Titulo, Descripcion')
        .in('id', cuestionarioIds);

      if (errorCuestionarios) throw errorCuestionarios;

      // Combinar datos de asignaciones con información de cuestionarios
      const cuestionariosConEstado = Array.from(cuestionariosUnicos.values()).map(asignacion => {
        const cuestionario = cuestionariosData.find(c => c.id === asignacion.cuestionario_id);
        return {
          ...cuestionario,
          asignacion_id: asignacion.id,
          completado: asignacion.completado,
          puntaje_total: asignacion.puntaje_total,
          fecha_completado: asignacion.fecha_completado
        };
      });

      setCuestionarios(cuestionariosConEstado);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
      setError('No se pudieron cargar los cuestionarios');
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarCuestionario = (cuestionario) => {
    // Pasar el ID de la asignación en lugar del ID del cuestionario
    navigate(`/responder-cuestionario/${cuestionario.asignacion_id}`);
  };

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    } else {
      navigate('/login');
    }
  };

  if (cargando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${fondoMenu})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Cuestionarios Disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Selecciona un cuestionario para responder
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={cerrarSesion}
            sx={{
              fontWeight: 'bold',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'error.main',
                color: 'white'
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {cuestionarios.length === 0 ? (
          <Box
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No tienes cuestionarios asignados en este momento
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cuestionarios.map((cuestionario) => (
              <Grid item xs={12} sm={6} md={4} key={cuestionario.asignacion_id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    border: cuestionario.completado ? '2px solid #4caf50' : '2px solid #ff9800',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSeleccionarCuestionario(cuestionario)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon
                          sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                        />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {cuestionario.Titulo}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {cuestionario.Descripcion || 'Sin descripción'}
                      </Typography>
                      {cuestionario.completado ? (
                        <Box
                          sx={{
                            bgcolor: '#e8f5e9',
                            color: '#2e7d32',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          ✓ Completado
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            bgcolor: '#fff3e0',
                            color: '#e65100',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          Pendiente
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CuestionariosDisponibles;
