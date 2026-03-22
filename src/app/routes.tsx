import { createBrowserRouter } from "react-router-dom";
import { LoginScreen } from "./components/login-screen";
import { PropertiesScreen } from "./components/properties-screen";
import { DashboardScreen } from "./components/dashboard-screen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginScreen,
  },
  {
    path: "/imoveis",
    Component: PropertiesScreen,
  },
  {
    path: "/dashboard",
    Component: DashboardScreen,
  },
]);