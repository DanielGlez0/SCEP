import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
} from "@mui/material";
import BotonInicio from './BotonInicio';

const SubirReporte = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Subir Reporte
        </Typography>
        <BotonInicio />
      </Box>

      {mensaje && (
        <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      <Box component="form" onSubmit={guardarReporte} noValidate>
        <TextField
          fullWidth
          select
          label="Seleccionar Paciente"
          value={pacienteSeleccionado}
          onChange={(e) => setPacienteSeleccionado(e.target.value)}
          margin="normal"
        >
          <MenuItem value="">-- Selecciona un paciente --</MenuItem>
          {pacientes.map((paciente) => (
            <MenuItem key={paciente.id} value={paciente.id}>
              {paciente.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Título del Reporte"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          margin="normal"
          placeholder="Ejemplo: Sesión 1, Análisis inicial, etc."
        />

        <TextField
          fullWidth
          multiline
          rows={5}
          label="Descripción del Reporte"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          margin="normal"
          placeholder="Escribe aquí el contenido del reporte..."
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Guardar Reporte
        </Button>
      </Box>
    </Container>
  );
};

export default SubirReporte;
