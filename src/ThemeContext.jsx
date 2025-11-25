import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem('modoOscuro');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  const toggleModoOscuro = () => {
    setModoOscuro(prev => !prev);
  };

  const theme = {
    modoOscuro,
    toggleModoOscuro,
    // Fondo: modo oscuro con degradado, modo claro mantiene la imagen
    fondo: modoOscuro
      ? { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }
      : {
          backgroundImage: `url('/src/assets/fondo-menu.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        },
    // Overlay para el fondo (solo en modo claro)
    overlay: modoOscuro ? null : {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 0,
    },
    fondoSecundario: modoOscuro
      ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colorTexto: modoOscuro ? '#e2e8f0' : '#1a202c',
    colorCard: modoOscuro ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    colorPaper: modoOscuro ? 'rgba(26, 32, 44, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    colorHover: modoOscuro ? 'rgba(66, 153, 225, 0.1)' : 'rgba(102, 126, 234, 0.1)',
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
