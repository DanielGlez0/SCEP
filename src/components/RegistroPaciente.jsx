import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

const RegistroPaciente = () => {
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    const { data: registroAuth, error: errorAuth } = await supabase.auth.signUp({
      email,
      password: contraseña,
    });

    if (errorAuth) {
      setError("Error al registrar: " + errorAuth.message);
      return;
    }

    const { data: usuarioExistente, error: errorVerificacion } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (errorVerificacion && errorVerificacion.code !== "PGRST116") {
      console.error("Error al verificar el email:", errorVerificacion.message);
      setError("Ocurrió un error al verificar el email.");
      return;
    }

    if (usuarioExistente) {
      setError("El email ya está registrado. Por favor, utiliza otro.");
      return;
    }

    const rol = "Paciente";
    const { error: errorInsertar } = await supabase
      .from("usuarios")
      .insert([{ nombre, edad: parseInt(edad), telefono, email, rol }]);

    if (errorInsertar) {
      console.error("Error al insertar:", errorInsertar.message);
      setError("Error al guardar datos adicionales: " + errorInsertar.message);
      return;
    }

    alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0f7fa, #e3f2fd)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary" align="center">
          Registro de Paciente
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={manejarRegistro}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Edad"
            type="number"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Teléfono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Registrarse
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegistroPaciente;
