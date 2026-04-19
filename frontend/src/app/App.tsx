import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import CustomCursor from "./components/CustomCursor";
import L from "leaflet";

// Fix Leaflet's default icon path issues with bundlers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CustomCursor />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
