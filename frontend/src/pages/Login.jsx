import React, { useState } from "react";
import axios from 'axios';
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert"
import BASE_API_URL from "../data";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { EMAIL_REGEX } from "../utils";
import { setToken } from "../Token";

const Login = () => {
  
  // To show alert
  const [showError, setShowError] = useState(false)
  const [showMessage, setShowMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  // Input focus states for animations
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  
  // Login success state for faster UI response
  const [loginSuccess, setLoginSuccess] = useState(false)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data)=>{
    try{
      const response = await axios.post(`${BASE_API_URL}/auth/login/`, data)
      
      setToken("accessToken", response.data.accesToken, 1440)
      localStorage.setItem('userType', response.data.user_type)
      localStorage.setItem('userId', response.data.user_id)
      localStorage.setItem('username', response.data.username)

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      // Show success state immediately for fast feel
      setLoginSuccess(true)
      
      // Quick navigation after brief success display
      setTimeout(() => {
        navigate('/')
      }, 400)
      
    }
    catch(error){
      
      setShowError(true)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Invalid credentials"
      setShowMessage(errorMsg)

    }
  }

  // Keyboard shortcut support (Enter to submit)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(onSubmit)()
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1749] via-[#2d1b69] to-[#6b2c91] px-4 relative overflow-hidden"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: Math.random() * 100 + 20 + 'px',
              height: Math.random() * 100 + 20 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>
      
      {/* Error Alert  */}
      <ErrorAlert show={showError} message={showMessage} onClose={()=>setShowError(false)} />
      <SuccessAlert message={showMessage} show={showSuccess} onClose={()=> setShowSuccess(false)}/>
      
      {/* Login Card */}
      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        
        {/* Logo */}
        <div className="flex justify-center mb-6 md:mb-8">
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            {/* Outer glow circle */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#5b9bd5] via-[#6b5dd5] to-[#7b4dc5] opacity-25 blur-xl"></div>
            
            {/* Main icon circle */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#5b9bd5] via-[#6b5dd5] to-[#8b3dc5] flex items-center justify-center shadow-2xl border-2 border-white border-opacity-30">
              
              {/* Modern Project Management Icon - Clipboard with Task Board */}
              <svg 
                width="52" 
                height="52" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-white drop-shadow-lg"
              >
                {/* Main clipboard/base */}
                <path 
                  d="M8 4h8c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                  fill="white" 
                  opacity="0.95"
                />
                
                {/* Top curved clip */}
                <path 
                  d="M12 2C11.4 2 11 2.4 11 3v1h2V3c0-.6-.4-1-1-1z" 
                  fill="white"
                />
                
                {/* Highlight on top */}
                <path 
                  d="M8 4h8v2H8V4z" 
                  fill="#5b9bd5" 
                  opacity="0.6"
                />
                
                {/* Task columns - 3 columns */}
                <line x1="11" y1="7" x2="11" y2="20" stroke="#5b9bd5" strokeWidth="1.2" opacity="0.5"/>
                <line x1="13" y1="7" x2="13" y2="20" stroke="#5b9bd5" strokeWidth="1.2" opacity="0.5"/>
                
                {/* Task items */}
                <circle cx="10" cy="9" r="1.2" fill="#4a8fc0"/>
                <rect x="8.5" y="10.5" width="3" height="1" rx="0.5" fill="#6ba6d5" opacity="0.7"/>
                <circle cx="12" cy="9.5" r="1" fill="#4a8fc0"/>
                <rect x="10.5" y="11" width="3" height="1" rx="0.5" fill="#6ba6d5" opacity="0.7"/>
                <rect x="10.5" y="12.5" width="2.5" height="1" rx="0.5" fill="#6ba6d5" opacity="0.7"/>
                <circle cx="14" cy="10" r="1" fill="#4a8fc0"/>
                <rect x="12.5" y="11.5" width="3" height="1" rx="0.5" fill="#6ba6d5" opacity="0.7"/>
                <line x1="9" y1="16" x2="15" y2="16" stroke="#5b9bd5" strokeWidth="1" opacity="0.4" strokeDasharray="2 2"/>
                <line x1="9" y1="18" x2="15" y2="18" stroke="#5b9bd5" strokeWidth="1" opacity="0.4" strokeDasharray="2 2"/>
              </svg>
            </div>
            
          {/* Animated pulse effect */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#6b5dd5] to-[#8b3dc5] opacity-0 animate-ping"></div>
        </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center tracking-tight">
          Login
        </h1>

        {/* Welcome Message */}
        <p className="text-white text-center text-xs md:text-sm opacity-90 leading-relaxed px-2">
          Welcome back! Please login to your account
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyPress} className="space-y-4">
          
          {/* Email Input */}
          <div className="relative group">
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-[#5b9bd5] to-[#9b5de5] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}></div>
            <input
              className={`relative w-full px-4 py-3 rounded-lg border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus-visible:ring-4 transition-all duration-300 ${
                emailFocused 
                  ? "border-[#5b9bd5] ring-[#5b9bd5] ring-opacity-50" 
                  : "border-[#6ba6d5]"
              } ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
              type="email"
              id="email"
              placeholder="Email address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              {...register("email", { 
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Email is not valid."
                } 
              })}
            />
            {errors.email && (
              <small className="text-red-300 text-xs mt-1 block flex items-center gap-1 animate-fade-in">
                <span>⚠️</span>
                {errors.email.message}
              </small>
            )}
            </div>

          {/* Password Input with Toggle */}
          <div className="relative group">
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-[#5b9bd5] to-[#9b5de5] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}></div>
              <input
              className={`relative w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus-visible:ring-4 transition-all duration-300 ${
                passwordFocused 
                  ? "border-[#5b9bd5] ring-[#5b9bd5] ring-opacity-50" 
                  : "border-[#6ba6d5]"
              } ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
              type={showPassword ? "text" : "password"}
                id="password"
              placeholder="Password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              {...register("password", {
                required: "Password is required", 
                minLength: {
                  value: 2, 
                  message: "Password must be at least 2 characters."
                }
              })}
              />
            {/* Password Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity duration-200 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {errors.password && (
              <small className="text-red-300 text-xs mt-1 block flex items-center gap-1 animate-fade-in">
                <span>⚠️</span>
                {errors.password.message}
              </small>
            )}
            </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#6ba6d5] text-[#5b9bd5] focus:ring-[#5b9bd5] focus:ring-2 cursor-pointer"
              />
              <span className="text-white opacity-90 group-hover:opacity-100 transition-opacity">
                Remember me
              </span>
            </label>
            </div>

          {/* Login Button with Loading Spinner */}
          <button
            type="submit"
            disabled={isSubmitting || loginSuccess}
            className={`relative w-full py-3.5 rounded-lg bg-gradient-to-r from-[#5b9bd5] via-[#7b6bd5] to-[#9b5de5] text-white font-semibold text-lg shadow-lg overflow-hidden group ${
              isSubmitting 
                ? "opacity-50 cursor-wait" 
                : loginSuccess
                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                : "hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98] hover:from-[#4a8fc0] hover:via-[#6a5bc0] hover:to-[#8a4dd0]"
            } transition-all duration-200`}
          >
            {/* Animated background shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
            
            {/* Button content */}
            <span className="relative flex items-center justify-center gap-2">
              {loginSuccess ? (
                <>
                  {/* Success Checkmark */}
                  <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Success!
                </>
              ) : isSubmitting ? (
                <>
                  {/* Loading Spinner */}
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          </form>

        {/* Forgot Password Link */}
        <div className="text-center">
          <a 
            href="#" 
            className="text-white text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 group"
            onClick={(e) => {
              e.preventDefault();
              // Handle forgot password logic here
            }}
          >
            <span>Forgot password?</span>
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {/* Bottom Info */}
        <div className="pt-4 text-center">
          <p className="text-white text-xs opacity-50">
            Project Management System v1.0
          </p>
        </div>

      </div>
      
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#2d1b69] to-transparent opacity-15 rounded-br-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#6b2c91] to-transparent opacity-15 rounded-tl-full blur-3xl"></div>
    </div>
  );
};

export default Login;
