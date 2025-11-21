import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  LinearProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import BotonInicio from './BotonInicio';
import fondoMenu from '../assets/fondo-menu.png';

const PerfilPsicologo = () => {
  // Datos de ejemplo para la gráfica
  const semanasData = [
    { semana: 'Semana 1', horas: 28 },
    { semana: 'Semana 2', horas: 32 },
    { semana: 'Semana 3', horas: 25 },
    { semana: 'Semana 4', horas: 35 },
    { semana: 'Esta semana', horas: 30 }
  ];

  const maxHoras = Math.max(...semanasData.map(s => s.horas));

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
        {/* Header con información del psicólogo */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <BotonInicio />
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: 3
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Dr. Juan Pérez
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Psicólogo Clínico • Especialista en Terapia Cognitivo-Conductual
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Cédula Profesional: 1234567 • 10 años de experiencia
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tarjetas de estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Pacientes Activos */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#4caf50',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <PeopleIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Pacientes Activos
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#4caf50">
                  24
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  +3 desde el mes pasado
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Horas esta semana */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#2196f3',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <AccessTimeIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Horas Esta Semana
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#2196f3">
                  30
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  De 40 horas planificadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tendencia */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#ff9800',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}
                  >
                    <TrendingUpIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Promedio Mensual
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="bold" color="#ff9800">
                  28.5
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  horas por semana
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráfica de horas trabajadas */}
        <Card
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            p: 3
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Horas Trabajadas - Últimas 5 Semanas
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            {semanasData.map((item, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {item.semana}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {item.horas} hrs
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.horas / maxHoras) * 100}
                  sx={{
                    height: 12,
                    borderRadius: 2,
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: item.semana === 'Esta semana' 
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 100%)'
                    }
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Leyenda */}
          <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 20,
                  height: 12,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 100%)',
                  mr: 1
                }}
              />
              <Typography variant="body2">Semanas anteriores</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 20,
                  height: 12,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  mr: 1
                }}
              />
              <Typography variant="body2">Semana actual</Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default PerfilPsicologo;
