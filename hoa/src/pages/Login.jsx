import AuthCard from "../props/AuthCard";
import BgImage from "../assets/loginpagelogo.png";

const Login = () => {
  return (
    // h-screen and overflow-hidden prevent the extra space below
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex lg:w-7/12 relative bg-[#00704e] overflow-hidden">
        {/* Changed bg-cover to bg-contain if you want to see the WHOLE logo 
            without cropping. Added bg-no-repeat and bg-center.
        */}
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-center m-12"
          style={{ backgroundImage: `url(${BgImage})` }}
        ></div>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-[#00704e]/20 via-transparent to-black/10 z-10"></div>

        {/* Modern Glow Shape */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl z-20"></div>
      </div>

      {/* RIGHT SIDE: Authentication Portal */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center relative p-6 md:p-12 bg-gray-50 overflow-y-auto">
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
        <div className="w-full max-w-md relative z-10 py-8">
          <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,112,78,0.05)] border border-gray-100">
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <AuthCard />
            </div>
          </div>

          <p className="text-center mt-8 text-xs text-gray-400 font-bold uppercase tracking-widest">
            Camella Bucandala V &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
