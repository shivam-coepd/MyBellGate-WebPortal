"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, AlertCircle, Calendar, CreditCard, Megaphone, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
const logo = '/assets/mygatebell_logo.png';

const Login: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(phone, password);

      // Redirect based on role
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "super_admin") {
          navigate.push("/super-admin/dashboard");
        } else if (user.role === "admin") {
          navigate.push("/admin/dashboard");
        } else {
          navigate.push("/login");
          setError(
            "This portal is for administrators only. Please use the mobile app.",
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.15)), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920&auto=format&fit=crop')` }}>

      {/* Header / Navbar */}
      <header className="w-full px-12 py-6 flex justify-end items-center space-x-8 text-sm font-medium text-gray-700 z-10 bg-white/60 backdrop-blur-sm shadow-sm">
        <a href="/" className="hover:text-blue-600 transition">Home</a>
        <a href="/about" className="hover:text-blue-600 transition">About</a>
        <a href="/contact" className="hover:text-blue-600 transition">Contact</a>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">

          {/* Left Column: Interactive Form */}
          <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
            {/* Logo and Brand Heading */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <img src={logo} alt="logo" width={32} height={32} />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-800 block">MyGateBell</span>
                <span className="text-[10px] text-gray-400 tracking-wider block -mt-1 font-semibold">Seamless Community Living</span>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome Back!</h1>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">Sign in to manage your community</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Field */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 transition"
                    placeholder="Username/Email or Phone"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 transition"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Utilities */}
              <div className="flex items-center justify-between text-xs font-medium px-1">
                <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
                <label className="flex items-center space-x-1.5 cursor-pointer text-gray-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-container text-white py-3 rounded-xl hover:bg-bg-primary-container transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center space-x-1 mt-6 shadow-md shadow-blue-500/10"
              >
                <span>{loading ? "SIGNING IN..." : "SIGN IN"}</span>
                {!loading && <ArrowUpRight className="w-4 h-4" />}
              </button>
            </form>

            {/* <div className="mt-6 text-center text-xs text-gray-500">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-500 font-semibold hover:underline">
                Request Access
              </a>
            </div> */}
          </div>

          {/* Right Column: Promotional Branding Layout (Occupies 5 columns always) */}
          <div className="col-span-5 bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 lg:p-8 flex flex-col justify-between items-center text-center border-l border-gray-100">

            {/* Features Array */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4 w-full mt-4 lg:mt-8">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-500 border border-slate-100">
                  <Calendar className="w-4 h-4 lg:w-5 h-5" />
                </div>
                <span className="text-[9px] lg:text-[11px] font-medium text-gray-600 mt-2">Calendar</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 border border-slate-100">
                  <CreditCard className="w-4 h-4 lg:w-5 h-5" />
                </div>
                <span className="text-[9px] lg:text-[11px] font-medium text-gray-600 mt-2">Payment</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-400 border border-slate-100">
                  <Megaphone className="w-4 h-4 lg:w-5 h-5" />
                </div>
                <span className="text-[9px] lg:text-[11px] font-medium text-gray-600 mt-2">Announcements</span>
              </div>
            </div>

            {/* Illustration/Image Display Area */}
            <div className="my-4 relative w-full aspect-square max-w-[140px] lg:max-w-[280px] bg-white rounded-full p-2 shadow-inner border border-slate-100 overflow-hidden flex items-center justify-center">
              <img
                src="https://i.pinimg.com/736x/96/1b/7a/961b7ad666b29c2f6bdc30c54987e1b0.jpg"
                alt="Community Lifestyle Representation"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Sub-tagline */}
            <div className="mb-2 lg:mb-4">
              <p className="text-xs lg:text-sm font-semibold text-gray-800 tracking-wide">Simplify your society life</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Details */}
      <footer className="w-full px-12 py-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 bg-white/70 backdrop-blur-xs border-t border-gray-200/50 z-10">
        <div className="flex space-x-4 mb-2 sm:mb-0">
          <a href="privacy-policy" className="hover:underline">Terms & Policy</a>
        </div>
        <div>
          <span>© 2026 MyGateBell</span>
        </div>
      </footer>

    </div>
  );
};

export default Login;


// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Lock, Phone, AlertCircle } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";

// const Login: React.FC = () => {
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await login(phone, password);

//       // Redirect based on role
//       const userStr = localStorage.getItem("user");
//       if (userStr) {
//         const user = JSON.parse(userStr);
//         if (user.role === "super_admin") {
//           navigate.push("/super-admin/dashboard");
//         } else if (user.role === "admin") {
//           navigate.push("/admin/dashboard");
//         } else {
//           // Guards and residents use the mobile app — show a friendly message
//           navigate.push("/login");
//           setError(
//             "This portal is for administrators only. Please use the MyGate mobile app.",
//           );
//         }
//       }
//     } catch (err: any) {
//       setError(err.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">MyGate</h1>
//           <p className="text-gray-600 mt-2">Admin Portal Login</p>
//         </div>

//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <span className="text-red-700 text-sm">{error}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label
//               htmlFor="phone"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Phone Number
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="tel"
//                 id="phone"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter phone number"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter password"
//                 required
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{" "}
//             <a href="/register" className="text-blue-500 hover:text-blue-600">
//               Register
//             </a>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t">
//           <p className="text-xs text-gray-500 text-center">
//             For demo purposes, use your registered phone number and password
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
