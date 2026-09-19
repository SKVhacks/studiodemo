import { createContext, useContext, useState } from "react";
import API from "../api/axios";
import { GetEmployee } from "../api/EmployeeServices";

const AuthContext = createContext();

const getEmpDetail = async (id) => {
  try {
    const res = await GetEmployee(id);
    return res.data;   
  } catch (err) {
    console.log("Detail error:", err);
    return null;
  }
};

export const AuthProvider = ({ children }) => {

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access") || null
  );
  const [role, setRole] = useState(
    localStorage.getItem("role") || null
  );
  const [name, setName] = useState(
    localStorage.getItem("name") || null
  );
  const [Gmail, setGmail] = useState(
    localStorage.getItem("Gmail") || null
  );
  const [userID, setuserId] = useState(
    localStorage.getItem("userId") || null
  );
  const [profile, setProfile] = useState(
    localStorage.getItem("pic") || null
  )
  const [phone, setPhone] = useState(
    localStorage.getItem("phone") || null
  )

  // ✅ login is async so we can await getEmpDetail
  const login = async (token, refresh, userRole, id , name , Gmail) => {
    setAccessToken(token);
    setRole(userRole);
    setuserId(id);
    localStorage.setItem("access", token);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userId", id);

    const temp = await getEmpDetail(id);
    if (temp) {
        setName(temp.full_name);         // matches your API response field
        setGmail(temp.email);
        setProfile(temp.picture);
        setPhone(temp.phone);
        localStorage.setItem("pic", temp.picture);
        localStorage.setItem("name", temp.full_name);
        localStorage.setItem("Gmail", temp.email);
        localStorage.setItem("phone", temp.phone);
    }
  };

  // 🔹 LOGOUT
  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await API.post("/auth/logout/", { refresh });
      }
    } catch (err) {
      console.log("Logout error:", err.response?.status, err.response?.data);
    } finally {
      setAccessToken(null);
      setRole(null);
      setName(null);
      setGmail(null);
      setuserId(null);
      setProfile(null);
      setPhone(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const updateProfileDetail = async(full_name , id) => {
    const temp = await getEmpDetail(id);
    console.log(temp);
    
    if (temp) {
      setProfile(temp.picture);
      setName(temp.full_name);
      setPhone(temp.phone);
      localStorage.setItem("pic", temp.picture);
      localStorage.setItem("name", temp.full_name);
      localStorage.setItem("phone", temp.phone);
    }else{
    setName(full_name);
    localStorage.setItem("name", full_name);
    }
  };
  return (
    <AuthContext.Provider value={{ accessToken, role, name, Gmail, profile, userID, login, logout, updateProfileDetail , phone }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);