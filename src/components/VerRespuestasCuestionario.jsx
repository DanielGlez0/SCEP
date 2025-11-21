import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../supabaseClient';

const VerRespuestasCuestionario = ({ open, onClose, asignacionId, cuestionarioTitulo, puntajeTotal }) => {
  const [respuestas, setRespuestas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && asignacionId) {
      cargarRespuestas();
    }
  }, [open, asignacionId]);

  const cargarRespuestas = async () => {
    try {
      setCargando(true);
      setError(null);

      // Cargar las respuestas
      const { data: respuestasData, error: respuestasError } = await supabase
        .from('respuestas_cuestionarios')
        .select('*')
        .eq('cuestionario_asignado_id', asignacionId)
        .order('pregunta_id', { ascending: true });

      if (respuestasError) throw respuestasError;

      // Obtener los IDs de las preguntas
      const preguntaIds = respuestasData.map(r => r.pregunta_id);

      // Cargar las preguntas
      const { data: preguntasData, error: preguntasError } = await supabase
        .from('preguntas')
        .select('*')
        .in('id', preguntaIds)
        .order('id', { ascending: true });

      if (preguntasError) throw preguntasError;

      setRespuestas(respuestasData || []);
      setPreguntas(preguntasData || []);
    } catch (err) {
      console.error('Error al cargar respuestas:', err);
      setError('No se pudieron cargar las respuestas');
    } finally {
      setCargando(false);
    }
  };

  const obtenerPregunta = (preguntaId) => {
    return preguntas.find(p => p.id === preguntaId);
  };

  const getColorPorValor = (valor) => {
    switch(valor) {
      case 0: return { bg: '#ffebee', color: '#c62828' };
      case 1: return { bg: '#fff3e0', color: '#e65100' };
      case 2: return { bg: '#e3f2fd', color: '#1565c0' };
      case 3: return { bg: '#e8f5e9', color: '#2e7d32' };
      default: return { bg: '#f5f5f5', color: '#616161' };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Respuestas del Cuestionario
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {cuestionarioTitulo}
          </Typography>
        </Box>
        <Chip
          icon={<CheckCircleIcon />}
          label={`${puntajeTotal} pts`}
          sx={{ 
            bgcolor: 'white', 
            color: '#4caf50', 
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        />
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : respuestas.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay respuestas disponibles
          </Typography>
        ) : (
          <Box>
            {respuestas.map((respuesta, index) => {
              const pregunta = obtenerPregunta(respuesta.pregunta_id);
              const colorInfo = getColorPorValor(respuesta.respuesta_valor);
              
              return (
                <Card 
                  key={respuesta.id} 
                  sx={{ 
                    mb: 2,
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" color="primary" fontWeight="bold" sx={{ flex: 1 }}>
                        {index + 1}. {pregunta?.texto || 'Pregunta no encontrada'}
                      </Typography>
                      <Chip
                        label={`${respuesta.respuesta_valor} pts`}
                        size="small"
                        sx={{
                          bgcolor: colorInfo.bg,
                          color: colorInfo.color,
                          fontWeight: 'bold',
                          minWidth: 60
                        }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Respuesta del paciente:
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: colorInfo.bg,
                          color: colorInfo.color,
                          p: 2,
                          borderRadius: 1,
                          borderLeft: `4px solid ${colorInfo.color}`
                        }}
                      >
                        <Typography variant="body1" fontWeight="bold">
                          {respuesta.respuesta_texto}
                        </Typography>
                      </Box>
                    </Box>

                    {pregunta?.opciones && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Opciones disponibles:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {pregunta.opciones.map((opcion, idx) => {
                            const opcionObj = typeof opcion === 'string' ? { texto: opcion, valor: idx } : opcion;
                            const isSelected = opcionObj.texto === respuesta.respuesta_texto;
                            return (
                              <Chip
                                key={idx}
                                label={`${opcionObj.texto} (${opcionObj.valor})`}
                                size="small"
                                variant={isSelected ? 'filled' : 'outlined'}
                                color={isSelected ? 'primary' : 'default'}
                                sx={{
                                  fontWeight: isSelected ? 'bold' : 'normal'
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" align="center" color="primary" fontWeight="bold">
                Puntaje Total: {puntajeTotal} puntos
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerRespuestasCuestionario;
