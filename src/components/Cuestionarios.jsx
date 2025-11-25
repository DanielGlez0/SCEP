import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '../ThemeContext';
import BotonInicio from './BotonInicio';
import fondoMenu from '../assets/fondo-menu.png';

const Cuestionarios = () => {
  const { id } = useParams(); // ID de cuestionarios_asignados
  const navigate = useNavigate();
  const theme = useTheme();
  const [asignacion, setAsignacion] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCuestionario();
  }, [id]);

  const cargarCuestionario = async () => {
    try {
      setCargando(true);
      setError(null);

      // Obtener la asignación del cuestionario
      const { data: asignacionData, error: asignacionError } = await supabase
        .from('cuestionarios_asignados')
        .select(`
          *,
          cuestionarios (id, Titulo, Descripcion)
        `)
        .eq('id', id)
        .single();

      if (asignacionError) throw asignacionError;
      setAsignacion(asignacionData);

      // Obtener las preguntas del cuestionario
      const { data: preguntasData, error: preguntasError } = await supabase
        .from('preguntas')
        .select('*')
        .eq('cuestionario_id', asignacionData.cuestionario_id)
        .order('id', { ascending: true });

      if (preguntasError) throw preguntasError;
      setPreguntas(preguntasData || []);

      // Si ya está completado, cargar respuestas existentes
      if (asignacionData.completado) {
        const { data: respuestasData, error: respuestasError } = await supabase
          .from('respuestas_cuestionarios')
          .select('*')
          .eq('cuestionario_asignado_id', id);

        if (respuestasError) throw respuestasError;

        const respuestasMap = {};
        respuestasData.forEach(resp => {
          respuestasMap[resp.pregunta_id] = {
            texto: resp.respuesta_texto,
            valor: resp.respuesta_valor
          };
        });
        setRespuestas(respuestasMap);
      }
    } catch (err) {
      console.error('Error al cargar cuestionario:', err);
      setError('No se pudo cargar el cuestionario');
    } finally {
      setCargando(false);
    }
  };

  const handleRespuestaChange = (preguntaId, opcion) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcion
    }));
  };

  const calcularPuntajeTotal = () => {
    return Object.values(respuestas).reduce((sum, resp) => sum + resp.valor, 0);
  };

  const validarRespuestas = () => {
    // Verificar que todas las preguntas tengan respuesta
    return preguntas.every(pregunta => respuestas[pregunta.id]);
  };

  const guardarRespuestas = async () => {
    if (!validarRespuestas()) {
      alert('Por favor responde todas las preguntas antes de enviar');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      // Preparar array de respuestas
      const respuestasArray = preguntas.map(pregunta => ({
        cuestionario_asignado_id: id,
        pregunta_id: pregunta.id,
        respuesta_texto: respuestas[pregunta.id].texto,
        respuesta_valor: respuestas[pregunta.id].valor
      }));

      // Calcular puntaje total
      const puntaje_total = calcularPuntajeTotal();

      // Si ya está completado, eliminar respuestas anteriores
      if (asignacion.completado) {
        const { error: deleteError } = await supabase
          .from('respuestas_cuestionarios')
          .delete()
          .eq('cuestionario_asignado_id', id);

        if (deleteError) throw deleteError;
      }

      // Insertar nuevas respuestas
      const { error: insertError } = await supabase
        .from('respuestas_cuestionarios')
        .insert(respuestasArray);

      if (insertError) throw insertError;

      // Actualizar cuestionarios_asignados
      const { error: updateError } = await supabase
        .from('cuestionarios_asignados')
        .update({
          completado: true,
          puntaje_total: puntaje_total,
          fecha_completado: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert(`¡Cuestionario completado con éxito! Puntaje: ${puntaje_total} puntos`);
      navigate('/cuestionarios-disponibles');
    } catch (err) {
      console.error('Error al guardar respuestas:', err);
      setError('No se pudieron guardar las respuestas');
    } finally {
      setGuardando(false);
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

  if (error || !asignacion) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3
        }}
      >
        <Alert severity="error">{error || 'No se encontró el cuestionario'}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        ...theme.fondo,
        py: 4,
        position: 'relative'
      }}
    >
      {theme.overlay && <Box sx={theme.overlay} />}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <BotonInicio />
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/cuestionarios-disponibles')}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
            }}
          >
            Volver
          </Button>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: theme.fondoSecundario,
            color: 'white'
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {asignacion.cuestionarios.Titulo}
          </Typography>
          <Typography variant="body1">
            {asignacion.cuestionarios.Descripcion || 'Sin descripción'}
          </Typography>
          {asignacion.completado && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Completado"
              color="success"
              sx={{ mt: 2, bgcolor: 'white', color: '#4caf50', fontWeight: 'bold' }}
            />
          )}
        </Paper>

        {preguntas.map((pregunta, index) => {
          // Convertir opciones viejas (string) a nuevo formato si es necesario
          const opciones = Array.isArray(pregunta.opciones)
            ? pregunta.opciones.map((op, idx) => 
                typeof op === 'string' 
                  ? { texto: op, valor: idx } 
                  : op
              )
            : [];

          return (
            <Card
              key={pregunta.id}
              sx={{
                mb: 3,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  {index + 1}. {pregunta.texto}
                </Typography>
                <FormControl component="fieldset" fullWidth disabled={asignacion.completado && !guardando}>
                  <RadioGroup
                    value={respuestas[pregunta.id] ? JSON.stringify(respuestas[pregunta.id]) : ''}
                    onChange={(e) => {
                      const opcion = JSON.parse(e.target.value);
                      handleRespuestaChange(pregunta.id, opcion);
                    }}
                  >
                    {opciones.map((opcion, opIdx) => (
                      <FormControlLabel
                        key={opIdx}
                        value={JSON.stringify(opcion)}
                        control={<Radio />}
                        label={opcion.texto}
                        sx={{
                          my: 1,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          );
        })}

        {preguntas.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={guardarRespuestas}
              disabled={guardando || !validarRespuestas()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                }
              }}
            >
              {guardando ? 'Guardando...' : asignacion.completado ? 'Actualizar Respuestas' : 'Enviar Respuestas'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Cuestionarios;
