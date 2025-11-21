import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import fondoMenu from '../assets/fondo-menu.png';
import BotonInicio from './BotonInicio';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  Alert,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const GestionCuestionarios = () => {
  const navigate = useNavigate();
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cuestionarioActual, setCuestionarioActual] = useState({ id: null, Titulo: '', Descripcion: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Obtener todos los cuestionarios
  const cargarCuestionarios = async () => {
    setCargando(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('cuestionarios')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setCuestionarios(data || []);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
      setError('Error al cargar los cuestionarios: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  // Abrir diálogo para crear
  const abrirDialogoCrear = () => {
    setCuestionarioActual({ id: null, Titulo: '', Descripcion: '' });
    setModoEdicion(false);
    setDialogoAbierto(true);
  };

  // Abrir diálogo para editar
  const abrirDialogoEditar = (cuestionario) => {
    setCuestionarioActual(cuestionario);
    setModoEdicion(true);
    setDialogoAbierto(true);
  };

  // Cerrar diálogo
  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setCuestionarioActual({ id: null, Titulo: '', Descripcion: '' });
    setError('');
  };

  // Guardar (crear o actualizar)
  const guardarCuestionario = async () => {
    if (!cuestionarioActual.Titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    try {
      if (modoEdicion) {
        // Actualizar
        const { error } = await supabase
          .from('cuestionarios')
          .update({ Titulo: cuestionarioActual.Titulo, Descripcion: cuestionarioActual.Descripcion })
          .eq('id', cuestionarioActual.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('cuestionarios')
          .insert([{ Titulo: cuestionarioActual.Titulo, Descripcion: cuestionarioActual.Descripcion }]);

        if (error) throw error;
      }

      await cargarCuestionarios();
      cerrarDialogo();
    } catch (err) {
      console.error('Error al guardar cuestionario:', err);
      setError('Error al guardar: ' + err.message);
    }
  };

  // Eliminar cuestionario
  const eliminarCuestionario = async (id) => {
    try {
      const { error } = await supabase
        .from('cuestionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await cargarCuestionarios();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar cuestionario:', err);
      setError('Error al eliminar: ' + err.message);
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
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BotonInicio />
            <Box
              sx={{
                bgcolor: 'white',
                px: 3,
                py: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                Gestión de Cuestionarios
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirDialogoCrear}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: '#f5f5f5' },
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            Crear Cuestionario
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'white' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((n) => (
              <Grid item xs={12} sm={6} md={4} key={n}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : cuestionarios.length === 0 ? (
          <Paper
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay cuestionarios creados aún.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirDialogoCrear}
              sx={{ mt: 2, bgcolor: '#667eea', '&:hover': { bgcolor: '#764ba2' } }}
            >
              Crear el primero
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {cuestionarios.map((cuestionario) => (
              <Grid item xs={12} sm={6} md={4} key={cuestionario.id}>
                <Card
                  elevation={4}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardContent onClick={() => navigate(`/gestion-cuestionarios/${cuestionario.id}/preguntas`)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AssignmentIcon sx={{ mr: 1, color: '#667eea', fontSize: 28 }} />
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {cuestionario.Titulo}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {cuestionario.Descripcion || 'Sin descripción'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirDialogoEditar(cuestionario);
                      }}
                      title="Editar cuestionario"
                      sx={{ color: '#667eea' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(cuestionario.id);
                      }}
                      title="Eliminar cuestionario"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Diálogo para crear/editar */}
      <Dialog open={dialogoAbierto} onClose={cerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modoEdicion ? 'Editar Cuestionario' : 'Crear Cuestionario'}
          <IconButton
            onClick={cerrarDialogo}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Título"
            fullWidth
            required
            value={cuestionarioActual.Titulo}
            onChange={(e) => setCuestionarioActual({ ...cuestionarioActual, Titulo: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={cuestionarioActual.Descripcion}
            onChange={(e) => setCuestionarioActual({ ...cuestionarioActual, Descripcion: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCuestionario}>
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este cuestionario? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => eliminarCuestionario(confirmDelete)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default GestionCuestionarios;
