import AuthCard from "../props/AuthCard";
import { Building2 } from "lucide-react";
import BgImage from "../assets/loginpagelogo.png";

const Login = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* LEFT SIDE: Brand & Image (Hidden on small screens) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-12 text-white bg-[#00704e] bg-cover bg-center"
        style={{ backgroundImage: `url(${BgImage})` }}
      >
        {/* Dark Overlay for branding readability */}
        <div className="absolute inset-0 bg-[#00704e]/60 z-0"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-6 border border-white/20">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Camella Bucandala V
          </h1>
          <p className="text-xl font-medium opacity-90 tracking-wide uppercase text-yellow-400">
            Homeowners Association
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: AuthCard */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#fbfbfb]">
        {/* Mobile-only branding (shows when the left side is hidden) */}
        <div className="lg:hidden flex flex-col items-center mb-8 text-[#00704e]">
          <Building2 className="w-10 h-10 mb-2" />
          <h1 className="font-black text-xl text-center">
            Camella Bucandala V
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            Homeowners Association
          </p>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          <AuthCard />
        </div>
      </div>
    </div>
  );
};

export default Login;
