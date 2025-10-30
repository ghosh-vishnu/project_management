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

  // Success message state for logout
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState("");


  // Redirect to login page if user is not logged in
  const redirectToLogin = () => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login')
    }
  }

  // To activate the sidebar list item
  const location = useLocation();
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


  const navigate = useNavigate()
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
      <div className="flex justify-between items-center px-6 lg:px-8 py-3 h-[5rem] bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 w-full border-b border-cyan-500/30 shadow-xl shadow-cyan-500/10 relative overflow-hidden">
        
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
        <div className="relative flex items-center gap-3 z-10">
        {isAccessToken ? (
          <>
            {/* Search Bar */}
            <div className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 pr-10 text-white placeholder-white/50 focus:outline-none focus:border-cyan-500/50 focus:bg-white/15 transition-all duration-200 text-sm w-64"
              />
              <SearchIcon 
                sx={{ 
                  position: 'absolute', 
                  right: 12, 
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 20 
                }} 
              />
            </div>
            
            {/* Notifications Bell Icon */}
            <Tooltip title="Notifications">
              <IconButton
                className="relative hover:bg-white/10 transition-all duration-200 text-white hover:text-cyan-400"
              >
                <CircleNotificationsIcon sx={{ fontSize: 26 }} />
                {/* Notification Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </IconButton>
            </Tooltip>
            
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
              className={` overflow-y-scroll no-scrollbar h-full  w-full sm:w-[16rem] bg-gradient-to-b from-slate-900 via-indigo-900 to-blue-900 text-white p-5 translate-[visibility] border-r border-cyan-500/20`}
            >
              {/* <h2 className="text-2xl font-bold mb-5">Sidebar</h2> */}
              <ul className="space-y-4">
                <SideBarListItem to={"/"} className={isActive("/")}>
                  <DashboardIcon /> Dashboard
                </SideBarListItem>

                <SideBarListItem to={'/employee'} className={isActive('/employee')}>
                  <BadgeIcon /> Employees
                </SideBarListItem>



                <SideBarListItem to={'/teams'} className={isActive('/teams')}>
                  <GroupsIcon /> Teams
                </SideBarListItem>

                <SideBarListItem to={'/meetings'} className={isActive('/meetings')}>
                  <VideocamIcon /> Meeting Schedule
                </SideBarListItem>

                <SideBarListItem >
                  <LockIcon /> Roles 
                </SideBarListItem>

                <SideBarListItem to={"/leads"} className={isActive("/leads")}>
                  <PermContactCalendarIcon /> Leads
                </SideBarListItem>




                <div>
                  <div onClick={() => setIsProposalsOpen(!isProposalsOpen)}>
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <AssignmentIcon /> Proposals
                        </div>
                        <div>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <div
                    className={`space-y-2 ps-2  ${isProposalsOpen ? " h-full visible mt-2" : "h-0 invisible"} `}
                  >
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
                </div>

                <div>
                  <div onClick={() => setIsContractsOpen(!isContractsOpen)}>
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <DescriptionIcon /> Contracts
                        </div>
                        <div>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <div
                    className={`space-y-2 ps-2  ${isContractsOpen ? " h-full visible mt-2" : "h-0 invisible"} `}
                  >
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
                </div>

                <SideBarListItem to={'/clients'} className={isActive("/clients")}>
                  <AssignmentIndIcon /> Clients
                </SideBarListItem>

                <SideBarListItem
                  to={"/projects"}
                  className={isActive("/projects")}
                >
                  <FolderIcon /> Projects
                </SideBarListItem>

                <div>
                  <div onClick={() => setIsTasksOpen(!isTasksOpen)}>
                    <SideBarListItem className={isActive('/tasks')}>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <TaskIcon /> Tasks
                        </div>
                        <div>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <div
                    className={`space-y-2 ps-2  ${isTasksOpen ? " h-full visible mt-2" : "h-0 invisible"} `}
                  >
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
                </div>




                <SideBarListItem>
                  <FilePresentIcon /> Documentation
                </SideBarListItem>

                <SideBarListItem>
                  <TimelineIcon /> Sprint
                </SideBarListItem>

                <SideBarListItem to={'/tickets'} className={isActive("/tickets")}>
                  <SupportAgentIcon /> Tickets
                </SideBarListItem>

                <SideBarListItem>
                  <CampaignIcon /> Announcements
                </SideBarListItem>

                <SideBarListItem to={'/invoices'} className={isActive("/invoices")} >
                  <ReceiptIcon /> Invoices
                </SideBarListItem>

                <SideBarListItem>
                  <CircleNotificationsIcon /> Notifications
                </SideBarListItem>

                <div>
                  <div onClick={() => setIsFinanceOpen(!isFinanceOpen)}>
                    <SideBarListItem>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-x-4">
                          <MonetizationOnIcon /> Finance
                        </div>
                        <div>
                          <ExpandMoreIcon />
                        </div>
                      </div>
                    </SideBarListItem>
                  </div>
                  <div
                    className={`space-y-2 ps-2  ${isFinanceOpen ? " h-full visible mt-2" : "h-0 invisible"} `}
                  >
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
                </div>

                

                <SideBarListItem to={'/setting'} className={'/setting'}>
                  <SettingsIcon /> Setting
                </SideBarListItem>

              </ul>
            </div>
          </div>

          <div className="p-6 h-full overflow-y-scroll w-screen  lg:w-full  ">
            {children}
          </div>
        </div>
      }

    </div>
  );
}
