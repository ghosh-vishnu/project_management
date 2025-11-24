import React, { useState, useEffect } from 'react';
import {
  Breadcrumbs,
  Grid2,
  Link,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Box,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';
import BASE_API_URL from '../data';
import { getToken } from '../Token';
import { useNavigate } from 'react-router';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoKey, setPhotoKey] = useState(0); // Key to force avatar re-render

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const profileResponse = await axios.get(`${BASE_API_URL}/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setProfileData(profileResponse.data);
      setFormData({
        name: profileResponse.data?.name || '',
        email: profileResponse.data?.user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Fetch employee data
      try {
        const employeesRes = await axios.get(`${BASE_API_URL}/peoples/employees/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { page_size: 100 },
        });
        const userEmail = profileResponse.data?.user?.email;
        const userId = profileResponse.data?.user?.id;
        const emp = employeesRes.data?.results?.find(
          (e) => (e.user?.email === userEmail) || (e.user?.id === userId)
        );
        if (emp) {
          setEmployeeData(emp);
          // Set photo URL if available
          if (emp.documents?.photo) {
            setPhotoUrl(emp.documents.photo);
          }
        }
      } catch (empErr) {
        console.error('Error fetching employee data:', empErr);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({ open: true, message: 'Failed to load profile data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (setting) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const accessToken = getToken("accessToken");
      
      // Update name in employee record if employee exists
      if (employeeData?.id) {
        try {
          await axios.put(
            `${BASE_API_URL}/peoples/employees/${employeeData.id}/`,
            { name: formData.name },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } catch (empError) {
          console.error('Error updating employee name:', empError);
          // Fallback to user profile
          await axios.put(`${BASE_API_URL}/auth/user-profile/`, {
            designation: employeeData?.designation || '',
            department: employeeData?.department || '',
            organization: employeeData?.organization || '',
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } else {
        // Update user profile if employee doesn't exist
        await axios.put(`${BASE_API_URL}/auth/user-profile/`, {
          designation: profileData?.designation || '',
          department: profileData?.department || '',
          organization: profileData?.organization || '',
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      setToast({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      await fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update profile', 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword) {
      setToast({ open: true, message: 'Current password is required', severity: 'error' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setToast({ open: true, message: 'New passwords do not match', severity: 'error' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setToast({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      const accessToken = getToken("accessToken");
      
      // First authenticate with current password
      const user = profileData?.user;
      if (!user?.email) {
        setToast({ open: true, message: 'User email not found', severity: 'error' });
        return;
      }

      // Change password using Django's set_password
      // We'll need to create an endpoint or use reset password with auth
      try {
        // Try direct password change via user update (if backend supports it)
        await axios.put(
          `${BASE_API_URL}/auth/change-password/`,
          {
            current_password: formData.currentPassword,
            new_password: formData.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setToast({ open: true, message: 'Password changed successfully!', severity: 'success' });
        setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } catch (changePassError) {
        // If endpoint doesn't exist, show message to contact admin
        if (changePassError.response?.status === 404) {
          setToast({ 
            open: true, 
            message: 'Password change endpoint not available. Please contact administrator.', 
            severity: 'warning' 
          });
        } else {
          throw changePassError;
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Failed to change password. Please check your current password.';
      setToast({ 
        open: true, 
        message: errorMsg, 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      setToast({ open: true, message: 'Please upload an image file', severity: 'error' });
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, message: 'Image size should be less than 5MB', severity: 'error' });
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setIsUploadingPhoto(true);
    
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setToast({ open: true, message: 'Please login again', severity: 'error' });
        setIsUploadingPhoto(false);
        if (event.target) {
          event.target.value = '';
        }
        return;
      }
      
      // Get employee record
      let employeeId = employeeData?.id;
      
      if (!employeeId) {
        // Fetch employee list to find employee
        const employeeResponse = await axios.get(
          `${BASE_API_URL}/peoples/employees/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page_size: 100 },
          }
        );
        
        const userEmail = profileData?.user?.email;
        const userId = profileData?.user?.id;
        const employee = employeeResponse.data?.results?.find(
          (emp) => (emp.user?.email === userEmail) || (emp.user?.id === userId)
        );

        if (!employee) {
          setToast({ open: true, message: 'Employee record not found. Please contact administrator.', severity: 'error' });
          setIsUploadingPhoto(false);
          if (event.target) {
            event.target.value = '';
          }
          return;
        }
        
        employeeId = employee.id;
        setEmployeeData(employee);
      }

      // Prepare FormData with correct format
      const updateFormData = new FormData();
      updateFormData.append('documents.photo', file);

      // Upload photo
      const updateResponse = await axios.put(
        `${BASE_API_URL}/peoples/employees/${employeeId}/`,
        updateFormData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update photo URL immediately
      if (updateResponse?.data?.documents?.photo) {
        const newPhotoUrl = updateResponse.data.documents.photo;
        setPhotoUrl(newPhotoUrl);
        setPhotoKey((prev) => prev + 1); // Force avatar re-render
        
        // Update employee data with new photo URL
        setEmployeeData((prev) => ({
          ...prev,
          documents: {
            ...prev?.documents,
            photo: newPhotoUrl,
          },
        }));
        
        // Also update profileData if it has documents
        setProfileData((prev) => ({
          ...prev,
          documents: {
            ...prev?.documents,
            photo: newPhotoUrl,
          },
        }));
      }

      setToast({ open: true, message: 'Profile photo updated successfully!', severity: 'success' });
      
      // Refresh profile data to get updated photo
      await fetchProfileData();
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Failed to upload photo. Please try again.';
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsUploadingPhoto(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

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
    // Priority 1: Use photoUrl state (most recent upload)
    if (photoUrl) {
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl;
      }
      if (photoUrl.startsWith('/')) {
        return `${BASE_API_URL}${photoUrl}`;
      }
      return `${BASE_API_URL}/${photoUrl}`;
    }
    
    // Priority 2: Use employeeData
    if (employeeData?.documents?.photo) {
      const photo = employeeData.documents.photo;
      if (!photo) return null;
      
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
      }
      if (photo.startsWith('/')) {
        return `${BASE_API_URL}${photo}`;
      }
      return `${BASE_API_URL}/${photo}`;
    }
    
    // Priority 3: Use profileData
    if (profileData?.documents?.photo) {
      const photo = profileData.documents.photo;
      if (!photo) return null;
      
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
      }
      if (photo.startsWith('/')) {
        return `${BASE_API_URL}${photo}`;
      }
      return `${BASE_API_URL}/${photo}`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs aria-label="breadcrumb" className="text-gray-600">
            <Link 
              underline="hover" 
              color="inherit" 
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Profile
            </Link>
            <Typography sx={{ color: "text.primary" }} className="text-gray-900">
              Settings
            </Typography>
          </Breadcrumbs>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <IconButton onClick={() => navigate('/profile')} sx={{ bgcolor: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="font-bold text-gray-900">
            Account Settings
          </Typography>
        </div>

        <Grid2 container spacing={3} className="max-w-7xl mx-auto">
          {/* Left Column - Profile Photo */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper className="p-6 rounded-xl shadow-lg">
              <Typography variant="h6" className="font-bold text-gray-900 mb-4">
                Profile Photo
              </Typography>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar
                    key={photoKey}
                    src={getAvatarImage() || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      background: getAvatarImage() ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      border: '4px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    imgProps={{
                      onError: () => {
                        // If image fails to load, reset photoUrl to show initials
                        setPhotoUrl(null);
                      }
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <CircularProgress size={32} sx={{ color: 'white' }} />
                    </div>
                  )}
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      width: 40,
                      height: 40,
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 20, color: '#667eea' }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </IconButton>
                </div>
                <Typography variant="body2" className="text-gray-600 text-center">
                  Click the camera icon to upload a new photo
                </Typography>
              </div>
            </Paper>
          </Grid2>

          {/* Right Column - Settings Forms */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <div className="space-y-6">
              {/* Personal Information */}
              <Paper className="p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <PersonIcon className="text-blue-600" />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Personal Information
                  </Typography>
                </div>
                <Divider className="mb-4" />
                <Grid2 container spacing={3}>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="Enter your full name"
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'gray' }} />,
                      }}
                    />
                    <Typography variant="caption" className="text-gray-500 mt-1">
                      Email cannot be changed. Contact administrator to change email.
                    </Typography>
                  </Grid2>
                  {(employeeData?.designation || profileData?.designation) && (
                    <Grid2 size={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Designation"
                        value={employeeData?.designation || profileData?.designation || ''}
                        disabled
                        variant="outlined"
                        InputProps={{
                          startAdornment: <WorkIcon sx={{ mr: 1, color: 'gray' }} />,
                        }}
                      />
                      <Typography variant="caption" className="text-gray-500 mt-1">
                        View only
                      </Typography>
                    </Grid2>
                  )}
                  {(employeeData?.department || profileData?.department) && (
                    <Grid2 size={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={employeeData?.department || profileData?.department || ''}
                        disabled
                        variant="outlined"
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ mr: 1, color: 'gray' }} />,
                        }}
                      />
                      <Typography variant="caption" className="text-gray-500 mt-1">
                        View only
                      </Typography>
                    </Grid2>
                  )}
                </Grid2>
                <div className="mt-4">
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      },
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Paper>

              {/* Change Password */}
              <Paper className="p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <LockIcon className="text-red-600" />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Change Password
                  </Typography>
                </div>
                <Divider className="mb-4" />
                <Grid2 container spacing={3}>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid2>
                </Grid2>
                <div className="mt-4">
                  <Button
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={handleChangePassword}
                    disabled={saving || !formData.currentPassword || !formData.newPassword}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      },
                    }}
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </Paper>

              {/* Notification Settings */}
              <Paper className="p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <NotificationsIcon className="text-green-600" />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Notification Settings
                  </Typography>
                </div>
                <Divider className="mb-4" />
                <div className="space-y-3">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingsChange('emailNotifications')}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={() => handleSettingsChange('pushNotifications')}
                        color="primary"
                      />
                    }
                    label="Push Notifications"
                  />
                </div>
              </Paper>

              {/* Security Settings */}
              <Paper className="p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <SecurityIcon className="text-purple-600" />
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Security
                  </Typography>
                </div>
                <Divider className="mb-4" />
                <div className="space-y-3">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={() => handleSettingsChange('twoFactorAuth')}
                        color="primary"
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <Typography variant="body2" className="text-gray-600">
                    Add an extra layer of security to your account
                  </Typography>
                </div>
              </Paper>
            </div>
          </Grid2>
        </Grid2>
      </div>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
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

export default Settings;

