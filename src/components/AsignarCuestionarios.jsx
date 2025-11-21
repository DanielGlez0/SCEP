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
import { supabase } from '../supabaseClient';
import VerRespuestasCuestionario from './VerRespuestasCuestionario';

const AsignarCuestionarios = ({ open, onClose, paciente, onSuccess }) => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cuestionariosAsignados, setCuestionariosAsignados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [dialogoRespuestas, setDialogoRespuestas] = useState(false);
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState(null);

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

      // Cargar cuestionarios ya asignados a este paciente
      const { data: asignados, error: errorAsignados } = await supabase
        .from('cuestionarios_asignados')
        .select('cuestionario_id, completado, puntaje_total, fecha_completado')
        .eq('paciente_id', paciente.id);

      if (errorAsignados) throw errorAsignados;

      setCuestionarios(todosCuestionarios || []);
      setCuestionariosAsignados(asignados || []);
      
      // Pre-seleccionar los cuestionarios ya asignados
      const idsAsignados = (asignados || []).map(a => a.cuestionario_id);
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

      const idsActuales = cuestionariosAsignados.map(a => a.cuestionario_id);
      
      // Cuestionarios a agregar (nuevos)
      const paraAgregar = seleccionados.filter(id => !idsActuales.includes(id));
      
      // Cuestionarios a eliminar (desmarcados)
      const paraEliminar = idsActuales.filter(id => !seleccionados.includes(id));

      // Insertar nuevos
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

      // Eliminar los desmarcados
      if (paraEliminar.length > 0) {
        const { error: errorEliminar } = await supabase
          .from('cuestionarios_asignados')
          .delete()
          .eq('paciente_id', paciente.id)
          .in('cuestionario_id', paraEliminar);

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

  const abrirRespuestas = async (cuestionario, asignacion) => {
    // Obtener el ID de la asignación
    const { data: asignacionCompleta, error } = await supabase
      .from('cuestionarios_asignados')
      .select('id')
      .eq('paciente_id', paciente.id)
      .eq('cuestionario_id', cuestionario.id)
      .single();

    if (error) {
      console.error('Error al obtener asignación:', error);
      return;
    }

    setRespuestasSeleccionadas({
      asignacionId: asignacionCompleta.id,
      cuestionarioTitulo: cuestionario.Titulo,
      puntajeTotal: asignacion.puntaje_total
    });
    setDialogoRespuestas(true);
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
                
                return (
                  <ListItem
                    key={cuestionario.id}
                    disablePadding
                    sx={{
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
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
                                <Tooltip title="Ver respuestas">
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
    </Dialog>
  );
};

export default AsignarCuestionarios;
