import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import fondoMenu from '../assets/fondo-menu.png';

const CuestionariosDisponibles = () => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  const cargarCuestionarios = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('cuestionarios')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setCuestionarios(data || []);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
      setError('No se pudieron cargar los cuestionarios');
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarCuestionario = (id) => {
    navigate(`/responder-cuestionario/${id}`);
  };

  if (cargando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Cuestionarios Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Selecciona un cuestionario para responder
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {cuestionarios.length === 0 ? (
          <Box
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No hay cuestionarios disponibles en este momento
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cuestionarios.map((cuestionario) => (
              <Grid item xs={12} sm={6} md={4} key={cuestionario.id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSeleccionarCuestionario(cuestionario.id)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon
                          sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                        />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {cuestionario.Titulo}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {cuestionario.Descripcion || 'Sin descripción'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CuestionariosDisponibles;
