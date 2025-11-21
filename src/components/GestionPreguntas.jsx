import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import fondoMenu from '../assets/fondo-menu.png';
import BotonInicio from './BotonInicio';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const GestionPreguntas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cuestionario, setCuestionario] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState({
    id: null,
    texto: '',
    opciones: [
      { texto: '', valor: 0 },
      { texto: '', valor: 1 },
      { texto: '', valor: 2 },
      { texto: '', valor: 3 }
    ],
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Cargar información del cuestionario
  const cargarCuestionario = async () => {
    try {
      const { data, error } = await supabase
        .from('cuestionarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCuestionario(data);
    } catch (err) {
      console.error('Error al cargar cuestionario:', err);
      setError('Cuestionario no encontrado');
    }
  };

  // Cargar preguntas del cuestionario
  const cargarPreguntas = async () => {
    setCargando(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('preguntas')
        .select('*')
        .eq('cuestionario_id', id)
        .order('id', { ascending: true });

      if (error) throw error;
      setPreguntas(data || []);
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setError('Error al cargar preguntas: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCuestionario();
    cargarPreguntas();
  }, [id]);

  // Abrir diálogo para crear
  const abrirDialogoCrear = () => {
    setPreguntaActual({
      id: null,
      texto: '',
      opciones: [
        { texto: '', valor: 0 },
        { texto: '', valor: 1 },
        { texto: '', valor: 2 },
        { texto: '', valor: 3 }
      ],
    });
    setModoEdicion(false);
    setDialogoAbierto(true);
  };

  // Abrir diálogo para editar
  const abrirDialogoEditar = (pregunta) => {
    // Si las opciones son strings, convertirlas al nuevo formato
    let opcionesFormateadas = [];
    if (Array.isArray(pregunta.opciones)) {
      opcionesFormateadas = pregunta.opciones.map((opcion, index) => {
        if (typeof opcion === 'string') {
          return { texto: opcion, valor: index };
        }
        return opcion;
      });
    } else {
      opcionesFormateadas = [
        { texto: '', valor: 0 },
        { texto: '', valor: 1 },
        { texto: '', valor: 2 },
        { texto: '', valor: 3 }
      ];
    }

    setPreguntaActual({
      id: pregunta.id,
      texto: pregunta.texto,
      opciones: opcionesFormateadas,
    });
    setModoEdicion(true);
    setDialogoAbierto(true);
  };

  // Cerrar diálogo
  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setPreguntaActual({ 
      id: null, 
      texto: '', 
      opciones: [
        { texto: '', valor: 0 },
        { texto: '', valor: 1 },
        { texto: '', valor: 2 },
        { texto: '', valor: 3 }
      ] 
    });
    setError('');
  };

  // Actualizar texto de opción
  const actualizarOpcionTexto = (index, texto) => {
    const nuevasOpciones = [...preguntaActual.opciones];
    nuevasOpciones[index] = { ...nuevasOpciones[index], texto };
    setPreguntaActual({ ...preguntaActual, opciones: nuevasOpciones });
  };

  // Actualizar valor de opción
  const actualizarOpcionValor = (index, valor) => {
    const nuevasOpciones = [...preguntaActual.opciones];
    nuevasOpciones[index] = { ...nuevasOpciones[index], valor: parseInt(valor) };
    setPreguntaActual({ ...preguntaActual, opciones: nuevasOpciones });
  };

  // Añadir opción
  const añadirOpcion = () => {
    const nuevoValor = preguntaActual.opciones.length;
    setPreguntaActual({
      ...preguntaActual,
      opciones: [...preguntaActual.opciones, { texto: '', valor: nuevoValor }],
    });
  };

  // Eliminar opción
  const eliminarOpcion = (index) => {
    const nuevasOpciones = preguntaActual.opciones.filter((_, i) => i !== index);
    setPreguntaActual({ ...preguntaActual, opciones: nuevasOpciones });
  };

  // Guardar pregunta
  const guardarPregunta = async () => {
    if (!preguntaActual.texto.trim()) {
      setError('El texto de la pregunta es obligatorio.');
      return;
    }

    const opcionesFiltradas = preguntaActual.opciones.filter((op) => op.texto.trim() !== '');
    if (opcionesFiltradas.length === 0) {
      setError('Debe haber al menos una opción.');
      return;
    }

    try {
      if (modoEdicion) {
        // Actualizar
        const { error } = await supabase
          .from('preguntas')
          .update({
            texto: preguntaActual.texto,
            opciones: opcionesFiltradas,
          })
          .eq('id', preguntaActual.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('preguntas')
          .insert([{
            texto: preguntaActual.texto,
            cuestionario_id: parseInt(id),
            opciones: opcionesFiltradas,
          }]);

        if (error) throw error;
      }

      await cargarPreguntas();
      cerrarDialogo();
    } catch (err) {
      console.error('Error al guardar pregunta:', err);
      setError('Error al guardar: ' + err.message);
    }
  };

  // Eliminar pregunta
  const eliminarPregunta = async (preguntaId) => {
    try {
      const { error } = await supabase
        .from('preguntas')
        .delete()
        .eq('id', preguntaId);

      if (error) throw error;
      await cargarPreguntas();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar pregunta:', err);
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
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BotonInicio sx={{ mr: 2 }} />
          <IconButton
            onClick={() => navigate('/gestion-cuestionarios')}
            sx={{
              mr: 2,
              bgcolor: 'white',
              '&:hover': { bgcolor: '#f5f5f5' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
          <Box
            sx={{
              flex: 1,
              bgcolor: 'white',
              px: 3,
              py: 2,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              {cuestionario?.Titulo || 'Cargando...'}
            </Typography>
            {cuestionario?.Descripcion && (
              <Typography variant="body2" color="text.secondary">
                {cuestionario.Descripcion}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirDialogoCrear}
            sx={{
              ml: 2,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: '#f5f5f5' },
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            Nueva Pregunta
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'white' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((n) => (
              <Skeleton
                key={n}
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </Stack>
        ) : preguntas.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay preguntas en este cuestionario.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirDialogoCrear}
              sx={{ mt: 2, bgcolor: '#f5576c', '&:hover': { bgcolor: '#f093fb' } }}
            >
              Crear la primera pregunta
            </Button>
          </Paper>
        ) : (
          <List>
            {preguntas.map((pregunta, index) => (
              <Paper
                key={pregunta.id}
                elevation={4}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => abrirDialogoEditar(pregunta)}
                        sx={{ mr: 1, color: '#f5576c' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => setConfirmDelete(pregunta.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {index + 1}. {pregunta.texto}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {Array.isArray(pregunta.opciones) &&
                          pregunta.opciones.map((opcion, i) => {
                            const textoOpcion = typeof opcion === 'string' ? opcion : opcion.texto;
                            const valorOpcion = typeof opcion === 'object' && opcion.valor !== undefined ? opcion.valor : i;
                            return (
                              <Chip
                                key={i}
                                label={`${textoOpcion} (${valorOpcion})`}
                                size="small"
                                sx={{
                                  mr: 0.5,
                                  mb: 0.5,
                                  bgcolor: '#f093fb',
                                  color: 'white',
                                  fontWeight: 'medium',
                                }}
                              />
                            );
                          })}
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}

        {/* Diálogo para crear/editar pregunta */}
      <Dialog open={dialogoAbierto} onClose={cerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modoEdicion ? 'Editar Pregunta' : 'Crear Pregunta'}
          <IconButton
            onClick={cerrarDialogo}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Texto de la pregunta"
            fullWidth
            required
            multiline
            rows={2}
            value={preguntaActual.texto}
            onChange={(e) => setPreguntaActual({ ...preguntaActual, texto: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Typography variant="subtitle2" gutterBottom>
            Opciones de respuesta (con valor 0-3)
          </Typography>
          {preguntaActual.opciones.map((opcion, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Texto de la opción"
                placeholder={`Ej: Nunca, A veces, Frecuentemente, Siempre`}
                value={opcion.texto}
                onChange={(e) => actualizarOpcionTexto(index, e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Valor"
                inputProps={{ min: 0, max: 3, step: 1 }}
                value={opcion.valor}
                onChange={(e) => actualizarOpcionValor(index, e.target.value)}
                sx={{ width: 100 }}
              />
              {preguntaActual.opciones.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => eliminarOpcion(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={añadirOpcion}
            size="small"
            sx={{ mt: 1 }}
          >
            Añadir opción
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button variant="contained" onClick={guardarPregunta}>
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => eliminarPregunta(confirmDelete)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default GestionPreguntas;
