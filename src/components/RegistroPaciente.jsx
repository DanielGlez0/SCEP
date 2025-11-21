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
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");
    // Validaciones en cliente
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum <= 0) {
      setError('Ingresa una edad válida.');
      return;
    }

    // Crear usuario en Auth
    const { data: registroAuth, error: errorAuth } = await supabase.auth.signUp({
      email,
      password: contraseña,
    });

    if (errorAuth) {
      setError('Error al registrar: ' + (errorAuth.message || errorAuth));
      return;
    }

    // Evitar insertar duplicados por email en la tabla `usuarios`
    const { data: usuarioExistente, error: errorVerificacion } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (errorVerificacion) {
      console.error('Error al verificar el email:', errorVerificacion.message);
      setError('Ocurrió un error al verificar el email.');
      // cerrar sesión temporalmente
      await supabase.auth.signOut();
      return;
    }

    if (usuarioExistente) {
      setError('El email ya está registrado. Por favor, utiliza otro.');
      // cerrar sesión creada en Auth para evitar cuenta huérfana
      await supabase.auth.signOut();
      return;
    }

    const rol = 'Paciente';
    // Obtener id del usuario creado en Auth
    const authId = registroAuth?.user?.id || registroAuth?.data?.user?.id || null;

    // Normalizar teléfono a número (bigint en la BD). Si no es convertible, dejar null.
    const telefonoNum = telefono ? parseInt(String(telefono).replace(/\D/g, ''), 10) || null : null;

    // Insertar en la tabla `usuarios` y devolver la fila insertada
    const { data: usuarioInsertado, error: errorInsertar } = await supabase
      .from('usuarios')
      .insert([{ auth_id: authId, nombre, edad: edadNum, telefono: telefonoNum, email, rol }])
      .select()
      .maybeSingle();

    if (errorInsertar) {
      console.error('Error al insertar usuario:', errorInsertar.message);
      setError('Error al guardar datos adicionales: ' + errorInsertar.message);
      // cerrar sesión creada en Auth para evitar cuenta huérfana
      await supabase.auth.signOut();
      return;
    }

    // Asegurarnos de tener el id del usuario en la tabla `usuarios`
    let usuarioId = usuarioInsertado?.id || null;
    if (!usuarioId && authId) {
      const { data: usuarioReciente, error: errorReciente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', authId)
        .maybeSingle();
      if (errorReciente) console.warn('No se pudo obtener usuario por auth_id:', errorReciente.message);
      usuarioId = usuarioReciente?.id || usuarioId;
    }

    // Preparar payload para la tabla `pacientes`.
    // Según tu esquema, `pacientes.id` es PK que referencia `auth.users(id)`.
    // Por tanto debemos usar el `authId` retornado por Supabase Auth.
    if (!authId) {
      console.error('No se obtuvo authId tras el registro en Auth; imposible crear paciente.');
      setError('Error interno: no se obtuvo el identificador de autenticación. Intenta de nuevo.');
      // Intentar limpiar usuarios creado
      try {
        if (usuarioId) await supabase.from('usuarios').delete().eq('id', usuarioId);
      } catch (cleanupErr) {
        console.error('Error al limpiar usuarios:', cleanupErr);
      }
      await supabase.auth.signOut();
      return;
    }

    const pacientePayload = {
      id: authId,
      nombre,
      edad: edadNum,
    };

    // Insertar en `pacientes` y manejar errores con rollback
    const { data: pacienteInsertado, error: errorInsertarPaciente } = await supabase
      .from('pacientes')
      .insert([pacientePayload]);

    if (errorInsertarPaciente) {
      console.error('Error al insertar paciente:', errorInsertarPaciente.message);
      setError('Error al crear perfil de paciente: ' + errorInsertarPaciente.message);

      // Intentar limpiar la fila en `usuarios` para evitar datos huérfanos
      try {
        if (usuarioId) {
          await supabase.from('usuarios').delete().eq('id', usuarioId);
        } else if (authId) {
          await supabase.from('usuarios').delete().eq('auth_id', authId);
        }
      } catch (cleanupErr) {
        console.error('Error al limpiar usuarios después de fallo en pacientes:', cleanupErr);
      }

      // Cerrar sesión Auth para evitar cuenta huérfana
      await supabase.auth.signOut();
      return;
    }

    alert('Usuario y perfil de paciente registrados exitosamente. Ahora puedes iniciar sesión.');
    navigate('/login');
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
            label="Confirmar contraseña"
            type="password"
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
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
