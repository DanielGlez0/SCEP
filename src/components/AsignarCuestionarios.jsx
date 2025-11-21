import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Typography,
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { supabase } from '../supabaseClient';
import VerRespuestasCuestionario from './VerRespuestasCuestionario';

const AsignarCuestionarios = ({ open, onClose, paciente, onSuccess }) => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cuestionariosAsignados, setCuestionariosAsignados] = useState([]);
  const [cuestionariosHistorial, setCuestionariosHistorial] = useState({});
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [dialogoRespuestas, setDialogoRespuestas] = useState(false);
  const [dialogoHistorial, setDialogoHistorial] = useState(false);
  const [dialogoComparacion, setDialogoComparacion] = useState(false);
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState(null);
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [comparacionSeleccionada, setComparacionSeleccionada] = useState({ respuesta1: null, respuesta2: null });
  const [seleccionandoComparacion, setSeleccionandoComparacion] = useState(false);
  const [respuestasParaComparar, setRespuestasParaComparar] = useState([]);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState({ respuestas1: [], respuestas2: [] });
  const [cargandoComparacion, setCargandoComparacion] = useState(false);

  useEffect(() => {
    if (open && paciente) {
      cargarCuestionarios();
    }
  }, [open, paciente]);

  const cargarCuestionarios = async () => {
    try {
      setCargando(true);
      
      // Cargar todos los cuestionarios
      const { data: todosCuestionarios, error: errorCuestionarios } = await supabase
        .from('cuestionarios')
        .select('*')
        .order('id', { ascending: true });

      if (errorCuestionarios) throw errorCuestionarios;

      // Cargar TODAS las asignaciones del paciente
      const { data: asignados, error: errorAsignados } = await supabase
        .from('cuestionarios_asignados')
        .select('id, cuestionario_id, completado, puntaje_total, fecha_completado, fecha_asignacion')
        .eq('paciente_id', paciente.id)
        .order('fecha_asignacion', { ascending: false });

      if (errorAsignados) throw errorAsignados;

      // Agrupar todas las asignaciones por cuestionario_id para el historial
      const historialPorCuestionario = {};
      (asignados || []).forEach(asignacion => {
        if (!historialPorCuestionario[asignacion.cuestionario_id]) {
          historialPorCuestionario[asignacion.cuestionario_id] = [];
        }
        historialPorCuestionario[asignacion.cuestionario_id].push(asignacion);
      });

      // Filtrar para mantener solo la asignación más reciente de cada cuestionario
      const asignacionesRecientes = [];
      const cuestionariosVistos = new Set();
      
      (asignados || []).forEach(asignacion => {
        if (!cuestionariosVistos.has(asignacion.cuestionario_id)) {
          asignacionesRecientes.push(asignacion);
          cuestionariosVistos.add(asignacion.cuestionario_id);
        }
      });

      setCuestionarios(todosCuestionarios || []);
      setCuestionariosAsignados(asignacionesRecientes);
      setCuestionariosHistorial(historialPorCuestionario);
      
      // Pre-seleccionar solo los cuestionarios no completados
      const idsAsignados = asignacionesRecientes
        .filter(a => !a.completado)
        .map(a => a.cuestionario_id);
      setSeleccionados(idsAsignados);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
      setError('Error al cargar los cuestionarios');
    } finally {
      setCargando(false);
    }
  };

  const handleToggle = (cuestionarioId) => {
    const currentIndex = seleccionados.indexOf(cuestionarioId);
    const newSeleccionados = [...seleccionados];

    if (currentIndex === -1) {
      newSeleccionados.push(cuestionarioId);
    } else {
      newSeleccionados.splice(currentIndex, 1);
    }

    setSeleccionados(newSeleccionados);
  };

  const guardarAsignaciones = async () => {
    try {
      setGuardando(true);
      setError(null);

      // Obtener el psicólogo actual
      const { data: { user } } = await supabase.auth.getUser();
      const { data: psicologoData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      const idsActualesPendientes = cuestionariosAsignados
        .filter(a => !a.completado)
        .map(a => a.cuestionario_id);
      
      const idsCompletados = cuestionariosAsignados
        .filter(a => a.completado)
        .map(a => a.cuestionario_id);
      
      // Cuestionarios nuevos o que se reasignan después de completarse
      const paraAgregar = seleccionados.filter(id => 
        !idsActualesPendientes.includes(id)
      );
      
      // Cuestionarios pendientes a eliminar (desmarcados)
      const paraEliminar = idsActualesPendientes.filter(id => 
        !seleccionados.includes(id)
      );

      // Insertar nuevas asignaciones (incluye reasignaciones de cuestionarios completados)
      if (paraAgregar.length > 0) {
        const inserciones = paraAgregar.map(cuestionarioId => ({
          paciente_id: paciente.id,
          cuestionario_id: cuestionarioId,
          asignado_por: psicologoData.id
        }));

        const { error: errorInsertar } = await supabase
          .from('cuestionarios_asignados')
          .insert(inserciones);

        if (errorInsertar) throw errorInsertar;
      }

      // Eliminar solo las asignaciones pendientes desmarcadas
      if (paraEliminar.length > 0) {
        // Obtener los IDs específicos de las asignaciones a eliminar
        const idsAsignacionesEliminar = cuestionariosAsignados
          .filter(a => !a.completado && paraEliminar.includes(a.cuestionario_id))
          .map(a => a.id);

        const { error: errorEliminar } = await supabase
          .from('cuestionarios_asignados')
          .delete()
          .in('id', idsAsignacionesEliminar);

        if (errorEliminar) throw errorEliminar;
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar asignaciones:', err);
      setError('Error al guardar las asignaciones: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const estaAsignado = (cuestionarioId) => {
    return cuestionariosAsignados.find(a => a.cuestionario_id === cuestionarioId);
  };

  const abrirRespuestas = (cuestionario, asignacion) => {
    // Usar directamente el ID de la asignación que ya tenemos
    setRespuestasSeleccionadas({
      asignacionId: asignacion.id,
      cuestionarioTitulo: cuestionario.Titulo,
      puntajeTotal: asignacion.puntaje_total
    });
    setDialogoRespuestas(true);
  };

  const abrirHistorial = (cuestionario) => {
    const historial = cuestionariosHistorial[cuestionario.id] || [];
    setHistorialSeleccionado({
      cuestionario: cuestionario,
      historial: historial.filter(h => h.completado) // Solo mostrar completados
    });
    setDialogoHistorial(true);
  };

  const cargarRespuestasComparacion = async (respuesta1, respuesta2) => {
    try {
      // Cargar respuestas de la primera asignación
      const { data: respuestas1, error: error1 } = await supabase
        .from('respuestas_cuestionarios')
        .select(`
          *,
          preguntas (id, texto, opciones)
        `)
        .eq('cuestionario_asignado_id', respuesta1.id)
        .order('pregunta_id');

      // Cargar respuestas de la segunda asignación
      const { data: respuestas2, error: error2 } = await supabase
        .from('respuestas_cuestionarios')
        .select(`
          *,
          preguntas (id, texto, opciones)
        `)
        .eq('cuestionario_asignado_id', respuesta2.id)
        .order('pregunta_id');

      if (error1 || error2) {
        console.error('Error cargando respuestas:', error1 || error2);
        return { respuestas1: [], respuestas2: [] };
      }

      return { respuestas1: respuestas1 || [], respuestas2: respuestas2 || [] };
    } catch (err) {
      console.error('Error:', err);
      return { respuestas1: [], respuestas2: [] };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Asignar Cuestionarios a {paciente?.nombre}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : cuestionarios.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay cuestionarios disponibles
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona los cuestionarios que este paciente puede responder:
            </Typography>
            <List>
              {cuestionarios.map((cuestionario) => {
                const asignacion = estaAsignado(cuestionario.id);
                const estaSeleccionado = seleccionados.includes(cuestionario.id);
                const historial = cuestionariosHistorial[cuestionario.id] || [];
                const completados = historial.filter(h => h.completado);
                
                return (
                  <ListItem
                    key={cuestionario.id}
                    disablePadding
                    sx={{
                      mb: 1,
                      border: '1px solid',
                      borderColor: asignacion?.completado ? 'success.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: estaSeleccionado ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <ListItemButton onClick={() => handleToggle(cuestionario.id)} dense>
                      <Checkbox
                        edge="start"
                        checked={estaSeleccionado}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {cuestionario.Titulo}
                            </Typography>
                            {asignacion?.completado && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={`${asignacion.puntaje_total} pts`}
                                  size="small"
                                  color="success"
                                />
                                <Tooltip title="Ver última respuesta">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirRespuestas(cuestionario, asignacion);
                                    }}
                                    sx={{
                                      color: 'primary.main',
                                      '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {completados.length > 1 && (
                                  <Tooltip title={`Ver historial (${completados.length} respuestas)`}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirHistorial(cuestionario);
                                      }}
                                      sx={{
                                        color: 'info.main',
                                        '&:hover': { bgcolor: 'info.light', color: 'white' }
                                      }}
                                    >
                                      <HistoryIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            )}
                            {asignacion && !asignacion.completado && (
                              <Chip
                                label="Pendiente"
                                size="small"
                                color="warning"
                              />
                            )}
                          </Box>
                        }
                        secondary={cuestionario.Descripcion}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          onClick={guardarAsignaciones}
          variant="contained"
          disabled={guardando || cargando}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar Asignaciones'}
        </Button>
      </DialogActions>

      {respuestasSeleccionadas && (
        <VerRespuestasCuestionario
          open={dialogoRespuestas}
          onClose={() => setDialogoRespuestas(false)}
          asignacionId={respuestasSeleccionadas.asignacionId}
          cuestionarioTitulo={respuestasSeleccionadas.cuestionarioTitulo}
          puntajeTotal={respuestasSeleccionadas.puntajeTotal}
        />
      )}

      {/* Diálogo de historial de respuestas */}
      <Dialog open={dialogoHistorial} onClose={() => {
        setDialogoHistorial(false);
        setSeleccionandoComparacion(false);
        setRespuestasParaComparar([]);
      }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Historial de Respuestas: {historialSeleccionado?.cuestionario.Titulo}</span>
          {historialSeleccionado?.historial.length >= 2 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<CompareArrowsIcon />}
              onClick={() => {
                if (seleccionandoComparacion) {
                  setSeleccionandoComparacion(false);
                  setRespuestasParaComparar([]);
                } else {
                  setSeleccionandoComparacion(true);
                }
              }}
              sx={{
                bgcolor: 'white',
                color: 'info.main',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              {seleccionandoComparacion ? 'Cancelar' : 'Comparar'}
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {historialSeleccionado?.historial.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay respuestas completadas para este cuestionario
            </Typography>
          ) : (
            <>
              {seleccionandoComparacion && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Selecciona 2 respuestas para comparar ({respuestasParaComparar.length}/2 seleccionadas)
                </Alert>
              )}
              
              <List>
                {historialSeleccionado?.historial.map((respuesta, index) => {
                  const estaSeleccionado = respuestasParaComparar.some(r => r.id === respuesta.id);
                  
                  return (
                    <ListItem
                      key={respuesta.id}
                      sx={{
                        mb: 2,
                        border: '2px solid',
                        borderColor: estaSeleccionado ? 'warning.main' : 'info.main',
                        borderRadius: 2,
                        bgcolor: estaSeleccionado ? 'warning.light' : 'background.paper',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: seleccionandoComparacion ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (!seleccionandoComparacion) return;
                        
                        if (estaSeleccionado) {
                          setRespuestasParaComparar(prev => prev.filter(r => r.id !== respuesta.id));
                        } else if (respuestasParaComparar.length < 2) {
                          setRespuestasParaComparar(prev => [...prev, respuesta]);
                          if (respuestasParaComparar.length === 1) {
                            // Ya tenemos 2, mostrar comparación y cargar respuestas detalladas
                            setTimeout(async () => {
                              setCargandoComparacion(true);
                              setComparacionSeleccionada({
                                respuesta1: respuestasParaComparar[0],
                                respuesta2: respuesta
                              });
                              setDialogoComparacion(true);
                              
                              // Cargar respuestas detalladas
                              const detalles = await cargarRespuestasComparacion(respuestasParaComparar[0], respuesta);
                              setRespuestasDetalladas(detalles);
                              setCargandoComparacion(false);
                              
                              setSeleccionandoComparacion(false);
                              setRespuestasParaComparar([]);
                            }, 300);
                          }
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                        <Box>
                          <Chip
                            label={`Intento ${historialSeleccionado.historial.length - index}`}
                            size="small"
                            color="info"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${respuesta.puntaje_total} pts`}
                            size="small"
                            color="success"
                          />
                        </Box>
                        {!seleccionandoComparacion && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setRespuestasSeleccionadas({
                                asignacionId: respuesta.id,
                                cuestionarioTitulo: historialSeleccionado.cuestionario.Titulo,
                                puntajeTotal: respuesta.puntaje_total
                              });
                              setDialogoRespuestas(true);
                            }}
                            sx={{
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.light', color: 'white' }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                        <Typography variant="caption">
                          Asignado: {new Date(respuesta.fecha_asignacion).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="caption">
                          Completado: {new Date(respuesta.fecha_completado).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>

              {/* Gráfica de evolución */}
              {historialSeleccionado?.historial.length > 0 && (
                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
                    Evolución del Paciente
                  </Typography>
                  
                  <Box sx={{ position: 'relative', height: 250, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
                    {/* Líneas de referencia */}
                    {[0, 25, 50, 75, 100].map(valor => (
                      <Box
                        key={valor}
                        sx={{
                          position: 'absolute',
                          left: 50,
                          right: 0,
                          bottom: `${(valor / 100) * 100}%`,
                          borderTop: '1px dashed',
                          borderColor: 'divider',
                          '&::before': {
                            content: `"${valor}"`,
                            position: 'absolute',
                            left: -40,
                            top: -8,
                            fontSize: '0.75rem',
                            color: 'text.secondary'
                          }
                        }}
                      />
                    ))}

                    {/* Columnas */}
                    {historialSeleccionado.historial.slice().reverse().map((respuesta, index) => {
                      const maxPuntaje = Math.max(...historialSeleccionado.historial.map(h => h.puntaje_total));
                      const altura = (respuesta.puntaje_total / maxPuntaje) * 100;
                      
                      return (
                        <Box
                          key={respuesta.id}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{ mb: 0.5, color: 'primary.main' }}
                          >
                            {respuesta.puntaje_total}
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: 60,
                              height: `${altura}%`,
                              background: `linear-gradient(to top, ${
                                index === historialSeleccionado.historial.length - 1 
                                  ? '#4caf50' 
                                  : 'rgba(25, 118, 210, 0.8)'
                              }, ${
                                index === historialSeleccionado.historial.length - 1 
                                  ? '#81c784' 
                                  : 'rgba(66, 165, 245, 0.8)'
                              })`,
                              borderRadius: '4px 4px 0 0',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scaleY(1.05)',
                                boxShadow: 3
                              }
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 1,
                              transform: 'rotate(-45deg)',
                              transformOrigin: 'center',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem'
                            }}
                          >
                            {new Date(respuesta.fecha_completado).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Leyenda */}
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(25, 118, 210, 0.8)', borderRadius: 0.5 }} />
                      <Typography variant="caption">Intentos anteriores</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, bgcolor: '#4caf50', borderRadius: 0.5 }} />
                      <Typography variant="caption">Último intento</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogoHistorial(false);
            setSeleccionandoComparacion(false);
            setRespuestasParaComparar([]);
          }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de comparación */}
      <Dialog open={dialogoComparacion} onClose={() => setDialogoComparacion(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
          Comparación de Respuestas
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {/* Respuesta 1 */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                Intento anterior
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`${comparacionSeleccionada.respuesta1?.puntaje_total} pts`}
                  color="info"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" display="block" color="text.secondary">
                  {new Date(comparacionSeleccionada.respuesta1?.fecha_completado).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  setRespuestasSeleccionadas({
                    asignacionId: comparacionSeleccionada.respuesta1?.id,
                    cuestionarioTitulo: historialSeleccionado?.cuestionario.Titulo,
                    puntajeTotal: comparacionSeleccionada.respuesta1?.puntaje_total
                  });
                  setDialogoRespuestas(true);
                }}
                fullWidth
              >
                Ver respuestas
              </Button>
            </Box>

            {/* Respuesta 2 */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mb: 2 }}>
                Intento reciente
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`${comparacionSeleccionada.respuesta2?.puntaje_total} pts`}
                  color="success"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" display="block" color="text.secondary">
                  {new Date(comparacionSeleccionada.respuesta2?.fecha_completado).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  setRespuestasSeleccionadas({
                    asignacionId: comparacionSeleccionada.respuesta2?.id,
                    cuestionarioTitulo: historialSeleccionado?.cuestionario.Titulo,
                    puntajeTotal: comparacionSeleccionada.respuesta2?.puntaje_total
                  });
                  setDialogoRespuestas(true);
                }}
                fullWidth
              >
                Ver respuestas
              </Button>
            </Box>
          </Box>

          {/* Diferencia */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Diferencia de puntaje
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={
              (comparacionSeleccionada.respuesta2?.puntaje_total || 0) > (comparacionSeleccionada.respuesta1?.puntaje_total || 0)
                ? 'success.main'
                : (comparacionSeleccionada.respuesta2?.puntaje_total || 0) < (comparacionSeleccionada.respuesta1?.puntaje_total || 0)
                ? 'error.main'
                : 'text.secondary'
            }>
              {(comparacionSeleccionada.respuesta2?.puntaje_total || 0) - (comparacionSeleccionada.respuesta1?.puntaje_total || 0) > 0 ? '+' : ''}
              {(comparacionSeleccionada.respuesta2?.puntaje_total || 0) - (comparacionSeleccionada.respuesta1?.puntaje_total || 0)} pts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(comparacionSeleccionada.respuesta2?.puntaje_total || 0) > (comparacionSeleccionada.respuesta1?.puntaje_total || 0)
                ? '📈 Mejoría'
                : (comparacionSeleccionada.respuesta2?.puntaje_total || 0) < (comparacionSeleccionada.respuesta1?.puntaje_total || 0)
                ? '📉 Disminución'
                : '➡️ Sin cambios'}
            </Typography>
          </Box>

          {/* Listado de preguntas y respuestas */}
          {cargandoComparacion ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : respuestasDetalladas.respuestas1.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
                Comparación de Respuestas Detalladas
              </Typography>

              {respuestasDetalladas.respuestas1.map((respuesta1, index) => {
                const respuesta2 = respuestasDetalladas.respuestas2.find(
                  r => r.pregunta_id === respuesta1.pregunta_id
                );
                
                return (
                  <Box 
                    key={respuesta1.id}
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                      {index + 1}. {respuesta1.preguntas?.texto}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {/* Respuesta del intento anterior */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 1,
                          border: '2px solid',
                          borderColor: 'info.main'
                        }}
                      >
                        <Typography variant="caption" color="info.main" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                          Intento anterior
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            {respuesta1.respuesta_texto}
                          </Typography>
                          <Chip 
                            label={`${respuesta1.respuesta_valor} pts`} 
                            size="small" 
                            color="info"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Box>

                      {/* Respuesta del intento reciente */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 1,
                          border: '2px solid',
                          borderColor: respuesta2 ? (
                            respuesta2.respuesta_valor > respuesta1.respuesta_valor ? 'success.main' :
                            respuesta2.respuesta_valor < respuesta1.respuesta_valor ? 'error.main' :
                            'success.main'
                          ) : 'grey.300'
                        }}
                      >
                        <Typography variant="caption" color="success.main" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                          Intento reciente
                        </Typography>
                        {respuesta2 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {respuesta2.respuesta_texto}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                              {respuesta2.respuesta_valor > respuesta1.respuesta_valor && (
                                <Typography variant="caption" color="success.main">↑</Typography>
                              )}
                              {respuesta2.respuesta_valor < respuesta1.respuesta_valor && (
                                <Typography variant="caption" color="error.main">↓</Typography>
                              )}
                              <Chip 
                                label={`${respuesta2.respuesta_valor} pts`} 
                                size="small" 
                                color={
                                  respuesta2.respuesta_valor > respuesta1.respuesta_valor ? 'success' :
                                  respuesta2.respuesta_valor < respuesta1.respuesta_valor ? 'error' :
                                  'default'
                                }
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin respuesta
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoComparacion(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AsignarCuestionarios;
