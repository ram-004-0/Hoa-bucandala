import AuthCard from "../props/AuthCard";
import BgImage from "../assets/loginpagelogo.png";

const Login = () => {
  return (
    <div className="flex h-[100vh] w-full overflow-hidden bg-white">
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex lg:w-7/12 relative bg-[#00704e] items-center justify-center overflow-hidden">
        <div
          className="w-4/5 h-full bg-contain bg-no-repeat bg-center relative z-20"
          style={{ backgroundImage: `url(${BgImage})` }}
        ></div>

        {/* Decorative Overlays */}
        <div className="absolute inset-0 bg-linear-to-br from-black/20 via-transparent to-black/20 z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl z-0"></div>
      </div>

      {/* RIGHT SIDE: Authentication Portal */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center relative p-6 md:p-12 bg-[#fbfbfb]">
        {/* Subtle Background Grid */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Portal Container */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <AuthCard />
            </div>
          </div>

          <p className="text-center mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Camella Bucandala V &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
