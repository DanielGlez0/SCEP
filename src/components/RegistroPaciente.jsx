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
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const validarCampo = (campo, valor) => {
    let mensajeError = "";
    
    switch(campo) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor) {
          mensajeError = "El correo es obligatorio";
        } else if (!emailRegex.test(valor)) {
          mensajeError = "Ingresa un correo válido (ej: usuario@email.com)";
        }
        break;
      
      case 'contraseña':
        if (!valor) {
          mensajeError = "La contraseña es obligatoria";
        } else if (valor.length < 6) {
          mensajeError = "Mínimo 6 caracteres";
        } else if (!/(?=.*[a-z])/.test(valor)) {
          mensajeError = "Debe contener al menos una letra minúscula";
        } else if (!/(?=.*[A-Z])/.test(valor)) {
          mensajeError = "Debe contener al menos una letra mayúscula";
        } else if (!/(?=.*\d)/.test(valor)) {
          mensajeError = "Debe contener al menos un número";
        }
        break;
      
      case 'confirmarContraseña':
        if (!valor) {
          mensajeError = "Debes confirmar la contraseña";
        } else if (valor !== contraseña) {
          mensajeError = "Las contraseñas no coinciden";
        }
        break;
      
      case 'nombre':
        if (!valor.trim()) {
          mensajeError = "El nombre es obligatorio";
        } else if (valor.trim().length < 3) {
          mensajeError = "Mínimo 3 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          mensajeError = "Solo letras y espacios";
        }
        break;
      
      case 'edad':
        const edadNum = parseInt(valor);
        if (!valor) {
          mensajeError = "La edad es obligatoria";
        } else if (isNaN(edadNum) || edadNum <= 0) {
          mensajeError = "Edad inválida";
        } else if (edadNum < 18) {
          mensajeError = "Debes ser mayor de 18 años";
        } else if (edadNum > 120) {
          mensajeError = "Edad no válida";
        }
        break;
      
      case 'telefono':
        const telefonoLimpio = valor.replace(/\D/g, '');
        if (!valor) {
          mensajeError = "El teléfono es obligatorio";
        } else if (telefonoLimpio.length !== 10) {
          mensajeError = "Debe tener 10 dígitos";
        }
        break;
    }
    
    setErrores(prev => ({...prev, [campo]: mensajeError}));
    return mensajeError === "";
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validar todos los campos
    const camposValidos = [
      validarCampo('email', email),
      validarCampo('contraseña', contraseña),
      validarCampo('confirmarContraseña', confirmarContraseña),
      validarCampo('nombre', nombre),
      validarCampo('edad', edad),
      validarCampo('telefono', telefono)
    ];
    
    if (!camposValidos.every(v => v)) {
      setError('Por favor corrige los errores antes de continuar');
      return;
    }

    const edadNum = parseInt(edad);

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
            onChange={(e) => {
              setEmail(e.target.value);
              if (errores.email) validarCampo('email', e.target.value);
            }}
            onBlur={(e) => validarCampo('email', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.email}
            helperText={errores.email}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={contraseña}
            onChange={(e) => {
              setContraseña(e.target.value);
              if (errores.contraseña) validarCampo('contraseña', e.target.value);
              if (confirmarContraseña && errores.confirmarContraseña) {
                validarCampo('confirmarContraseña', confirmarContraseña);
              }
            }}
            onBlur={(e) => validarCampo('contraseña', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.contraseña}
            helperText={errores.contraseña || "Mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número"}
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            value={confirmarContraseña}
            onChange={(e) => {
              setConfirmarContraseña(e.target.value);
              if (errores.confirmarContraseña) validarCampo('confirmarContraseña', e.target.value);
            }}
            onBlur={(e) => validarCampo('confirmarContraseña', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.confirmarContraseña}
            helperText={errores.confirmarContraseña}
          />
          <TextField
            label="Nombre completo"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errores.nombre) validarCampo('nombre', e.target.value);
            }}
            onBlur={(e) => validarCampo('nombre', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.nombre}
            helperText={errores.nombre}
          />
          <TextField
            label="Edad"
            type="number"
            value={edad}
            onChange={(e) => {
              setEdad(e.target.value);
              if (errores.edad) validarCampo('edad', e.target.value);
            }}
            onBlur={(e) => validarCampo('edad', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.edad}
            helperText={errores.edad || "Debe ser mayor de 18 años"}
            inputProps={{ min: 18, max: 120 }}
          />
          <TextField
            label="Teléfono"
            type="tel"
            value={telefono}
            onChange={(e) => {
              const valor = e.target.value.replace(/\D/g, '').slice(0, 10);
              setTelefono(valor);
              if (errores.telefono) validarCampo('telefono', valor);
            }}
            onBlur={(e) => validarCampo('telefono', e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errores.telefono}
            helperText={errores.telefono || "10 dígitos"}
            inputProps={{ maxLength: 10 }}
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
