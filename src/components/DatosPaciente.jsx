import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// Material UI
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Alert,
  IconButton
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DatosPaciente = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [error, setError] = useState(null);

  // Obtener la lista de usuarios desde la base de datos al cargar el componente
  useEffect(() => {
    const obtenerUsuarios = async () => {
      const { data, error } = await supabase.from("usuarios").select("*");
      if (error) {
        setError("Error al obtener usuarios: " + error.message);
      } else {
        setUsuarios(data);
        setUsuariosFiltrados(data);
      }
    };
    obtenerUsuarios();
  }, []);

  // Buscar usuarios al hacer clic en el botón
  const buscarUsuarios = () => {
    const resultados = usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    setUsuariosFiltrados(resultados);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" color="primary" mb={4}>
        Datos de Usuarios
      </Typography>

      {/* Campo de búsqueda */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Buscar por nombre"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={buscarUsuarios}
        >
          Buscar Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Mostrar lista de usuarios */}
      {!usuarioSeleccionado ? (
        <Paper elevation={2} sx={{ p: 2 }}>
          {usuariosFiltrados.length > 0 ? (
            <List>
              {usuariosFiltrados.map((usuario) => (
                <div key={usuario.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setUsuarioSeleccionado(usuario)}>
                      <ListItemText
                        primary={usuario.nombre}
                        primaryTypographyProps={{
                          color: "primary",
                          fontWeight: 600,
                          sx: { cursor: "pointer" }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center">
              No se encontraron usuarios.
            </Typography>
          )}
        </Paper>
      ) : (
        // Mostrar información del usuario seleccionado
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton
              color="primary"
              onClick={() => setUsuarioSeleccionado(null)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              Información del Usuario
            </Typography>
          </Box>
          <Typography><strong>Nombre:</strong> {usuarioSeleccionado.nombre}</Typography>
          <Typography><strong>Edad:</strong> {usuarioSeleccionado.edad}</Typography>
          <Typography><strong>Email:</strong> {usuarioSeleccionado.email}</Typography>
          <Typography><strong>Teléfono:</strong> {usuarioSeleccionado.telefono}</Typography>
          <Typography><strong>Rol:</strong> {usuarioSeleccionado.rol}</Typography>
          <Typography><strong>Creado en:</strong> {new Date(usuarioSeleccionado.creado_en).toLocaleString()}</Typography>
          <Typography><strong>Actualizado en:</strong> {new Date(usuarioSeleccionado.actualizado_en).toLocaleString()}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DatosPaciente;
