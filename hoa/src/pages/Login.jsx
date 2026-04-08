import AuthCard from "../props/AuthCard";
import {} from "react-router-dom";
import { Building2 } from "lucide-react";

const Login = () => {
  return (
    <div className="bg-[#00704e] h-screen flex-col content-center justify-center items-center flex gap-6 text-white">
      <Building2 className="w-8 h-8"></Building2>
      <h1 className="font-bold">Camella Bucandala V</h1>
      <h1>Homeowners Association</h1>
      <AuthCard />
    </div>
  );
};

export default Login;
