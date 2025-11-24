import React, { useEffect, useState } from 'react';
import {
  Breadcrumbs,
  Grid2,
  Link,
  Typography,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BASE_API_URL from '../data';
import { getToken } from '../Token';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MapIcon from '@mui/icons-material/Map';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [inlineValues, setInlineValues] = useState({
    designation: '',
    department: '',
    organization: '',
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Fetch employee profile data
  const getProfileData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error('No access token found');
        const username = localStorage.getItem('username') || 'User';
        setProfileData({
          name: username,
          user: {
            email: localStorage.getItem('email') || '',
            user_type: 'User'
          }
        });
        return;
      }

      try {
        const profileResponse = await axios.get(`${BASE_API_URL}/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfileData(profileResponse.data);

        try {
          const employeesRes = await axios.get(`${BASE_API_URL}/peoples/employees/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page_size: 100 },
          });
          const userEmail = profileResponse.data?.user?.email;
          const userId = profileResponse.data?.user?.id;
          const emp = employeesRes.data?.results?.find((e) => (e.user?.email === userEmail) || (e.user?.id === userId));
          if (emp) {
            setEmployeeData(emp);
            // Set banner image from employee data (from /peoples/employees/ API)
            if (emp.documents?.banner_image) {
              setBannerImage(emp.documents.banner_image);
            }
          } else {
            // Fallback to profile data
            if (profileResponse.data.department || profileResponse.data.designation || profileResponse.data.organization) {
              setEmployeeData(profileResponse.data);
              // Set banner image from profile data (from /auth/profile/ API)
              if (profileResponse.data.documents?.banner_image) {
                setBannerImage(profileResponse.data.documents.banner_image);
              }
            }
          }
        } catch (empErr) {
          // Fallback to profile data on error
          if (profileResponse.data.department || profileResponse.data.designation || profileResponse.data.organization) {
            setEmployeeData(profileResponse.data);
            // Set banner image from profile data
            if (profileResponse.data.documents?.banner_image) {
              setBannerImage(profileResponse.data.documents.banner_image);
            }
          }
        }
        
        // Also check profileResponse directly for banner_image (in case employee fetch fails)
        if (profileResponse.data?.documents?.banner_image && !bannerImage) {
          setBannerImage(profileResponse.data.documents.banner_image);
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        const username = localStorage.getItem('username') || 'User';
        setProfileData({
          name: username,
          user: {
            email: localStorage.getItem('email') || '',
            user_type: 'User'
          }
        });
      }

      setRecentTasks([
        {
          id: 1,
          type: 'subtask',
          title: 'Subtask 2.1',
          project: 'My Scrum Project',
          createdAt: 'today',
        },
        {
          id: 2,
          type: 'task',
          status: 'completed',
          title: 'Task 3',
          project: 'My Scrum Project',
          createdAt: 'today',
        },
        {
          id: 3,
          type: 'task',
          status: 'bookmarked',
          title: 'Task 2',
          project: 'My Scrum Project',
          createdAt: 'today',
        },
        {
          id: 4,
          type: 'task',
          status: 'completed',
          title: 'Task 1',
          project: 'My Scrum Project',
          createdAt: 'today',
        },
      ]);
    } catch (error) {
      console.error('Error in getProfileData:', error);
      const username = localStorage.getItem('username') || 'User';
      setProfileData({
        name: username,
        user: {
          email: localStorage.getItem('email') || '',
          user_type: 'User'
        }
      });
    }
  };

  useEffect(() => {
    const designation = employeeData?.designation || profileData?.designation || '';
    const department = employeeData?.department || profileData?.department || '';
    const organization = employeeData?.organization || profileData?.organization || '';
    setInlineValues({ designation, department, organization });
  }, [employeeData, profileData]);

  const ensureEmployeeId = async () => {
    if (employeeId) return employeeId;
    try {
      const accessToken = getToken('accessToken');
      const res = await axios.get(`${BASE_API_URL}/peoples/employees/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page_size: 100 },
      });
      const userEmail = profileData?.user?.email;
      const emp = res.data?.results?.find((e) => e.user?.email === userEmail);
      if (emp?.id) {
        setEmployeeId(emp.id);
        return emp.id;
      }
    } catch (e) {
      console.error('Failed to get employee id', e);
    }
    return null;
  };

  const saveInlineField = async (fieldKey) => {
    const id = await ensureEmployeeId();
    if (!id) return;
    try {
      setIsSavingInline(true);
      const accessToken = getToken('accessToken');
      const url = `${BASE_API_URL}/auth/user-profile/`;
      const payload = { [fieldKey]: inlineValues[fieldKey] };
      await axios.put(url, payload, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setEmployeeData((prev) => ({ ...(prev || {}), [fieldKey]: inlineValues[fieldKey] }));
      await getProfileData();
      setToast({ open: true, message: `${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} saved`, severity: 'success' });
    } catch (e) {
      console.error('Failed to update field', fieldKey, e?.response?.data || e.message);
      setToast({ open: true, message: 'Update failed. Please try again.', severity: 'error' });
    } finally {
      setIsSavingInline(false);
      setEditingField(null);
    }
  };

  const onInlineKeyDown = (e, key) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveInlineField(key);
    } else if (e.key === 'Escape') {
      cancelInlineEdit(key);
    }
  };

  const cancelInlineEdit = (key) => {
    setEditingField(null);
    const original = employeeData?.[key] || profileData?.[key] || '';
    setInlineValues((v) => ({ ...v, [key]: original }));
  };

  useEffect(() => {
    getProfileData();
  }, []);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const name = profileData?.name || employeeData?.name || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarImage = () => {
    if (employeeData?.documents?.photo || profileData?.documents?.photo) {
      const photo = employeeData?.documents?.photo || profileData?.documents?.photo;
      return photo.startsWith('http')
        ? photo
        : `${BASE_API_URL}${photo}`;
    }
    return null;
  };

  const getBannerImage = () => {
    // Priority 1: Use bannerImage state (set after upload or from API)
    if (bannerImage) {
      // If it's already a full URL, return as is
      if (bannerImage.startsWith('http://') || bannerImage.startsWith('https://')) {
        return bannerImage;
      }
      // If it's a relative path, prepend BASE_API_URL
      if (bannerImage.startsWith('/')) {
        return `${BASE_API_URL}${bannerImage}`;
      }
      // If it doesn't start with /, it might be a relative path without leading slash
      return `${BASE_API_URL}/${bannerImage}`;
    }
    
    // Priority 2: Check employeeData
    if (employeeData?.documents?.banner_image) {
      const banner = employeeData.documents.banner_image;
      if (banner.startsWith('http://') || banner.startsWith('https://')) {
        return banner;
      }
      if (banner.startsWith('/')) {
        return `${BASE_API_URL}${banner}`;
      }
      return `${BASE_API_URL}/${banner}`;
    }
    
    // Priority 3: Check profileData
    if (profileData?.documents?.banner_image) {
      const banner = profileData.documents.banner_image;
      if (banner.startsWith('http://') || banner.startsWith('https://')) {
        return banner;
      }
      if (banner.startsWith('/')) {
        return `${BASE_API_URL}${banner}`;
      }
      return `${BASE_API_URL}/${banner}`;
    }
    
    return null;
  };

  const handleBannerUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        // Reset input
        event.target.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        event.target.value = '';
        return;
      }

      setIsUploadingBanner(true);
      
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        alert('Please login again');
        setIsUploadingBanner(false);
        event.target.value = '';
        return;
      }
      
      const employeeResponse = await axios.get(
        `${BASE_API_URL}/peoples/employees/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { page_size: 100 },
        }
      );
      
      const userEmail = profileData?.user?.email;
      const employee = employeeResponse.data?.results?.find(
        (emp) => emp.user?.email === userEmail
      );

      if (!employee) {
        alert('Employee record not found. Please contact administrator.');
        setIsUploadingBanner(false);
        event.target.value = '';
        return;
      }

      const updateFormData = new FormData();
      updateFormData.append('documents.banner_image', file);

      const updateResponse = await axios.put(
        `${BASE_API_URL}/peoples/employees/${employee.id}/`,
        updateFormData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (updateResponse?.data?.documents?.banner_image) {
        setBannerImage(updateResponse.data.documents.banner_image);
        setToast({ open: true, message: 'Banner uploaded successfully!', severity: 'success' });
      } else {
        setToast({ open: true, message: 'Banner uploaded but may not be visible yet. Please refresh.', severity: 'warning' });
      }

      // Refresh profile data
      await getProfileData();
    } catch (error) {
      console.error('Error uploading banner:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload banner image';
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsUploadingBanner(false);
      // Reset input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Main Container with responsive padding */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs aria-label="breadcrumb" className="text-gray-600">
            <Link underline="hover" color="inherit" href="/" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Typography sx={{ color: "text.primary" }} className="text-gray-900">Profile</Typography>
          </Breadcrumbs>
        </div>

        {/* Banner Section with Profile Picture Overlay */}
        <div className="mb-8 relative w-full max-w-7xl mx-auto">
          {/* Banner */}
          <div
            className="w-full h-56 sm:h-64 md:h-72 lg:h-80 rounded-t-2xl overflow-hidden cursor-pointer transition-all duration-300 relative shadow-lg group"
            style={{
              background: getBannerImage() 
                ? 'transparent' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              border: getBannerImage() ? 'none' : 'none'
            }}
            onClick={() => document.getElementById('banner-upload-input')?.click()}
          >
            {getBannerImage() && (
              <img
                src={getBannerImage()}
                alt="Profile banner"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center top' }}
              />
            )}
            {getBannerImage() && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.40) 100%)'
              }}></div>
            )}
            {!getBannerImage() && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <CloudUploadIcon sx={{ fontSize: { xs: 40, sm: 52 }, mb: 2, opacity: 0.9 }} />
                  <p className="text-sm sm:text-base font-semibold px-2 opacity-90">Click to upload banner image</p>
                  <p className="text-xs sm:text-sm px-2 mt-1 opacity-75">Recommended: 1920x600px</p>
                </div>
              </div>
            )}
            
            {getBannerImage() && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center bg-black bg-opacity-50 px-6 py-3 rounded-full backdrop-blur-sm">
                  <PhotoCameraIcon sx={{ fontSize: { xs: 24, sm: 32 }, mb: 1 }} />
                  <p className="text-xs sm:text-sm font-semibold">Change banner</p>
                </div>
              </div>
            )}
            
            {isUploadingBanner && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-20">
                <div className="text-white text-center">
                  <CircularProgress size={48} sx={{ color: 'white', mb: 2 }} />
                  <p className="text-sm font-semibold">Uploading...</p>
                </div>
              </div>
            )}

            {/* Profile Picture Overlay */}
            <div className="absolute bottom-0 left-0 transform translate-y-1/2 z-10 ml-4 sm:ml-6 md:ml-8">
              <div className="relative">
                <Avatar
                  src={getAvatarImage() || undefined}
                  sx={{
                    width: { xs: 96, sm: 120, md: 140, lg: 160 },
                    height: { xs: 96, sm: 120, md: 140, lg: 160 },
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    background: getAvatarImage() ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' },
                    fontWeight: 'bold',
                    border: '5px solid white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
                    },
                  }}
                >
                  {getInitials()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#667eea' }} />
                </IconButton>
              </div>
            </div>
          </div>
        
          <input
            id="banner-upload-input"
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />

          {/* Name and Button below banner */}
          <div className="mt-12 sm:mt-14 md:mt-16 lg:mt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-1 bg-white rounded-b-2xl p-4 shadow-sm border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <Typography 
                variant="h4" 
                className="font-bold text-gray-900" 
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                {employeeData?.name || profileData?.name || 'User Name'}
              </Typography>
              <Typography 
                variant="body2" 
                className="text-gray-600"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
              >
                {employeeData?.designation || profileData?.designation || 'Your designation'}
              </Typography>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 text-sm sm:text-base font-semibold shadow-sm hover:shadow-md flex items-center gap-2 justify-center"
            >
              <SettingsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              Manage your account
            </button>
          </div>
        </div>


        <Grid2 container spacing={{ xs: 2, sm: 3, md: 4 }} className="max-w-7xl mx-auto">
          {/* Left Column - Profile Card */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <div className="bg-white rounded-xl p-5 sm:p-6 md:p-7 space-y-5 sm:space-y-6 md:space-y-7 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              
              {/* About Section */}
              <div className="space-y-3 sm:space-y-4">
                <Typography variant="h6" className="font-bold text-gray-900 mb-4" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                  About
                </Typography>
                {/* Job Title */}
                <div className="flex items-start space-x-3 sm:space-x-4 group py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 px-2">
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <WorkIcon className="text-blue-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingField === 'designation' ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input
                          autoFocus
                          value={inlineValues.designation}
                          onChange={(e) => setInlineValues((v) => ({ ...v, designation: e.target.value }))}
                          onKeyDown={(e) => onInlineKeyDown(e, 'designation')}
                          className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 text-sm sm:text-base"
                          placeholder="Your job title"
                        />
                        <button
                          type="button"
                          onClick={() => saveInlineField('designation')}
                          disabled={isSavingInline}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          title="Save"
                        >
                          <CheckIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelInlineEdit('designation')}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                          title="Cancel"
                        >
                          <CloseIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors text-sm sm:text-base break-words"
                        onClick={() => setEditingField('designation')}
                        title="Click to edit"
                      >
                        {employeeData?.designation || profileData?.designation || inlineValues.designation || 'Your job title'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-start space-x-3 sm:space-x-4 group py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 px-2">
                  <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                    <BusinessIcon className="text-purple-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingField === 'department' ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input
                          autoFocus
                          value={inlineValues.department}
                          onChange={(e) => setInlineValues((v) => ({ ...v, department: e.target.value }))}
                          onKeyDown={(e) => onInlineKeyDown(e, 'department')}
                          className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 text-sm sm:text-base"
                          placeholder="Your department"
                        />
                        <button
                          type="button"
                          onClick={() => saveInlineField('department')}
                          disabled={isSavingInline}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          title="Save"
                        >
                          <CheckIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelInlineEdit('department')}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                          title="Cancel"
                        >
                          <CloseIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors text-sm sm:text-base break-words"
                        onClick={() => setEditingField('department')}
                        title="Click to edit"
                      >
                        {employeeData?.department || profileData?.department || inlineValues.department || 'Your department'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-start space-x-3 sm:space-x-4 group py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 px-2">
                  <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                    <BusinessIcon className="text-green-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingField === 'organization' ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input
                          autoFocus
                          value={inlineValues.organization}
                          onChange={(e) => setInlineValues((v) => ({ ...v, organization: e.target.value }))}
                          onKeyDown={(e) => onInlineKeyDown(e, 'organization')}
                          className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 text-sm sm:text-base"
                          placeholder="Your organization"
                        />
                        <button
                          type="button"
                          onClick={() => saveInlineField('organization')}
                          disabled={isSavingInline}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          title="Save"
                        >
                          <CheckIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelInlineEdit('organization')}
                          className="p-1 sm:p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                          title="Cancel"
                        >
                          <CloseIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors text-sm sm:text-base break-words"
                        onClick={() => setEditingField('organization')}
                        title="Click to edit"
                      >
                        {employeeData?.organization || profileData?.organization || inlineValues.organization || 'Your organization'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3 sm:space-x-4 group py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 px-2">
                  <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                    <LocationOnIcon className="text-red-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors text-sm sm:text-base font-medium">
                      Your location
                    </div>
                  </div>
                </div>
              </div>

              <Divider sx={{ my: 2 }} />
              
              {/* Contact Section */}
              <div className="space-y-3 sm:space-y-4 pt-2">
                <Typography variant="h6" className="font-bold text-gray-900 mb-3" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                  Contact
                </Typography>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <EmailIcon className="text-indigo-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-sm sm:text-base break-all font-medium">
                      {profileData?.user?.email || employeeData?.user?.email || 'No email'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teams Section */}
              <div className="space-y-2 sm:space-y-3 pt-2">
                <Typography variant="body2" className="font-semibold text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
                  Teams
                </Typography>
                <button
                  onClick={() => navigate('/teams')}
                  className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 text-gray-700 text-base sm:text-lg">+</span>
                  <span>Create a team</span>
                </button>
              </div>

              {/* Privacy Policy Link */}
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <Link
                  href="#"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View privacy policy
                </Link>
              </div>
            </div>
          </Grid2>

          {/* Right Column - Activity */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Worked on Section */}
              <div className="bg-white rounded-xl p-5 sm:p-6 md:p-7 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-center mb-4 sm:mb-5">
                  <Typography variant="h6" className="font-bold text-gray-900" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' } }}>
                    Worked on
                  </Typography>
                  <Link
                    href="#"
                    className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors font-semibold"
                  >
                    View all →
                  </Link>
                </div>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">ℹ️ Privacy:</span> Others will only see what they can access.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {recentTasks.map((task) => (
                    <Paper
                      key={task.id}
                      elevation={0}
                      className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 rounded-lg group"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="mt-1 p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          {task.type === 'subtask' && (
                            <LinkIcon className="text-blue-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                          )}
                          {task.type === 'task' && task.status === 'completed' && (
                            <CheckCircleIcon className="text-green-600" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                          )}
                          {task.type === 'task' && task.status === 'bookmarked' && (
                            <BookmarkIcon className="text-yellow-500" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Typography className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </Typography>
                            {task.status === 'completed' && (
                              <Chip 
                                label="Completed" 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  bgcolor: '#10b981',
                                  color: 'white',
                                  fontWeight: 600
                                }} 
                              />
                            )}
                            {task.status === 'bookmarked' && (
                              <Chip 
                                label="Bookmarked" 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  bgcolor: '#f59e0b',
                                  color: 'white',
                                  fontWeight: 600
                                }} 
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">{task.project}</span>
                            <span>·</span>
                            <span>You created this {task.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </Paper>
                  ))}
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-200">
                  <Link
                    href="#"
                    className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors font-semibold inline-flex items-center gap-1"
                  >
                    View all recent work
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Places you work in Section */}
              <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
                <Typography variant="h6" className="font-bold text-gray-900 mb-3 sm:mb-4" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                  Places you work in
                </Typography>

                <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 text-center px-4">
                  <div className="mb-3 sm:mb-4">
                    <MapIcon className="text-gray-400" sx={{ fontSize: { xs: 60, sm: 70, md: 80 } }} />
                  </div>
                  <Typography variant="h6" className="text-gray-700 mb-1 sm:mb-2" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' } }}>
                    We don't have places to show here yet
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 text-xs sm:text-sm">
                    There are no projects or spaces you've worked in across the last 90 days.
                  </Typography>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
                <Typography variant="body2" className="text-gray-600 text-center mb-2 sm:mb-3 text-xs sm:text-sm">
                  Tell us about your experience with profiles and search within this directory.
                </Typography>
                <button className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                  Share feedback about Teams app
                </button>
              </div>
            </div>
          </Grid2>
        </Grid2>
      </div>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;