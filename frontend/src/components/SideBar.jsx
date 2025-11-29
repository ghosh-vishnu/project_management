import { useEffect, useRef, useState } from "react";
// import { Menu, X, Home, Settings, User } from "lucide-react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CancelIcon from "@mui/icons-material/Cancel";
import logo from "/logo.png";
import SideBarListItem from "./SideBarListItem";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskIcon from "@mui/icons-material/Task";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import AssessmentIcon from "@mui/icons-material/Assessment";
// import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CampaignIcon from "@mui/icons-material/Campaign";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SearchBar from "./SearchBar";
import NotificationDropdown from "./Notifications/NotificationDropdown";

import { Link, useLocation, useNavigate } from "react-router";
import LoadingBar from "react-top-loading-bar";
import BadgeIcon from '@mui/icons-material/Badge';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
  InputAdornment,
  Fade,
  Collapse,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import LockResetIcon from "@mui/icons-material/LockReset";
import VideocamIcon from '@mui/icons-material/Videocam';
import LockIcon from '@mui/icons-material/Lock';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SuccessAlert from "./Alert/SuccessAlert";
import PrimaryBtn from "./Buttons/PrimaryBtn";
import { getToken } from "../Token";

export default function Sidebar({ children }) {

  const [isOpen, setIsOpen] = useState(true)
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  
  // Sidebar search/filter
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isSidebarSearchFocused, setIsSidebarSearchFocused] = useState(false);

  // To activate the sidebar list item - MUST be declared before useEffect
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auto-expand menus based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/contracts') || path.includes('/AllContracts')) {
      setIsContractsOpen(true);
    }
    if (path.includes('/AllProposals') || path.includes('/proposals')) {
      setIsProposalsOpen(true);
    }
    if (path.includes('/tasks') || path.includes('/todo') || path.includes('/ToDo')) {
      setIsTasksOpen(true);
    }
    if (path.includes('/income') || path.includes('/expenses')) {
      setIsFinanceOpen(true);
    }
  }, [location.pathname]);

  // Success message state for logout
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState("");


  // Redirect to login page if user is not logged in
  const redirectToLogin = () => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login')
    }
  }
  const isActive = (path) =>
    location.pathname == path ? " sideBarItemActive" : " ";

  // Loading Bar
  const loadingBar = useRef(null);

  const [isAccessToken, setIsAccessToken] = useState(false)
  useEffect(() => {
    // // Redirect to login function
    redirectToLogin();

    // Loading bar
    loadingBar.current.continuousStart(); // Start loading bar
    const timer = setTimeout(() => {
      loadingBar.current.complete(); // Complete loading after delay
    }, 500);

    // For checking access token 
    if (localStorage.getItem("accessToken")) {
      setIsAccessToken(true)
    }


    return () => clearTimeout(timer);
  }, [location.pathname]);


  // Avatar/Profile Handle Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setThemeAnchorEl(null);
  };

  // Theme Menu State
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const themeMenuOpen = Boolean(themeAnchorEl);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const handleThemeMenuOpen = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      setThemeAnchorEl(event.currentTarget);
    }
  };

  const handleThemeMenuClose = () => {
    setThemeAnchorEl(null);
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'match-browser') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add('light');
    }
    
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  };

  const handleThemeChange = (theme) => {
    applyTheme(theme);
    handleThemeMenuClose();
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme) {
      applyTheme(savedTheme);
    }
    
    // Listen for system theme changes if 'match-browser' is selected
    const checkMatchBrowser = () => {
      if (localStorage.getItem('theme') === 'match-browser') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          applyTheme('match-browser');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    };
    
    const cleanup = checkMatchBrowser();
    return cleanup;
  }, []);

  // Logout function
  const handleLogout = () => {

    const accessToken = getToken('accessToken')
    // const refreshToken = localStorage.getItem('refreshToken')
    // const userType = localStorage.getItem('userType')

    if (accessToken ) {
      // localStorage.removeItem('accessToken')
      // localStorage.removeItem('refreshToken')
      // localStorage.removeItem('userType')
      localStorage.clear()

      setShowSuccess(true);
      setShowMessage("Logged out successfully.");

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  }
  return (
    <div className=" w-full ">
      {/* Show success message here */}
      <SuccessAlert message={showMessage} show={showSuccess} onClose={() => setShowSuccess(false)} />

      <LoadingBar color="#282C6C" height={3} ref={loadingBar} />
      {/* Header - Advanced Futuristic Design */}
      <div className="flex justify-between items-center px-6 lg:px-8 py-3 h-[5rem] bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 w-full border-b border-cyan-500/30 shadow-xl shadow-cyan-500/10 relative" style={{ overflow: 'visible' }}>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5 animate-pulse"></div>
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-shimmer"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-400/20 animate-float"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative flex gap-x-6 items-center z-10">
          {/* Menu Button */}
          <button
            className="cursor-pointer text-white hover:text-cyan-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuOpenIcon sx={{ fontSize: 28 }} />
          </button>
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group relative">
            {/* Circular V Icon with animated glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">V</span>
              </div>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight group-hover:text-cyan-300 transition-colors duration-300">VED</span>
              <span className="text-cyan-300 text-xs font-medium tracking-widest opacity-90 group-hover:opacity-100 transition-opacity duration-300">VENTURING -DIGITALLY-</span>
            </div>
          </div>
        </div>
        
        {/* Right Section - Search, Notifications & User */}
        <div className="relative flex items-center gap-3 z-50" style={{ zIndex: 50 }}>
        {isAccessToken ? (
          <>
            {/* Smart Search Bar with Auto-suggestions */}
            <div className="hidden lg:flex items-center relative" style={{ zIndex: 9999, position: 'relative' }}>
              <SearchBar />
            </div>
            
            {/* Notifications Bell Icon with Dropdown */}
            <NotificationDropdown />
            
            {/* User Avatar */}
            <div className="relative">
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                className="hover:bg-white/10 transition-all duration-200 group"
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    fontWeight: 'bold',
                    border: '2px solid rgba(6, 182, 212, 0.5)',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)'
                    }
                  }}
                >
                  {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'M'}
                </Avatar>
              </IconButton>
            </Tooltip>
            </div>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={(e) => {
                // Don't close if clicking on theme menu
                if (!e.target.closest('[role="menu"]') || e.target.closest('[id="account-menu"]')) {
                  // Only close if not clicking on theme submenu
                  if (!themeMenuOpen) {
                    handleClose();
                  }
                }
              }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 4px 20px rgba(6, 182, 212, 0.3))",
                    mt: 1.5,
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '12px',
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                      borderLeft: '1px solid rgba(6, 182, 212, 0.3)',
                      borderTop: '1px solid rgba(6, 182, 212, 0.3)',
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem 
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4'
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28,
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'M'}
                  </Avatar>
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider sx={{ borderColor: 'rgba(6, 182, 212, 0.2)' }} />

              <MenuItem 
                onClick={handleClose}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4'
                  }
                }}
              >
                <Link className="flex items-center text-white hover:text-cyan-400 transition-colors duration-200" to="/ResetPassword">
                  <ListItemIcon>
                    <LockResetIcon sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  Reset Password
                </Link>
              </MenuItem>

              {/* Theme Menu Item */}
              <MenuItem 
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  handleThemeMenuOpen(e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!themeMenuOpen) {
                    handleThemeMenuOpen(e);
                  } else {
                    handleThemeMenuClose();
                  }
                }}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4'
                  }
                }}
              >
                <ListItemIcon>
                  <Brightness4Icon sx={{ color: 'inherit', fontSize: 20 }} />
                </ListItemIcon>
                Theme
                <ChevronRightIcon sx={{ ml: 'auto', fontSize: 18 }} />
              </MenuItem>

              {/* Theme Sub-menu */}
              <Menu
                anchorEl={themeAnchorEl}
                open={themeMenuOpen}
                onClose={handleThemeMenuClose}
                MenuListProps={{
                  onMouseLeave: (e) => {
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || (!relatedTarget.closest('[role="menu"]') && !relatedTarget.closest('[role="menuitem"]'))) {
                      handleThemeMenuClose();
                    }
                  },
                  onMouseEnter: (e) => e.stopPropagation(),
                }}
                anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 4px 20px rgba(6, 182, 212, 0.3))",
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '12px',
                      mt: -0.5,
                      ml: 1,
                      minWidth: 180,
                    },
                  },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Light Theme Option */}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Light theme clicked');
                    handleThemeChange('light');
                  }}
                  selected={currentTheme === 'light'}
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      '&:hover': {
                        backgroundColor: 'rgba(6, 182, 212, 0.25)',
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-4 h-4 rounded border-2 border-white/30 bg-white" />
                    <span>Light</span>
                    {currentTheme === 'light' && <span className="ml-auto text-cyan-400">✓</span>}
                  </div>
                </MenuItem>

                {/* Dark Theme Option */}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Dark theme clicked');
                    handleThemeChange('dark');
                  }}
                  selected={currentTheme === 'dark'}
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      '&:hover': {
                        backgroundColor: 'rgba(6, 182, 212, 0.25)',
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-4 h-4 rounded border-2 border-white/30 bg-gray-800" />
                    <span>Dark</span>
                    {currentTheme === 'dark' && <span className="ml-auto text-cyan-400">✓</span>}
                  </div>
                </MenuItem>

                {/* Match Browser Theme Option */}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Match browser theme clicked');
                    handleThemeChange('match-browser');
                  }}
                  selected={currentTheme === 'match-browser'}
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      '&:hover': {
                        backgroundColor: 'rgba(6, 182, 212, 0.25)',
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-4 h-4 rounded border-2 border-white/30 bg-gray-700" />
                    <span>Match browser</span>
                    {currentTheme === 'match-browser' && <span className="ml-auto text-cyan-400">✓</span>}
                  </div>
                </MenuItem>
              </Menu>

              <MenuItem 
                onClick={handleLogout}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }
                }}
              >
                <Link className="flex items-center text-white hover:text-red-400 transition-colors duration-200">
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  Logout
                </Link>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <button className="px-5 py-2 rounded-lg cursor-pointer transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
            <Link to={"/login"}>Login</Link>
          </button>
        )}
          </div>

      </div>
      {/* Sidebar */}
      {isAccessToken &&
        <div className="flex flex-auto h-[calc(100vh_-_5rem)] w-full relative ">
          <div
            className={`absolute left-0 lg:static z-10 h-full   transition-transform transform  ${isOpen ? "translate-x-0 w-full lg:w-[16rem]" : "-translate-x-[20rem]"} w-0`}
          >
            <div
              className={` h-full  w-full sm:w-[16rem] bg-gradient-to-b from-slate-900 via-indigo-900 to-blue-900 text-white p-5 translate-[visibility] border-r border-cyan-500/20 flex flex-col`}
            >
              {/* Menu Items - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                {(!sidebarSearchQuery || 'dashboard'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={"/"} className={isActive("/")}>
                      <DashboardIcon /> Dashboard
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'employees'.includes(sidebarSearchQuery) || 'employee'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/employee'} className={isActive('/employee')}>
                      <BadgeIcon /> Employees
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'teams'.includes(sidebarSearchQuery) || 'team'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/teams'} className={isActive('/teams')}>
                      <GroupsIcon /> Teams
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'meeting'.includes(sidebarSearchQuery) || 'schedule'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/meetings'} className={isActive('/meetings')}>
                      <VideocamIcon /> Meeting Schedule
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'roles'.includes(sidebarSearchQuery) || 'role'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem>
                      <LockIcon /> Roles 
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'leads'.includes(sidebarSearchQuery) || 'lead'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={"/leads"} className={isActive("/leads")}>
                      <PermContactCalendarIcon /> Leads
                    </SideBarListItem>
                  </div>
                </Fade>
                )}




                {(!sidebarSearchQuery || 'proposals'.includes(sidebarSearchQuery) || 'all proposals'.includes(sidebarSearchQuery) || 'add template'.includes(sidebarSearchQuery)) && (
                <div>
                  <div 
                    onClick={() => setIsProposalsOpen(!isProposalsOpen)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <AssignmentIcon /> Proposals
                        </div>
                        <div className={`transition-transform duration-300 ${isProposalsOpen ? 'rotate-180' : ''}`}>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <Collapse in={isProposalsOpen} timeout={300}>
                    <div className="space-y-2 ps-2 mt-2">
                    <div className="">
                      <SideBarListItem to={'/AllProposals'}>
                        All Proposals
                      </SideBarListItem>
                    </div>
                    <div className="">
                      <SideBarListItem>
                        Add Template
                      </SideBarListItem>
                    </div>
                    </div>
                  </Collapse>
                </div>
                )}

                {(!sidebarSearchQuery || 'contracts'.includes(sidebarSearchQuery) || 'all contracts'.includes(sidebarSearchQuery)) && (
                <div>
                  <div 
                    onClick={() => setIsContractsOpen(!isContractsOpen)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <DescriptionIcon /> Contracts
                        </div>
                        <div className={`transition-transform duration-300 ${isContractsOpen ? 'rotate-180' : ''}`}>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <Collapse in={isContractsOpen} timeout={300}>
                    <div className="space-y-2 ps-2 mt-2">
                    <div className="">
                      <SideBarListItem to={'/contracts'} className={isActive('/contracts')}>
                        All Contracts
                      </SideBarListItem>
                    </div>
                    <div className="">
                      <SideBarListItem>
                        Add Template
                      </SideBarListItem>
                    </div>
                    </div>
                  </Collapse>
                </div>
                )}

                {(!sidebarSearchQuery || 'clients'.includes(sidebarSearchQuery) || 'client'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/clients'} className={isActive("/clients")}>
                      <AssignmentIndIcon /> Clients
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'projects'.includes(sidebarSearchQuery) || 'project'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem
                      to={"/projects"}
                      className={isActive("/projects")}
                    >
                      <FolderIcon /> Projects
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'tasks'.includes(sidebarSearchQuery) || 'assign tasks'.includes(sidebarSearchQuery) || 'to do'.includes(sidebarSearchQuery) || 'todo'.includes(sidebarSearchQuery)) && (
                <div>
                  <div 
                    onClick={() => setIsTasksOpen(!isTasksOpen)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <SideBarListItem className={isActive('/tasks')}>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <TaskIcon /> Tasks
                        </div>
                        <div className={`transition-transform duration-300 ${isTasksOpen ? 'rotate-180' : ''}`}>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <Collapse in={isTasksOpen} timeout={300}>
                    <div className="space-y-2 ps-2 mt-2">
                    <div className="">
                      <SideBarListItem to={'/tasks'} >
                        Assign Tasks
                      </SideBarListItem>
                    </div>
                    <div className="">
                      <SideBarListItem to={'/ToDo'} className={isActive('/todo')}>
                        To Do
                      </SideBarListItem>
                    </div>
                    </div>
                  </Collapse>
                </div>
                )}

                {(!sidebarSearchQuery || 'documentation'.includes(sidebarSearchQuery) || 'documents'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem>
                      <FilePresentIcon /> Documentation
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'sprint'.includes(sidebarSearchQuery) || 'sprints'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/sprints'} className={isActive('/sprints')}>
                      <TimelineIcon /> Sprint
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'tickets'.includes(sidebarSearchQuery) || 'ticket'.includes(sidebarSearchQuery) || 'support'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/tickets'} className={isActive("/tickets")}>
                      <SupportAgentIcon /> Tickets
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'announcements'.includes(sidebarSearchQuery) || 'announcement'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem>
                      <CampaignIcon /> Announcements
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'invoices'.includes(sidebarSearchQuery) || 'invoice'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/invoices'} className={isActive("/invoices")} >
                      <ReceiptIcon /> Invoices
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'notifications'.includes(sidebarSearchQuery) || 'notification'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem>
                      <CircleNotificationsIcon /> Notifications
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

                {(!sidebarSearchQuery || 'finance'.includes(sidebarSearchQuery) || 'income'.includes(sidebarSearchQuery) || 'expenses'.includes(sidebarSearchQuery)) && (
                <div>
                  <div 
                    onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <MonetizationOnIcon /> Finance
                        </div>
                        <div className={`transition-transform duration-300 ${isFinanceOpen ? 'rotate-180' : ''}`}>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <Collapse in={isFinanceOpen} timeout={300}>
                    <div className="space-y-2 ps-2 mt-2">
                    <div className="">
                      <SideBarListItem to={'/income'}>
                        Income
                      </SideBarListItem>
                    </div>

                    <div className="">
                      <SideBarListItem to={'/expenses'}>
                        Expenses
                      </SideBarListItem>
                    </div>
                    </div>
                  </Collapse>
                </div>
                )}

                {(!sidebarSearchQuery || 'bank'.includes(sidebarSearchQuery) || 'setting'.includes(sidebarSearchQuery) || 'settings'.includes(sidebarSearchQuery)) && (
                <Fade in={true} timeout={300}>
                  <div>
                    <SideBarListItem to={'/setting'} className={'/setting'}>
                      <SettingsIcon /> Add Bank
                    </SideBarListItem>
                  </div>
                </Fade>
                )}

              </ul>
              </div>
              
              {/* Sidebar Search - Fixed at Bottom */}
              <div className="mt-auto pt-4 sticky bottom-0 z-10 bg-gradient-to-t from-slate-900 via-indigo-900 to-blue-900 border-t border-cyan-500/20">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search menu..."
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value.toLowerCase())}
                  onFocus={() => setIsSidebarSearchFocused(true)}
                  onBlur={() => setIsSidebarSearchFocused(false)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: sidebarSearchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSidebarSearchQuery('')}
                          sx={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: 'rgba(6, 182, 212, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(6, 182, 212, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(6, 182, 212, 0.7)',
                        borderWidth: '1px',
                      },
                      '& input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 h-full w-screen lg:w-full overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      }

    </div>
  );
}
