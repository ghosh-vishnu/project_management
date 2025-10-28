// import { useState } from "react";
// import PrimaryBtn from "../components/Buttons/PrimaryBtn";

// export default function ResetPassword() {
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) {
//       setError("New password and confirm password do not match.");
//       return;
//     }
//     setError("");
//     alert("Password has been reset successfully!");
//   };

//   const handleOpen = () => {
//     setOpen(true);
//   };
//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>
//         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Old Password</label>
//             <input
//               type="password"
//               className="w-full p-2 border rounded"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">New Password</label>
//             <input
//               type="password"
//               className="w-full p-2 border rounded"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Confirm Password</label>
//             <input
//               type="password"
//               className="w-full p-2 border rounded"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div >
//           <div className="flex justify-center">
//           <PrimaryBtn type={'submit'} onClick={handleOpen}>
//          Reset Password
//         </PrimaryBtn>
//           </div>
        
           
          
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";


export default function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setError("");
    alert("Password has been reset successfully!");
  };
  
  const handleOpen = () => {
        setOpen(true);
      };
      const handleClose = () => {
        setOpen(false);
      };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-700">🔐 Reset Password</h2>
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-center">
          <PrimaryBtn type={'submit'} onClick={handleOpen}>
         Reset Password
        </PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  );
}

