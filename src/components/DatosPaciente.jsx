import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// Material UI
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Switch,
  FormControlLabel
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import BotonInicio from './BotonInicio';
import fondoMenu from '../assets/fondo-menu.png';

const DatosPaciente = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    telefono: '',
    activo: true
  });
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Obtener la lista de usuarios desde la base de datos al cargar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("rol", "Paciente")
      .order("nombre", { ascending: true });
    
    if (error) {
      setError("Error al obtener usuarios: " + error.message);
    } else {
      setUsuarios(data);
      setUsuariosFiltrados(data);
    }
  };

  // Buscar usuarios al escribir
  useEffect(() => {
    if (filtro.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const resultados = usuarios.filter((usuario) =>
        usuario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        usuario.email.toLowerCase().includes(filtro.toLowerCase())
      );
      setUsuariosFiltrados(resultados);
    }
  }, [filtro, usuarios]);

  const abrirDialogoEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre: usuario.nombre,
      edad: usuario.edad,
      telefono: usuario.telefono || '',
      activo: usuario.activo !== false
    });
    setDialogoEditar(true);
  };

  const cerrarDialogo = () => {
    setDialogoEditar(false);
    setUsuarioSeleccionado(null);
    setFormData({ nombre: '', edad: '', telefono: '', activo: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({
      ...prev,
      activo: e.target.checked
    }));
  };

  const guardarCambios = async () => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: formData.nombre,
          edad: parseInt(formData.edad),
          telefono: formData.telefono ? BigInt(formData.telefono).toString() : null,
          activo: formData.activo,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', usuarioSeleccionado.id);

      if (error) throw error;

      setExito('Paciente actualizado correctamente');
      setTimeout(() => setExito(null), 3000);
      cerrarDialogo();
      cargarUsuarios();
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
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
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Gestión de Pacientes
          </Typography>
          <BotonInicio />
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

        {/* Campo de búsqueda */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Buscar paciente por nombre o email"
            variant="outlined"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            fullWidth
            sx={{
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
          />
        </Box>

        {/* Grid de pacientes */}
        <Grid container spacing={3}>
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((usuario) => (
              <Grid item xs={12} sm={6} md={4} key={usuario.id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${usuario.activo !== false ? '#4caf50' : '#f44336'}`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Chip
                        label={usuario.activo !== false ? 'Activo' : 'Inactivo'}
                        color={usuario.activo !== false ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      {usuario.nombre}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {usuario.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CakeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {usuario.edad} años
                      </Typography>
                    </Box>

                    {usuario.telefono && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {usuario.telefono}
                        </Typography>
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      fullWidth
                      onClick={() => navigate(`/reportes-paciente/${usuario.id}`, { state: { paciente: usuario } })}
                      sx={{
                        mb: 1,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#764ba2',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      Ver Reportes
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      fullWidth
                      onClick={() => abrirDialogoEditar(usuario)}
                      sx={{
                        mt: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                        }
                      }}
                    >
                      Editar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron pacientes
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Diálogo de edición */}
      <Dialog open={dialogoEditar} onClose={cerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Editar Paciente
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Edad"
            name="edad"
            type="number"
            value={formData.edad}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.activo}
                onChange={handleSwitchChange}
                color="success"
              />
            }
            label={formData.activo ? "Paciente Activo" : "Paciente Inactivo"}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button 
            onClick={guardarCambios} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatosPaciente;
