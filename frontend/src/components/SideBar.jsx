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
  };


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
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-2 h-[5rem] bg-white w-full border-b border-gray-400 shadow-[10px_10px_50px_5px] shadow-gray-300">
        <div className="flex gap-x-8">
          {/* Menu Button */}
          <button
            className=" cursor-pointer  text-gray-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuOpenIcon />
          </button>
          <div className="w-[7rem]">
            <img
              className="w-full object-contain "
              src={logo}
              loading="true"
              alt="Logo"
            />
          </div>
        </div>
        {isAccessToken ? (
          <div className="">
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
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
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleClose}>
                <Link to={'/profile'} className="flex items-center w-full">  <Avatar /> Profile</Link>

              </MenuItem>
              <Divider />

              <MenuItem onClick={handleClose}>
                <Link className="flex items-center" to="/ResetPassword">
                  <ListItemIcon >
                    <LockResetIcon />
                  </ListItemIcon>
                  Reset Password
                </Link>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Link className="flex items-center">
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </Link>
              </MenuItem>
            </Menu>
          </div>
        ) : (<button className={'px-4 py-2 rounded-[5px] cursor-pointer transition-all hover:shadow-[2px_2px_5px] hover:shadow-gray-400 bg-[var(--primary1)] hover:bg-[var(--primary2)] text-white flex items-center gap-2 '}><Link to={"/login"}>Login</Link></button>)}

      </div>
      {/* Sidebar */}
      {isAccessToken &&
        <div className="flex flex-auto h-[calc(100vh_-_5rem)] w-full relative ">
          <div
            className={`absolute left-0 lg:static z-10 h-full   transition-transform transform  ${isOpen ? "translate-x-0 w-full lg:w-[16rem]" : "-translate-x-[20rem]"} w-0`}
          >
            <div
              className={` overflow-y-scroll no-scrollbar h-full  w-full sm:w-[16rem]  bg-[var(--primary1)] text-white p-5 translate-[visibility]`}
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
