import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Tesseract from 'tesseract.js';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  Paper,
  Card,
  CardContent,
  Autocomplete,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  ButtonGroup,
  CircularProgress,
  LinearProgress
} from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import GestureIcon from '@mui/icons-material/Gesture';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import CreateIcon from '@mui/icons-material/Create';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import BotonInicio from './BotonInicio';
import fondoMenu from '../assets/fondo-menu.png';

const SubirReporte = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [dialogoEscritura, setDialogoEscritura] = useState(false);
  const [dibujando, setDibujando] = useState(false);
  const [grosorLinea, setGrosorLinea] = useState(2);
  const [colorLinea, setColorLinea] = useState('#000000');
  const canvasRef = useRef(null);
  const [contexto, setContexto] = useState(null);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [progresoOCR, setProgresoOCR] = useState(0);

  useEffect(() => {
    const obtenerPacientes = async () => {
      const { data, error } = await supabase.from("usuarios").select("id, nombre");
      if (error) {
        console.error("Error al obtener pacientes:", error.message);
      } else {
        setPacientes(data);
      }
    };

    obtenerPacientes();
  }, []);

  useEffect(() => {
    if (dialogoEscritura && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = colorLinea;
      ctx.lineWidth = grosorLinea;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContexto(ctx);
    }
  }, [dialogoEscritura, grosorLinea, colorLinea]);

  const iniciarDibujo = (e) => {
    if (!contexto) return;
    setDibujando(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contexto.beginPath();
    contexto.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (!dibujando || !contexto) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contexto.lineTo(x, y);
    contexto.stroke();
  };

  const terminarDibujo = () => {
    setDibujando(false);
  };

  const limpiarCanvas = () => {
    if (contexto && canvasRef.current) {
      contexto.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const abrirDialogoEscritura = () => {
    setDialogoEscritura(true);
  };

  const cerrarDialogoEscritura = () => {
    setDialogoEscritura(false);
    limpiarCanvas();
  };

  const transcribirTexto = async () => {
    if (!canvasRef.current) return;

    try {
      setTranscribiendo(true);
      setProgresoOCR(0);

      const imagenData = canvasRef.current.toDataURL('image/png');
      
      const resultado = await Tesseract.recognize(
        imagenData,
        'spa', // Español
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgresoOCR(Math.round(m.progress * 100));
            }
          }
        }
      );

      const textoTranscrito = resultado.data.text.trim();
      
      if (textoTranscrito) {
        const notaTexto = `\n\n--- Nota transcrita (${new Date().toLocaleString()}) ---\n${textoTranscrito}\n--- Fin de la nota ---\n`;
        setDescripcion(prev => prev + notaTexto);
        setMensaje("✓ Texto transcrito y agregado al reporte correctamente");
        setError(false);
      } else {
        setMensaje("⚠ No se pudo reconocer texto. Intenta escribir más claro o con trazo más grueso.");
        setError(true);
      }
      
      setTimeout(() => setMensaje(""), 5000);
      cerrarDialogoEscritura();
    } catch (err) {
      console.error('Error en OCR:', err);
      setMensaje("Error al transcribir el texto. Inténtalo de nuevo.");
      setError(true);
      setTimeout(() => setMensaje(""), 5000);
    } finally {
      setTranscribiendo(false);
      setProgresoOCR(0);
    }
  };

  const guardarNotaEscrita = () => {
    transcribirTexto();
  };

  const guardarReporte = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError(false);

    if (!pacienteSeleccionado || !titulo || !descripcion) {
      setMensaje("Por favor, completa todos los campos.");
      setError(true);
      return;
    }

    const { error } = await supabase.from("reportes").insert([
      {
        paciente_id: pacienteSeleccionado,
        titulo,
        descripcion,
      },
    ]);

    if (error) {
      console.error("Error al guardar el reporte:", error.message);
      setMensaje("Error al guardar el reporte. Inténtalo de nuevo.");
      setError(true);
    } else {
      setMensaje("¡Reporte guardado con éxito!");
      setTitulo("");
      setDescripcion("");
      setPacienteSeleccionado("");
      setError(false);
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
      <Container maxWidth="md">
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Crear Nuevo Reporte
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Registra la información clínica del paciente
                </Typography>
              </Box>
            </Box>
            <BotonInicio />
          </Box>
        </Paper>

        {/* Alertas */}
        {mensaje && (
          <Alert 
            severity={error ? "error" : "success"} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: 2
            }}
            onClose={() => setMensaje("")}
          >
            {mensaje}
          </Alert>
        )}

        {/* Formulario */}
        <Card
          elevation={6}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={guardarReporte} noValidate>
              {/* Selección de paciente */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: '#667eea' }} />
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Seleccionar Paciente
                  </Typography>
                </Box>
                <Autocomplete
                  options={pacientes}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={pacientes.find(p => p.id === pacienteSeleccionado) || null}
                  onChange={(event, newValue) => {
                    setPacienteSeleccionado(newValue ? newValue.id : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar paciente..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>{option.nombre}</Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText="No se encontraron pacientes"
                />
              </Box>

              {/* Título del reporte */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#667eea' }} />
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Título del Reporte
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Sesión inicial, Evaluación mensual, Diagnóstico..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Box>

              {/* Descripción */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon sx={{ color: '#667eea' }} />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Contenido del Reporte
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Agregar nota con marca de tiempo">
                      <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        onClick={() => {
                          const notaTexto = `\n\n--- Nota (${new Date().toLocaleString()}) ---\n\n\n--- Fin de la nota ---\n`;
                          setDescripcion(prev => prev + notaTexto);
                          // Enfocar el campo de texto
                          setTimeout(() => {
                            const textField = document.querySelector('textarea');
                            if (textField) {
                              textField.focus();
                              textField.setSelectionRange(
                                descripcion.length + notaTexto.indexOf('---\n') + 4,
                                descripcion.length + notaTexto.indexOf('---\n') + 4
                              );
                            }
                          }, 100);
                        }}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontWeight: 'bold',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#2e7d32',
                            bgcolor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        Nueva Nota
                      </Button>
                    </Tooltip>
                    <Tooltip title="Agregar notas con escritura táctil">
                      <Button
                        variant="outlined"
                        startIcon={<GestureIcon />}
                        onClick={abrirDialogoEscritura}
                        sx={{
                          borderColor: '#667eea',
                          color: '#667eea',
                          fontWeight: 'bold',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#764ba2',
                            bgcolor: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      >
                        Escritura Táctil
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe aquí las observaciones clínicas, diagnósticos, tratamientos, evolución del paciente, etc."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 Tip: Usa "Nueva Nota" para agregar secciones con fecha y hora automática
                </Typography>
              </Box>

              {/* Botón de guardar */}
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Guardar Reporte
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Paper
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            borderLeft: '4px solid #667eea'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            ℹ️ Los reportes se guardarán en el historial del paciente y podrán ser consultados posteriormente
          </Typography>
        </Paper>
      </Container>

      {/* Diálogo de Escritura Táctil */}
      <Dialog
        open={dialogoEscritura}
        onClose={cerrarDialogoEscritura}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CreateIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Escritura Táctil / Digital
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Usa tu lápiz digital o mouse para escribir notas
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={cerrarDialogoEscritura}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #ddd', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                Herramientas:
              </Typography>
              
              <ButtonGroup variant="outlined" size="small">
                <Button
                  onClick={() => setGrosorLinea(1)}
                  variant={grosorLinea === 1 ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: grosorLinea === 1 ? '#667eea' : 'transparent',
                    color: grosorLinea === 1 ? 'white' : '#667eea',
                    borderColor: '#667eea',
                    '&:hover': { borderColor: '#667eea' }
                  }}
                >
                  Fino
                </Button>
                <Button
                  onClick={() => setGrosorLinea(3)}
                  variant={grosorLinea === 3 ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: grosorLinea === 3 ? '#667eea' : 'transparent',
                    color: grosorLinea === 3 ? 'white' : '#667eea',
                    borderColor: '#667eea',
                    '&:hover': { borderColor: '#667eea' }
                  }}
                >
                  Medio
                </Button>
                <Button
                  onClick={() => setGrosorLinea(6)}
                  variant={grosorLinea === 6 ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: grosorLinea === 6 ? '#667eea' : 'transparent',
                    color: grosorLinea === 6 ? 'white' : '#667eea',
                    borderColor: '#667eea',
                    '&:hover': { borderColor: '#667eea' }
                  }}
                >
                  Grueso
                </Button>
              </ButtonGroup>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Color:</Typography>
                {['#000000', '#667eea', '#f44336', '#4caf50'].map(color => (
                  <IconButton
                    key={color}
                    onClick={() => setColorLinea(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: color,
                      border: colorLinea === color ? '3px solid #ffd700' : '2px solid #ddd',
                      '&:hover': { 
                        bgcolor: color,
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                ))}
              </Box>

              <Tooltip title="Borrar todo">
                <IconButton
                  onClick={limpiarCanvas}
                  sx={{
                    color: '#f44336',
                    border: '2px solid #f44336',
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              minHeight: '60vh'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid #667eea'
              }}
            >
              <canvas
                ref={canvasRef}
                width={900}
                height={600}
                onMouseDown={iniciarDibujo}
                onMouseMove={dibujar}
                onMouseUp={terminarDibujo}
                onMouseLeave={terminarDibujo}
                style={{
                  cursor: 'crosshair',
                  display: 'block',
                  touchAction: 'none'
                }}
              />
            </Paper>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
            <Alert severity="info" icon={<TextFieldsIcon />}>
              <Typography variant="body2">
                ✨ <strong>Transcripción automática:</strong> Tu escritura será convertida automáticamente a texto
                usando tecnología OCR. Escribe de forma clara para mejores resultados.
              </Typography>
            </Alert>
          </Box>

          {transcribiendo && (
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" fontWeight="bold" color="primary">
                  Transcribiendo texto... {progresoOCR}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progresoOCR} sx={{ borderRadius: 1 }} />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'white', borderTop: '2px solid #f0f0f0' }}>
          <Button
            onClick={cerrarDialogoEscritura}
            disabled={transcribiendo}
            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={limpiarCanvas}
            disabled={transcribiendo}
            startIcon={<UndoIcon />}
            sx={{ color: '#f44336', fontWeight: 'bold' }}
          >
            Limpiar
          </Button>
          <Button
            onClick={guardarNotaEscrita}
            disabled={transcribiendo}
            variant="contained"
            size="large"
            startIcon={transcribiendo ? <CircularProgress size={20} color="inherit" /> : <TextFieldsIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)'
              }
            }}
          >
            {transcribiendo ? 'Transcribiendo...' : 'Transcribir a Texto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubirReporte;
