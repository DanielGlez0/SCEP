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
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BotonInicio />
            <IconButton
              onClick={() => navigate('/datos-paciente')}
              sx={{
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                Reportes de {paciente?.nombre || 'Paciente'}
              </Typography>
              {paciente?.email && (
                <Typography variant="body2" color="text.secondary">
                  {paciente.email}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirDialogoCrear}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                }
              }}
            >
              Nuevo Reporte
            </Button>
          </Box>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setExito(null)}>
            {exito}
          </Alert>
        )}

        {/* Lista de reportes */}
        {cargando ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
            <Typography>Cargando reportes...</Typography>
          </Paper>
        ) : reportes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay reportes para este paciente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Crea el primer reporte haciendo clic en "Nuevo Reporte"
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {reportes.map((reporte) => (
              <Grid item xs={12} key={reporte.id}>
                <Card
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                          {reporte.titulo}
                        </Typography>
                        {reporte.created_at && (
                          <Chip
                            label={new Date(reporte.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            size="small"
                            sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
                          />
                        )}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEditar(reporte)}
                          sx={{ color: '#667eea', mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEliminar(reporte)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {reporte.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Diálogo Crear/Editar Reporte */}
      <Dialog open={dialogoAbierto} onClose={cerrarDialogo} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {modoEdicion ? 'Editar Reporte' : 'Nuevo Reporte'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Título del Reporte"
            value={reporteActual.titulo}
            onChange={(e) => setReporteActual({ ...reporteActual, titulo: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Descripción"
            value={reporteActual.descripcion}
            onChange={(e) => setReporteActual({ ...reporteActual, descripcion: e.target.value })}
            fullWidth
            multiline
            rows={8}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button
            onClick={guardarReporte}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Confirmar Eliminación */}
      <Dialog open={dialogoEliminar} onClose={() => setDialogoEliminar(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el reporte "{reporteEliminar?.titulo}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEliminar(false)}>Cancelar</Button>
          <Button onClick={confirmarEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportesPaciente;
