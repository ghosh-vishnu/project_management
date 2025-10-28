import React, { useState } from "react";
import axios from 'axios';
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert"
import BASE_API_URL from "../data";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { EMAIL_REGEX } from "../utils";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import { setToken } from "../Token";


const Login = () => {
  
  // To show alert
  const [showError, setShowError] = useState(false)
  const [showMessage, setShowMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()


  const onSubmit = async (data)=>{
    try{
      const response = await axios.post(`${BASE_API_URL}/auth/login/`, data)
      
      setToken("accessToken", response.data.accesToken, 1440)
      localStorage.setItem('userType', response.data.user_type)
      localStorage.setItem('userId', response.data.user_id)
      localStorage.setItem('username', response.data.username)

      // Instant login - no delay!
      navigate('/')
      
    }
    catch(error){
      
      setShowError(true)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Invalid credentials"
      setShowMessage(errorMsg)

    }
  }

  

  return (
    <div className="flex items-center justify-center min-h-screen  bg-[#171b5b]">
      {/* Error Alert  */}
      <ErrorAlert show={showError} message={showMessage} onClose={()=>setShowError(false)} ></ErrorAlert>
      <SuccessAlert message={showMessage} show={showSuccess} onClose={()=> setShowSuccess(false)}/>
      <div className="w-full max-w-md p-6 bg-[white] rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login </h2>
        <div className="login-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <label htmlFor="Username">Email</label>
            </div>
            <div className=" mt-1">
              <input
                className={`w-full ${errors.email? "border-[var(--error1)_!important] " :" "}` }
                type="email"
                id="email"
                required
                placeholder="Enter your email"
                {...register("email", 
                  { pattern:{
                    value:EMAIL_REGEX,
                    message: "Email is not valid."
                } })}
                />
                {errors.email && <small className="text-red-600">{errors.email.message}</small> }
            </div>
            

            <div className=" mt-4">
              <label htmlFor="password">Password</label>
            </div>
            <div className="space-x-4 mt-1">
              <input
                className={`w-full ${errors.password? "border-[var(--error1)_!important] " :" "}` }
                type="password"
                id="password"
                required
                placeholder="Enter your password"
                {...register("password", {required: true, minLength:{
                  value:2, message: "Length should be more than 2."
                }
              })}
              />
              {errors.password && <small className="text-red-600">{errors.password.message}</small> }
            </div>
            <br></br>
            <div className="flex justify-center   ">
              <PrimaryBtn type={"Submit"} disabled={isSubmitting} className={`${isSubmitting ?" cursor-wait  ": "" }`}>
                {isSubmitting ? "Submitting": "Submit"}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
