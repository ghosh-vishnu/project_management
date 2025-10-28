import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import BASE_API_URL from "../data";
import { getToken } from "../Token";

export default function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      {/* Error Alert */}
      <ErrorAlert show={showError} message={errorMessage} onClose={() => setShowError(false)} />
      
      {/* Success Alert */}
      <SuccessAlert message={errorMessage} show={showSuccess} onClose={() => setShowSuccess(false)} />
      
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-700 flex items-center gap-2">
            🔐 Reset Password
          </h2>
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <PrimaryBtn 
              type={'submit'} 
              disabled={isSubmitting}
              className={isSubmitting ? "cursor-wait opacity-50" : ""}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  );
}

