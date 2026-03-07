import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  toggleTheme: () => void;
  permissions: Record<string, boolean>;
  updatePermission: (module: string, allowed: boolean) => void;
  isAdmin: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#10b981';
  });

  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('modulePermissions');
    return saved ? JSON.parse(saved) : {
      family: true,
      finance: true,
      calendar: true,
      contacts: true,
    };
  });

  // For demo purposes, we'll assume the user is an admin if they can access settings
  // In a real app, this would come from auth state
  const [isAdmin] = useState(true);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    // Also update teal if we want it to follow primary color
    document.documentElement.style.setProperty('--color-teal', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('modulePermissions', JSON.stringify(permissions));
  }, [permissions]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updatePermission = (module: string, allowed: boolean) => {
    setPermissions(prev => ({ ...prev, [module]: allowed }));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      primaryColor, 
      setPrimaryColor, 
      toggleTheme,
      permissions,
      updatePermission,
      isAdmin
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
