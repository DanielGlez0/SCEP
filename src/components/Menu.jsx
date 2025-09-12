import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';

const Menu = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#f3f4f6',
        py: { xs: 4, md: 12 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Título */}
      <Typography
        variant="h2"
        align="center"
        fontWeight="bold"
        color="text.primary"
        sx={{ mb: { xs: 6, md: 10 }, fontSize: { xs: 36, md: 56 } }}
      >
        Menú Principal
      </Typography>

      {/* Contenedor del menú */}
      <Box sx={{ width: '100%', maxWidth: 1200, px: 2 }}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="center"
        >
          {/* Columna izquierda */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Button
                variant="contained"
                onClick={() => navigate("/datos-paciente")}
                sx={buttonStyle}
                fullWidth
              >
                Pacientes
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/subir-pregunta")}
                sx={buttonStyle}
                fullWidth
              >
                Cuestionario
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/perfil")} 
                sx={buttonStyle}
                fullWidth
              >
                Perfil
              </Button>
            </Box>
          </Grid>

          {/* Centro: reloj */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Paper
              elevation={4}
              sx={{
                py: 4,
                bgcolor: 'white',
                borderRadius: 4,
                display: 'inline-block',
                minWidth: 150,
              }}
            >
              <Typography
                variant="h2"
                fontWeight="bold"
                color="text.primary"
                sx={{ lineHeight: 1, fontSize: { xs: 54, md: 80 } }}
              >
                17
              </Typography>
              <Typography
                variant="h2"
                fontWeight="bold"
                color="text.primary"
                sx={{ lineHeight: 1, fontSize: { xs: 54, md: 80 } }}
              >
                00
              </Typography>
            </Paper>
          </Grid>

          {/* Columna derecha */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Button
                variant="contained"
                onClick={() => navigate("/subir-reporte")}
                sx={buttonStyle}
                fullWidth
              >
                Reporte
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/agenda")}
                sx={buttonStyle}
                fullWidth
              >
                Calendario
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  py: 3,
                  fontSize: 22,
                  fontWeight: 600,
                  borderRadius: 3,
                  bgcolor: 'error.main',
                  color: 'white',
                  boxShadow: 3,
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
                fullWidth
              >
                Salir
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Estilo reutilizable para botones
const buttonStyle = {
  py: 3,
  fontSize: 22,
  fontWeight: 600,
  borderRadius: 3,
  bgcolor: 'white',
  color: 'primary.main',
  boxShadow: 3,
  border: '1px solid #e5e7eb',
  '&:hover': {
    bgcolor: '#dbeafe',
  },
};

export default Menu;
