import { useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Stack,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const SubirPregunta = () => {
  const [texto, setTexto] = useState("");
  const [cuestionarioId, setCuestionarioId] = useState("");
  const [opciones, setOpciones] = useState(["", ""]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const agregarOpcion = () => {
    setOpciones([...opciones, ""]);
  };

  const actualizarOpcion = (index, valor) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    setOpciones(nuevasOpciones);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError(false);

    const opcionesJson = opciones.filter((op) => op.trim() !== "");

    if (!texto || !cuestionarioId || opcionesJson.length < 1) {
      setMensaje("Completa todos los campos.");
      setError(true);
      return;
    }

    const { error } = await supabase.from("preguntas").insert([
      {
        texto,
        cuestionario_id: cuestionarioId,
        opciones: opcionesJson,
      },
    ]);

    if (error) {
      console.error("Error al guardar la pregunta:", error.message);
      setMensaje("Error al guardar.");
      setError(true);
    } else {
      setMensaje("Pregunta guardada correctamente.");
      setTexto("");
      setCuestionarioId("");
      setOpciones(["", ""]);
      setError(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Subir nueva pregunta
      </Typography>

      {mensaje && (
        <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      <Box component="form" onSubmit={manejarEnvio} noValidate>
        <TextField
          fullWidth
          label="Texto de la pregunta"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="ID del cuestionario"
          value={cuestionarioId}
          onChange={(e) => setCuestionarioId(e.target.value)}
          margin="normal"
          required
        />

        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Opciones:
          </Typography>
          <Stack spacing={2}>
            {opciones.map((opcion, index) => (
              <TextField
                key={index}
                label={`Opción ${index + 1}`}
                value={opcion}
                onChange={(e) => actualizarOpcion(index, e.target.value)}
                fullWidth
              />
            ))}
          </Stack>

          <Box mt={2}>
            <Button
              startIcon={<AddIcon />}
              onClick={agregarOpcion}
              variant="text"
              color="primary"
            >
              Agregar otra opción
            </Button>
          </Box>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 3 }}
        >
          Guardar pregunta
        </Button>
      </Box>
    </Container>
  );
};

export default SubirPregunta;
