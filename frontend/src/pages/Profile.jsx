
import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import {
  Breadcrumbs,
  Grid2,
  Link,
  Typography,
} from "@mui/material";
import axios from 'axios';
import BASE_API_URL from '../data';
import { getToken } from '../Token';

const Profile = () => {
  const [profileData, setProfileData] = useState()

  // To fetch the profile data
  const getProfileData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfileData(response.data);
        // console.log("ProfileDataL:",response.data)
      }
    } catch (error) {
      // console.error(error)
    }
  };

  // Use Effect 
  useEffect(() => {
    getProfileData();
  }, []);

  // Add this block right here
  if (!profileData) {
    return (
      <div>
        <div className="text-center mt-10 text-lg font-semibold">
          Loading profile...
        </div>
      </div>
    );
  }

  // Helper to get full image URL or default image
  const getImageUrl = () => {
    if (!profileData?.profile_image) {
      return "/lisa.png";
    }
    return profileData.profile_image.startsWith("http")
      ? profileData.profile_image
      : `${BASE_API_URL}${profileData.profile_image}`;
  };

  return (

    <div>
      <div className=''>
        <div className=' mt-0'>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">Dashboard</Link>
            <Typography sx={{ color: "text.primary" }}>Profile</Typography>
          </Breadcrumbs>
        </div>

        <div className="h-fit overflow-scroll  no-scrollbar grid items-center  ">
          <div className='  mt-5'>
            {/* Page Title */}
            <Typography variant="h5" className="font-bold mb-6">Profile</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Grid2 container spacing={2} >

                {/* top card */}
                <div className='w-full mt-5 p-2'>
                  <Grid2 columns={{ xs: 12, md: 4 }} container className=" bg-white border border-gray-300 rounded-2xl p-6 flex items-center space-x-6  shadow-[2px_2px_8px_2px] shadow-gray-200">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={getImageUrl()}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/lisa.png";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Typography variant="h6" className="font-semibold">{profileData?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{profileData?.user?.user_type}</Typography>
                      <Typography variant="body2" color="text.secondary">{profileData?.address}</Typography>
                    </div>
                  </Grid2>
                </div>

                {/* Personal Info */}
                <div className='w-full p-2'>
                  <Grid2 columns={{ xs: 12, md: 6 }} className="bg-white border border-gray-300 rounded-2xl p-6 mt-4 space-x-6 shadow-[2px_2px_8px_2px] shadow-gray-200">
                    <Typography variant="subtitle4" className="font-bold mb-4">Personal information</Typography>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-gray-800">Full Name</p>
                        <p>{profileData?.name}</p>
                      </div>

                      <div>
                        <p className="text-gray-800">Email address</p>
                        <p>{profileData?.user.email}</p>
                      </div>

                      <div>
                        <p className="text-gray-800">Phone</p>
                        <p>{profileData?.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">Gender</p>
                        <p>{profileData?.gender}</p>
                      </div>
                    </div>
                  </Grid2>
                </div>

                {/* Address */}
                <div className='w-full p-2'>
                  <Grid2 columns={{ xs: 12, md: 6 }} className="bg-white border border-gray-300 rounded-2xl p-6 mt-4 shadow-[2px_2px_8px_2px] shadow-gray-200">
                    <Typography variant="subtitle4" className="font-bold mb-4">Address</Typography>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-gray-800">Address</p>
                        <p>{profileData?.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">Country</p>
                        <p>{profileData?.country}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">State</p>
                        <p>{profileData?.state}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">PinCode</p>
                        <p>{profileData?.pincode}</p>
                      </div>
                    </div>
                  </Grid2>
                </div>
              </Grid2>
            </Box>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;