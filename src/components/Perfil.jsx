import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Rating,
  Typography,
  Chip
} from '@mui/material';

const PerfilPsicologo = () => {
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: 3, boxShadow: 3 }}>
      <Grid container spacing={3}>
        {/* Avatar y datos básicos */}
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Avatar
            alt="Dra. Ana López"
            src="/ruta-al-avatar.jpg" // Cambia esto a una URL real o elimina el src
            sx={{ width: 120, height: 120 }}
          />
        </Grid>

        {/* Info del perfil */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" fontWeight="bold">
            Dra. Ana López
          </Typography>
          <Typography color="text.secondary">
            Psicóloga Clínica • CDMX
          </Typography>
          <Rating value={4.5} precision={0.5} readOnly sx={{ mt: 1 }} />
          <Box mt={2}>
            <Button variant="contained" color="primary">
              Contactar
            </Button>
          </Box>
        </Grid>

        {/* Descripción y especialidades */}
        <Grid item xs={12}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Soy una psicóloga con más de 10 años de experiencia en el tratamiento de ansiedad, depresión y desarrollo personal. Trabajo con adolescentes y adultos mediante terapia cognitivo-conductual.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Especialidades
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Ansiedad" />
              <Chip label="Depresión" />
              <Chip label="Terapia de pareja" />
              <Chip label="Autoestima" />
              <Chip label="Crisis existenciales" />
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default PerfilPsicologo;
