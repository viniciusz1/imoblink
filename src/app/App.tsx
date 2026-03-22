import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginScreen } from './components/login-screen';
import { PropertiesScreen } from './components/properties-screen';
import { DashboardScreen } from './components/dashboard-screen';
import { ThemeProvider } from './components/theme-provider';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/imoblink">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/imoveis" element={<PropertiesScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
