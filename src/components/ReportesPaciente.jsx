import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BotonInicio from './BotonInicio';
import fondoMenu from '../assets/fondo-menu.png';

const ReportesPaciente = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const paciente = location.state?.paciente;

  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [reporteActual, setReporteActual] = useState({ id: null, titulo: '', descripcion: '' });
  const [reporteEliminar, setReporteEliminar] = useState(null);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    cargarReportes();
  }, [id]);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .eq('paciente_id', id);

      if (error) {
        console.error('Error detallado:', error);
        throw error;
      }
      
      console.log('Reportes cargados:', data);
      setReportes(data || []);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('No se pudieron cargar los reportes: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirDialogoCrear = () => {
    setModoEdicion(false);
    setReporteActual({ id: null, titulo: '', descripcion: '' });
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (reporte) => {
    setModoEdicion(true);
    setReporteActual({
      id: reporte.id,
      titulo: reporte.titulo,
      descripcion: reporte.descripcion
    });
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setReporteActual({ id: null, titulo: '', descripcion: '' });
  };

  const guardarReporte = async () => {
    if (!reporteActual.titulo.trim() || !reporteActual.descripcion.trim()) {
      setError('Por favor completa todos los campos');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      if (modoEdicion) {
        const { error } = await supabase
          .from('reportes')
          .update({
            titulo: reporteActual.titulo,
            descripcion: reporteActual.descripcion
          })
          .eq('id', reporteActual.id);

        if (error) throw error;
        setExito('Reporte actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('reportes')
          .insert({
            titulo: reporteActual.titulo,
            descripcion: reporteActual.descripcion,
            paciente_id: id
          });

        if (error) throw error;
        setExito('Reporte creado correctamente');
      }

      setTimeout(() => setExito(null), 3000);
      cerrarDialogo();
      cargarReportes();
    } catch (err) {
      console.error('Error al guardar reporte:', err);
      setError('Error al guardar el reporte: ' + err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const abrirDialogoEliminar = (reporte) => {
    setReporteEliminar(reporte);
    setDialogoEliminar(true);
  };

  const confirmarEliminar = async () => {
    try {
      const { error } = await supabase
        .from('reportes')
        .delete()
        .eq('id', reporteEliminar.id);

      if (error) throw error;

      setExito('Reporte eliminado correctamente');
      setTimeout(() => setExito(null), 3000);
      setDialogoEliminar(false);
      setReporteEliminar(null);
      cargarReportes();
    } catch (err) {
      console.error('Error al eliminar reporte:', err);
      setError('Error al eliminar el reporte');
      setTimeout(() => setError(null), 3000);
    }
  };

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
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        {/* Header con gradiente */}
        <Paper
          elevation={6}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <BotonInicio />
              <IconButton
                onClick={() => navigate('/datos-paciente')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                📋 Reportes Clínicos
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95 }}>
                {paciente?.nombre || 'Paciente'}
              </Typography>
              {paciente?.email && (
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  {paciente.email}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={abrirDialogoCrear}
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
              Nuevo Reporte
            </Button>
          </Box>
        </Paper>

        {/* Alertas */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: 2
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {exito && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: 2
            }} 
            onClose={() => setExito(null)}
          >
            {exito}
          </Alert>
        )}

        {/* Lista de reportes */}
        {cargando ? (
          <Paper 
            elevation={3}
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'inline-block' }}>
              <AssignmentIcon 
                sx={{ 
                  fontSize: 60, 
                  color: '#667eea',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }} 
              />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              Cargando reportes...
            </Typography>
          </Paper>
        ) : reportes.length === 0 ? (
          <Paper 
            elevation={3}
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3
            }}
          >
            <AssignmentIcon sx={{ fontSize: 80, color: '#667eea', opacity: 0.5, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              No hay reportes aún
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Comienza creando el primer reporte clínico para este paciente
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={abrirDialogoCrear}
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
              Crear Primer Reporte
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {reportes.map((reporte, index) => (
              <Grid item xs={12} md={6} key={reporte.id}>
                <Card
                  elevation={4}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      '& .action-buttons': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '6px',
                      background: `linear-gradient(90deg, ${
                        index % 3 === 0 ? '#667eea, #764ba2' :
                        index % 3 === 1 ? '#f093fb, #f5576c' :
                        '#4facfe, #00f2fe'
                      })`,
                      borderRadius: '12px 12px 0 0'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold" 
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                          }}
                        >
                          {reporte.titulo}
                        </Typography>
                        {reporte.created_at && (
                          <Chip
                            label={new Date(reporte.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(102, 126, 234, 0.15)', 
                              color: '#667eea',
                              fontWeight: 'bold',
                              borderRadius: 1
                            }}
                          />
                        )}
                      </Box>
                      <Box 
                        className="action-buttons"
                        sx={{ 
                          display: 'flex',
                          gap: 0.5,
                          opacity: { xs: 1, md: 0 },
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEditar(reporte)}
                          sx={{ 
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            '&:hover': { 
                              bgcolor: '#667eea',
                              color: 'white',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEliminar(reporte)}
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            color: '#f44336',
                            '&:hover': { 
                              bgcolor: '#f44336',
                              color: 'white',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box
                      sx={{
                        bgcolor: 'rgba(245, 247, 250, 0.8)',
                        p: 2,
                        borderRadius: 2,
                        borderLeft: '4px solid #667eea',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          bgcolor: '#667eea',
                          borderRadius: '3px'
                        }
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.7,
                          color: 'text.secondary'
                        }}
                      >
                        {reporte.descripcion}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Diálogo Crear/Editar Reporte */}
      <Dialog 
        open={dialogoAbierto} 
        onClose={cerrarDialogo} 
        maxWidth="md" 
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
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <AssignmentIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {modoEdicion ? 'Editar Reporte' : 'Nuevo Reporte'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {modoEdicion ? 'Actualiza la información del reporte' : 'Crea un nuevo reporte clínico'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, pb: 2 }}>
          <TextField
            label="Título del Reporte"
            placeholder="Ej: Sesión inicial, Evaluación mensual, etc."
            value={reporteActual.titulo}
            onChange={(e) => setReporteActual({ ...reporteActual, titulo: e.target.value })}
            fullWidth
            margin="normal"
            required
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
          />
          <TextField
            label="Descripción del Reporte"
            placeholder="Escribe las observaciones, diagnósticos, tratamientos, etc."
            value={reporteActual.descripcion}
            onChange={(e) => setReporteActual({ ...reporteActual, descripcion: e.target.value })}
            fullWidth
            multiline
            rows={10}
            margin="normal"
            required
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
          <Button 
            onClick={cerrarDialogo}
            sx={{
              color: 'text.secondary',
              fontWeight: 'bold',
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarReporte}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
              px: 4,
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                boxShadow: 5
              }
            }}
          >
            {modoEdicion ? '✓ Actualizar Reporte' : '+ Crear Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Confirmar Eliminación */}
      <Dialog 
        open={dialogoEliminar} 
        onClose={() => setDialogoEliminar(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 10
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: '#ffebee',
            color: '#c62828',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <DeleteIcon />
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas eliminar el reporte:
          </Typography>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: '#fff3e0', 
              borderRadius: 2, 
              mt: 2,
              borderLeft: '4px solid #ff9800'
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              "{reporteEliminar?.titulo}"
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDialogoEliminar(false)}
            variant="outlined"
            sx={{
              borderWidth: 2,
              fontWeight: 'bold',
              '&:hover': {
                borderWidth: 2
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmarEliminar} 
            color="error" 
            variant="contained"
            size="large"
            startIcon={<DeleteIcon />}
            sx={{
              fontWeight: 'bold',
              px: 3,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5
              }
            }}
          >
            Eliminar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportesPaciente;
