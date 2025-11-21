import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import BotonInicio from './BotonInicio';

const Agenda = () => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [hora, setHora] = useState("");
  const [citas, setCitas] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndCitas = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error obteniendo el usuario:", error);
        return;
      }

      setUserId(user.id);
      fetchCitas(user.id);
    };

    fetchUserAndCitas();
  }, []);

  const fetchCitas = async (psicologo_id) => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("psicologo_id", psicologo_id)
      .order("hora", { ascending: true });

    if (error) {
      console.error("Error obteniendo citas:", error);
    } else {
      setCitas(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !telefono || !hora) {
      alert("Completa todos los campos.");
      return;
    }

    const { error } = await supabase.from("citas").insert([
      {
        nombre,
        telefono,
        hora,
        psicologo_id: userId,
      },
    ]);

    if (error) {
      console.error("Error agendando cita:", error);
    } else {
      setNombre("");
      setTelefono("");
      setHora("");
      fetchCitas(userId);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Agendar nueva cita
          </Typography>
          <BotonInicio />
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre del paciente"
            fullWidth
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <TextField
            label="Hora de la cita"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Guardar Cita
          </Button>
        </form>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        Citas agendadas
      </Typography>
      <List>
        {citas.map((cita) => (
          <ListItem key={cita.id} divider>
            <ListItemText
              primary={`${cita.nombre} - ${new Date(cita.hora).toLocaleString()}`}
              secondary={`Tel: ${cita.telefono}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Agenda;
