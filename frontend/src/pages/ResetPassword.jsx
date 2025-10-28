import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import BASE_API_URL from "../data";
import { getToken } from "../Token";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states
  const [focused, setFocused] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError("");
    setShowError(false);
    setShowSuccess(false);
    
    // Validation
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setShowError(true);
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setShowError(true);
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get user_id from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError("Please login first.");
        setShowError(true);
        setErrorMessage("Please login first.");
        setIsSubmitting(false);
        return;
      }
      
      // Get authentication token
      const token = getToken("accessToken");
      
      const config = {
        headers: {}
      };
      
      if (token) {
        config.headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await axios.post(
        `${BASE_API_URL}/auth/reset-password/`, 
        {
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword
        },
        config
      );
      
      // Success
      setShowSuccess(true);
      setErrorMessage("Password has been reset successfully!");
      
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to reset password. Please try again.";
      setError(errorMsg);
      setShowError(true);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1749] via-[#2d1b69] to-[#6b2c91] px-4 relative overflow-hidden"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: Math.random() * 80 + 20 + 'px',
              height: Math.random() * 80 + 20 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>
      
      {/* Error Alert */}
      <ErrorAlert show={showError} message={errorMessage} onClose={() => setShowError(false)} />
      
      {/* Success Alert */}
      <SuccessAlert message={errorMessage} show={showSuccess} onClose={() => setShowSuccess(false)} />
      
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Reset Password
            </h2>
          </div>
          <button
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Old Password</label>
            <div className="relative group">
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-[#5b9bd5] to-[#9b5de5] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}></div>
              <input
                type={showOldPassword ? "text" : "password"}
                className="relative w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus-visible:ring-4 transition-all duration-300"
                style={{
                  borderColor: focused.old ? '#5b9bd5' : '#6ba6d5',
                }}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                onFocus={() => setFocused(prev => ({ ...prev, old: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, old: false }))}
                placeholder="Enter your old password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                {showOldPassword ? (
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
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">New Password</label>
            <div className="relative group">
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-[#5b9bd5] to-[#9b5de5] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}></div>
              <input
                type={showNewPassword ? "text" : "password"}
                className="relative w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus-visible:ring-4 transition-all duration-300"
                style={{
                  borderColor: focused.new ? '#5b9bd5' : '#6ba6d5',
                }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocused(prev => ({ ...prev, new: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, new: false }))}
                placeholder="Enter your new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                {showNewPassword ? (
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
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Confirm Password</label>
            <div className="relative group">
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-[#5b9bd5] to-[#9b5de5] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}></div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="relative w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus-visible:ring-4 transition-all duration-300"
                style={{
                  borderColor: focused.confirm ? '#5b9bd5' : '#6ba6d5',
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused(prev => ({ ...prev, confirm: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, confirm: false }))}
                placeholder="Confirm your new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                {showConfirmPassword ? (
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
            </div>
          </div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full py-3.5 rounded-lg bg-gradient-to-r from-[#5b9bd5] via-[#7b6bd5] to-[#9b5de5] text-white font-semibold text-lg shadow-lg overflow-hidden group ${
              isSubmitting 
                ? "opacity-50 cursor-wait" 
                : "hover:shadow-2xl hover:shadow-purple-500/50"
            } transition-all duration-200`}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
            <span className="relative flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </motion.button>
        </form>
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#5b9bd5] to-transparent opacity-10 rounded-br-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#9b5de5] to-transparent opacity-10 rounded-tl-full blur-3xl"></div>
      </motion.div>
    </div>
  );
}

