import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta según tu estructura

const Cuestionario = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);

  const Cuestionarios = () => {
    return (
      <div>
        <h1>Cuestionarios</h1>
        <p>Bienvenido al módulo de cuestionarios.</p>
      </div>
    );
  };
  

  // Obtener el usuario autenticado
  const obtenerUsuario = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Error al obtener el usuario:', error);
      return null;
    }

    return session.user;
  };

  useEffect(() => {
    const fetchUsuario = async () => {
      const user = await obtenerUsuario();
      if (user) {
        setUsuarioId(user.id);
      }
    };

    fetchUsuario();
  }, []);

  const fetchPreguntas = async () => {
    try {
      const { data, error } = await supabase
        .from('preguntas')
        .select('id, texto, cuestionario_id, opciones');

      if (error) {
        console.error('Error al obtener preguntas:', error);
        return;
      }

      setPreguntas(data || []);
    } catch (error) {
      console.error('Error inesperado al obtener preguntas:', error);
    }
  };

  const guardarRespuestas = async () => {
    if (!usuarioId) {
      alert('No se pudo identificar al usuario. Por favor, inicia sesión.');
      return;
    }

    const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
      pregunta_id: parseInt(preguntaId),
      respuesta,
      usuario_id: usuarioId,
    }));

    try {
      const { error } = await supabase.from('respuestas').insert(respuestasArray);

      if (error) {
        console.error('Error al guardar respuestas:', error);
        alert('Hubo un error al guardar las respuestas.');
      } else {
        alert('¡Respuestas guardadas con éxito!');
      }
    } catch (error) {
      console.error('Error inesperado al guardar respuestas:', error);
    }
  };

  useEffect(() => {
    fetchPreguntas();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-7xl font-bold mb-4">Cuestionarios</h1>
      {preguntas.map((pregunta) => (
        <div key={pregunta.id} className="mb-6">
          <h2 className="text-2xl font-semibold">{pregunta.texto}</h2>
          <div className="mt-2">
            {pregunta.opciones?.map((opcion, index) => (
              <label key={index} className="block">
                <input
                  type="radio"
                  name={`pregunta-${pregunta.id}`}
                  value={opcion}
                  onChange={() => handleRespuestaChange(pregunta.id, opcion)}
                  className="mr-2"
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={guardarRespuestas} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Guardar Respuestas
      </button>
    </div>
  );
};

export default Cuestionario;
