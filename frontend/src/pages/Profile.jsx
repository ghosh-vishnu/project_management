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
            if (emp.documents?.banner_image) {
              setBannerImage(emp.documents.banner_image);
            }
          } else {
            if (profileResponse.data.department || profileResponse.data.designation || profileResponse.data.organization) {
              setEmployeeData(profileResponse.data);
              if (profileResponse.data.documents?.banner_image) {
                setBannerImage(profileResponse.data.documents.banner_image);
              }
            }
          }
        } catch (empErr) {
          if (profileResponse.data.department || profileResponse.data.designation || profileResponse.data.organization) {
            setEmployeeData(profileResponse.data);
            if (profileResponse.data.documents?.banner_image) {
              setBannerImage(profileResponse.data.documents.banner_image);
            }
          }
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
    if (bannerImage) {
      return bannerImage.startsWith('http') ? bannerImage : `${BASE_API_URL}${bannerImage}`;
    }
    if (employeeData?.documents?.banner_image || profileData?.documents?.banner_image) {
      const banner = employeeData?.documents?.banner_image || profileData?.documents?.banner_image;
      return banner.startsWith('http') ? banner : `${BASE_API_URL}${banner}`;
    }
    return null;
  };

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingBanner(true);
    const formData = new FormData();
    formData.append('banner_image', file);

    try {
      const accessToken = getToken("accessToken");
      
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
        alert('Employee record not found');
        setIsUploadingBanner(false);
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

      if (updateResponse.data.documents?.banner_image) {
        setBannerImage(updateResponse.data.documents.banner_image);
      }

      getProfileData();
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner image. Please try again.');
    } finally {
      setIsUploadingBanner(false);
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
            className="w-full h-56 sm:h-64 md:h-72 lg:h-80 rounded-none overflow-hidden cursor-pointer transition-all duration-300 relative shadow-sm"
            style={{
              backgroundColor: getBannerImage() ? 'transparent' : '#ffffff',
              border: getBannerImage() ? 'none' : '1px solid #e5e7eb'
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
                background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 55%, rgba(0,0,0,0.30) 100%)'
              }}></div>
            )}
            {!getBannerImage() && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <CloudUploadIcon sx={{ fontSize: { xs: 32, sm: 42 }, mb: 1, color: '#9ca3af' }} />
                  <p className="text-xs sm:text-sm font-medium px-2">Click to upload banner image</p>
                </div>
              </div>
            )}
            
            {getBannerImage() && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="text-white text-center">
                  <PhotoCameraIcon sx={{ fontSize: { xs: 24, sm: 32 }, mb: 1, color: 'white' }} />
                  <p className="text-xs sm:text-sm font-medium">Change banner</p>
                </div>
              </div>
            )}
            
            {isUploadingBanner && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm">Uploading...</p>
                </div>
              </div>
            )}

            {/* Profile Picture Overlay */}
            <div className="absolute bottom-0 left-0 transform translate-y-1/2 z-10 ml-3 sm:ml-6">
              <Avatar
                src={getAvatarImage() || undefined}
                sx={{
                  width: { xs: 96, sm: 120, md: 140, lg: 160 },
                  height: { xs: 96, sm: 120, md: 140, lg: 160 },
                  bgcolor: '#ff6b35',
                  fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' },
                  fontWeight: 'bold',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {getInitials()}
              </Avatar>
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
          <div className="mt-10 sm:mt-12 md:mt-14 flex flex-col items-start gap-1.5 sm:gap-2.5 px-1">
            <Typography 
              variant="h4" 
              className="font-bold text-gray-900" 
              sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem', md: '1.9rem' } }}
            >
              {employeeData?.name || profileData?.name || 'User Name'}
            </Typography>
            <button
              onClick={() => navigate('/settings')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-xs sm:text-sm font-medium"
            >
              Manage your account
            </button>
          </div>
        </div>

        {/* About heading */}
        <div className="mb-4 max-w-7xl mx-auto">
          <Typography variant="h6" className="font-bold text-gray-900" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            About
          </Typography>
        </div>

        <Grid2 container spacing={{ xs: 2, sm: 3, md: 4 }} className="max-w-7xl mx-auto">
          {/* Left Column - Profile Card */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 border border-gray-200 shadow-sm">
              
              {/* About Section */}
              <div className="space-y-3 sm:space-y-4">
                {/* Job Title */}
                <div className="flex items-start space-x-2 sm:space-x-3 group py-2 sm:py-3">
                  <WorkIcon className="text-gray-600 mt-1" sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
                <div className="flex items-start space-x-2 sm:space-x-3 group py-2 sm:py-3">
                  <BusinessIcon className="text-gray-600 mt-1" sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
                <div className="flex items-start space-x-2 sm:space-x-3 group py-2 sm:py-3">
                  <BusinessIcon className="text-gray-600 mt-1" sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
                <div className="flex items-start space-x-2 sm:space-x-3 group py-2 sm:py-3">
                  <LocationOnIcon className="text-gray-600 mt-1" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors text-sm sm:text-base">
                      Your location
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-2 sm:space-y-3 pt-2">
                <Typography variant="body2" className="font-semibold text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
                  Contact
                </Typography>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <EmailIcon className="text-gray-600 mt-1" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-sm sm:text-base break-all">
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
              <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <Typography variant="h6" className="font-bold text-gray-900" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                    Worked on
                  </Typography>
                  <Link
                    href="#"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Others will only see what they can access.
                </p>

                <div className="space-y-2 sm:space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="mt-1">
                        {task.type === 'subtask' && (
                          <LinkIcon className="text-blue-600" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        )}
                        {task.type === 'task' && task.status === 'completed' && (
                          <CheckCircleIcon className="text-blue-600" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        )}
                        {task.type === 'task' && task.status === 'bookmarked' && (
                          <BookmarkIcon className="text-yellow-500" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {task.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">
                          {task.project} · You created this {task.createdAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 sm:mt-4">
                  <Link
                    href="#"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    View all
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