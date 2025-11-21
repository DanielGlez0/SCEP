import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Importa los componentes de MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FondoLogin from '../assets/FondoLogin.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      const userEmail = session.user.email;

      const { data: userData, error: queryError } = await supabase
        .from("usuarios")
        .select("is_master")
        .eq("email", userEmail)
        .single();

      if (queryError) throw queryError;

      if (userData.is_master) {
        navigate("/menu");
      } else {
        navigate("/cuestionarios-disponibles");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPaciente = () => {
    navigate("/registro");
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${FondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 4,
        paddingLeft: 16,
        paddingTop: 20
      }}
    >
      <Paper 
        elevation={10} 
        sx={{ 
          padding: 5, 
          borderRadius: 4, 
          maxWidth: 400, 
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            color: '#667eea',
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate autoComplete="off">
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
          />
          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{
                      color: '#667eea',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              }
            }}
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleRegisterPaciente}
          sx={{ 
            mt: 1,
            py: 1.5,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              borderColor: '#764ba2',
              backgroundColor: 'rgba(102, 126, 234, 0.04)'
            }
          }}
        >
          Registrar Paciente
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
