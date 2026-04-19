import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  auth as authApi,
  lender as lenderApi,
  getToken,
  setToken,
  removeToken,
  getLenderToken,
  setLenderToken,
  removeLenderToken,
} from "../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FarmerUser {
  id: string;
  name: string;
  phone: string;
  village?: string;
  state?: string;
  landsize?: number;
  cropTypes?: string[];
  agriTrustScore?: number;
  language?: string;
}

interface LenderUser {
  id: string;
  organizationName: string;
  contactPerson: string;
}

interface AuthContextType {
  // Farmer
  farmerUser: FarmerUser | null;
  isFarmerAuth: boolean;
  farmerLoading: boolean;
  farmerLogin: (phone: string, password: string) => Promise<void>;
  farmerRegister: (data: any) => Promise<void>;
  farmerLogout: () => Promise<void>;
  refreshFarmerProfile: () => Promise<void>;

  // Lender
  lenderUser: LenderUser | null;
  isLenderAuth: boolean;
  lenderLogin: (email: string, password: string) => Promise<void>;
  lenderRegister: (data: { organizationName: string; contactPerson: string; email: string; password: string; licenseNumber: string }) => Promise<void>;
  lenderLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [farmerUser, setFarmerUser] = useState<FarmerUser | null>(null);
  const [farmerLoading, setFarmerLoading] = useState(true);
  const [lenderUser, setLenderUser] = useState<LenderUser | null>(null);

  // On mount: check if farmer token exists and fetch the profile
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .getProfile()
        .then((data) => {
          setFarmerUser({
            id: data.farmer._id,
            name: data.farmer.name,
            phone: data.farmer.phone,
            village: data.farmer.village,
            state: data.farmer.state,
            landsize: data.farmer.landsize,
            cropTypes: data.farmer.cropTypes,
            agriTrustScore: data.farmer.agriTrustScore,
            language: data.farmer.language,
          });
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => setFarmerLoading(false));
    } else {
      setFarmerLoading(false);
    }

    // Also check lender
    const lToken = getLenderToken();
    if (lToken) {
      const saved = localStorage.getItem("kisantrust_lender_user");
      if (saved) {
        try {
          setLenderUser(JSON.parse(saved));
        } catch {
          removeLenderToken();
        }
      }
    }
  }, []);

  // -- Farmer auth ----------------------------------------------------------
  const farmerLogin = useCallback(async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    setToken(data.token);
    setFarmerUser({
      id: data.user.id,
      name: data.user.name,
      phone: data.user.phone,
    });
  }, []);

  const farmerRegister = useCallback(async (body: any) => {
    await authApi.register(body);
    // Auto-login after register
    await farmerLogin(body.phone, body.password);
  }, [farmerLogin]);

  const farmerLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors — still clear local state
    }
    removeToken();
    setFarmerUser(null);
  }, []);

  const refreshFarmerProfile = useCallback(async () => {
    const data = await authApi.getProfile();
    setFarmerUser({
      id: data.farmer._id,
      name: data.farmer.name,
      phone: data.farmer.phone,
      village: data.farmer.village,
      state: data.farmer.state,
      landsize: data.farmer.landsize,
      cropTypes: data.farmer.cropTypes,
      agriTrustScore: data.farmer.agriTrustScore,
      language: data.farmer.language,
    });
  }, []);

  // -- Lender auth ----------------------------------------------------------
  const lenderLogin = useCallback(async (email: string, password: string) => {
    const data = await lenderApi.login(email, password);
    setLenderToken(data.token);
    const user: LenderUser = {
      id: data.lender.id,
      organizationName: data.lender.organizationName,
      contactPerson: data.lender.contactPerson,
    };
    setLenderUser(user);
    localStorage.setItem("kisantrust_lender_user", JSON.stringify(user));
  }, []);

  const lenderRegister = useCallback(async (body: { organizationName: string; contactPerson: string; email: string; password: string; licenseNumber: string }) => {
    await lenderApi.register(body);
    // Auto-login after register
    await lenderLogin(body.email, body.password);
  }, [lenderLogin]);

  const lenderLogout = useCallback(() => {
    removeLenderToken();
    setLenderUser(null);
    localStorage.removeItem("kisantrust_lender_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        farmerUser,
        isFarmerAuth: !!farmerUser,
        farmerLoading,
        farmerLogin,
        farmerRegister,
        farmerLogout,
        refreshFarmerProfile,
        lenderUser,
        isLenderAuth: !!lenderUser,
        lenderLogin,
        lenderRegister,
        lenderLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
