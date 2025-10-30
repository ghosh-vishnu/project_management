import React, { useEffect, useState } from "react";

import {
  Breadcrumbs,
  Button,
  Typography,
  Modal,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Grid2,
  Grid,
  TablePagination,
} from "@mui/material";
import { data, Link, useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import { Edit, Delete, Add, Height, RemoveRedEye } from "@mui/icons-material";
import DeleteBtn from "../../components/Buttons/DeleteBtn";
import CloseBtn from "../../components/Buttons/CloseBtn";

import CancelIcon from "@mui/icons-material/Cancel";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ModalComp from "../../components/Modal/ModalComp";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import axios from "axios";
import BASE_API_URL from "../../data";
import { useForm } from "react-hook-form";

import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../utils";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import { getToken } from "../../Token";
import jsPDF from "jspdf";

const Employee = () => {
  // Helper function to mask account number
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return '****';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  };
  
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState([]);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // To show error and success alert
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Delete modal open and close
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteOpen = (data) => {
    if (localStorage.getItem("employeeId")) {
      localStorage.removeItem("employeeId");
    }
    // console.log(data.id)
    localStorage.setItem("employeeId", data.id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const [employeeDetailsData, setEmployeeDetailsData] = useState({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  
  // Collapsible sections state
  const [showDocuments, setShowDocuments] = useState(false);
  const [showCurrentAddress, setShowCurrentAddress] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  
  // View Modal open and close
  const [viewOpen, setViewOpen] = useState(false);
  const handleViewOpen = async (data) => {
    // Fetch full details from API
    const fullDetails = await fetchEmployeeDetails(data.id);
    if (fullDetails) {
      setEmployeeDetailsData(fullDetails);
    } else {
    setEmployeeDetailsData(data);
    }
    
    setShowAccountNumber(false); // Reset mask when opening new employee
    // Reset all collapsible sections
    setShowDocuments(false);
    setShowCurrentAddress(false);
    setShowPermanentAddress(false);
    setShowBankDetails(false);
    // console.log(data);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
  };

  const navigate = useNavigate();
  // Edit Employee Modal
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);

  const handleEditEmployeeOpen = (data) => {
    navigate(`/employee/edit/${data.id}`);

    // setEditEmployeeOpen(true);
  };
  const handleEditEmployeeClose = () => setEditEmployeeOpen(false);

  // Pagination variables
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showInactive, setShowInactive] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // Employee data variable
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // To fetch the employee data list
  const getEmployeeData = async (pageNumber, pageSize, showInactiveEmployees = false) => {
    try {
      setIsLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found. Please login again.");
        return;
      }
      
      console.log("Fetching employees with params:", { page: pageNumber + 1, page_size: pageSize, show_inactive: showInactiveEmployees });
      
      const response = await axios.get(`${BASE_API_URL}/peoples/employees/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1, // API might be 1-indexed, but TablePagination is 0-indexed
          page_size: pageSize,
          show_inactive: showInactiveEmployees,
        },
      });
      
      console.log("Employee API response:", response.data);
      setEmployeeData(response.data.results || []);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response?.status === 401) {
        console.error("Authentication failed. Please login again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch detailed employee data for view modal
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/employees/${employeeId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee details:", error);
      return null;
    }
  };

  // Use Effect
  useEffect(() => {
    getEmployeeData(page, rowsPerPage, showInactive);
  }, [page, rowsPerPage, showInactive]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleEditFormSubmit = (data) => {
    const formData = { user: {} };
    formData["user"]["email"] = data.email;
    formData["user"]["is_active"] = data.is_active;
    formData["user"]["user_type"] = data.user_type;
    formData["phone"] = data.phone;
    formData["name"] = data.name;
    formData["email"] = data.email;
    formData["country"] = data.country;
    formData["state"] = data.state;
    formData["pincode"] = data.pincode;
    formData["address"] = data.address;
    formData["joining_date"] = data.joining_date;
    formData["gender"] = data.gender;
    formData["profile_image"] = data.profile_image;
    // console.log(formData)
  };
  // Delete api call
  const deleteData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const employeeId = localStorage.getItem("employeeId");

      if (accessToken && employeeId) {
        const response = await axios.delete(
          `${BASE_API_URL}/peoples/employees/${employeeId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 200 || response.status == 204) {
          getEmployeeData(page, rowsPerPage, showInactive);
          setShowSuccess(true);
          setShowMessage("Employee deactivated successfully.");
          handleDeleteClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to deactivate employee.");
    }
  };
  return (
    <div>
      <ErrorAlert
        show={showError}
        message={showMessage}
        onClose={() => setShowError(false)}
      ></ErrorAlert>
      <SuccessAlert
        message={showMessage}
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <div className="">
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>

          <Typography sx={{ color: "text.primary" }}>Employees</Typography>
        </Breadcrumbs>
      </div>

      <div className="mt-6 flex flex-row flex-wrap place-content-between  gap-x-2 gap-y-4">
        <div>
          <h4 className="text-2xl font-bold">Employee Management</h4>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => getEmployeeData(page, rowsPerPage, showInactive)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showInactive
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showInactive ? '👁️ Hide Inactive' : '👁️ Show Inactive'}
          </button>
          <Link to={"/employee/add"}>
            <PrimaryBtn onClick={handleOpen}>
              <AddIcon /> Add Employee
            </PrimaryBtn>
          </Link>
        </div>
      </div>

      {/* Data list table */}
      <div className="bg-white mt-8 px-4 py-2 rounded-lg shadow-[2px_2px_5px_2px] shadow-gray-400">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-gray-600">Loading employees...</div>
          </div>
        ) : employeeData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-gray-600">No employees found</div>
            <div className="text-sm text-gray-500 mt-2">
              {showInactive ? "No inactive employees found" : "No active employees found. Try adding a new employee or show inactive employees."}
            </div>
          </div>
        ) : (
          employeeData.map((data) => (
          <div
            key={data.id}
            className="flex justify-between items-center border-b p-3"
          >
            <div className="flex gap-4 ">
              <div className="w-[3rem] h-[3rem] overflow-hidden ">
                <img
                  className=" w-full h-full rounded-[50%]"
                  src="/profile.png"
                  alt="profile"
                  loading="true"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{data.name}</p>
                <p className="text-sm text-gray-500">
                  {data.email || data.user?.email} — {data.designation || 'Employee'}
                </p>
                <div className="flex gap-4 mt-1 text-sm">
                  <span>📞 {data.contact_no}</span>
                  <span>Joined: {new Date(data.joining_date).toLocaleDateString('en-IN')}</span>
                  <span className={`font-semibold ${data.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {data.is_active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <IconButton
                onClick={() => handleViewOpen(data)}
                aria-label="view"
                color="success"
              >
                <RemoveRedEyeIcon />
              </IconButton>
              <IconButton
                color="warning"
                onClick={() => handleEditEmployeeOpen(data)}
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => handleDeleteOpen(data)}
                aria-label="delete"
                color="error"
              >
                <Delete />
              </IconButton>
            </div>
          </div>
          ))
        )}

        {/* Pagination */}
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </div>

      {/* Delete Employee Modal */}
      <ModalComp open={deleteOpen} onClose={handleDeleteClose}>
        <div className="w-full ">
          <div>Do you want to deactivate this employee? They will not be able to login, but their data will be preserved.</div>
          <div className="flex mt-8 justify-end gap-4">
            <CloseBtn
              onClick={handleDeleteClose}
              className={"border border-gray"}
            >
              Close
            </CloseBtn>
            <DeleteBtn onClick={deleteData}>Deactivate</DeleteBtn>
          </div>
        </div>
      </ModalComp>

      {/* View Modal */}

      <ModalComp
        title={"Employee Details"}
        open={viewOpen}
        onClose={handleViewClose}
        maxWidth={1200}
      >
        {employeeDetailsData && (
          <div className="mt-4 h-fit no-scrollbar overflow-y-scroll border-t border-gray-500">
            <div className="     ">
              <Grid2 container spacing={2} className="mt-4">
                <Grid2 size={{xs:12, md:6}} className=" ">
                  <div className="border border-gray-500 rounded-[.5rem] px-2 flex gap-y-2 gap-x-8 flex-row flex-1 ">
                    <div className="">
                      <div className="overflow-hidden w-[10rem] h-[10rem]">
                        <img
                          className=" w-full h-full rounded-[50%]"
                          src={employeeDetailsData.documents?.photo}
                          alt="Employee Image"
                          loading="true"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="">
                        <h2 className="text-xl font-bold">
                          {employeeDetailsData.name}
                        </h2>
                        <p className="text-gray-600">
                          {employeeDetailsData.employee_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-500 rounded-[.5rem] mt-4">
                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Email</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.user?.email}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Contact no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.contact_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Alternate contact no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.alternate_contact_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Father Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.father_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Gender</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.gender}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Pan Card no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.pan_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Aadhar Card no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.aadhar_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">D.O.B</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData?.dob}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Department</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.department || 'N/A'}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Designation</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.designation || 'N/A'}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Joining Date</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.joining_date}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-0 px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Status</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="w-fit text-white ">
                          {" "}
                          {employeeDetailsData.user?.is_active == true ? (
                            <p className="bg-green-700 px-4  rounded-[2.5rem]">
                              Active
                            </p>
                          ) : (
                            <p className="bg-red-700  px-4  rounded-[2.5rem]">
                              Not Active
                            </p>
                          )}
                        </div>
                      </Grid2>
                    </Grid2>
                  </div>

                  {/* Documents Section - Enhanced UI */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div 
                      className="font-bold text-lg text-blue-700 bg-blue-100 px-4 py-3 border-b border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={() => setShowDocuments(!showDocuments)}
                    >
                      <span className="flex items-center gap-2">📄 Documents</span>
                      <span className="text-xs font-normal">{showDocuments ? '▼' : '▶'}</span>
                    </div>
                    {showDocuments && employeeDetailsData.documents && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {employeeDetailsData.documents?.higher_education_certificate && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">📜 Higher Education Certificate</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.higher_education_certificate, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                          </div>
                          )}
                          
                          {employeeDetailsData.documents?.resume && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">📑 Resume</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.resume, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                        </div>
                          )}
                          
                          {employeeDetailsData.documents?.aadhar_card && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🆔 Aadhar Card</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.aadhar_card, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                        </div>
                          )}
                          
                          {employeeDetailsData.documents?.pan_card && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🪪 PAN Card</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.pan_card, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Grid2>

                <Grid2 size={{xs:12, md:6}}>
                  {/* Current Address - Enhanced UI */}
                  <div className="border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <div 
                      className="font-bold text-lg text-green-700 bg-green-100 px-4 py-3 border-b border-green-200 flex items-center justify-between cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => setShowCurrentAddress(!showCurrentAddress)}
                    >
                      <span className="flex items-center gap-2">📍 Current Address</span>
                      <span className="text-xs font-normal">{showCurrentAddress ? '▼' : '▶'}</span>
                    </div>
                    {showCurrentAddress && employeeDetailsData.current_address && (
                      <div>
                        <div className="px-4 py-2 flex gap-2 bg-white border-b border-green-200">
                          <button 
                            className="text-xs text-green-600 hover:text-green-800 font-medium bg-white px-2 py-1 rounded border border-green-300"
                            onClick={() => {
                              const addr = employeeDetailsData.current_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              navigator.clipboard.writeText(address);
                              alert('Address copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-white px-2 py-1 rounded border border-blue-300"
                            onClick={() => {
                              const addr = employeeDetailsData.current_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                            }}
                          >
                            🗺️ View Map
                          </button>
                        </div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.city}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.state}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.pincode}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.country}
                            </div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  {/* Permanent Address - Enhanced UI */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                    <div 
                      className="font-bold text-lg text-purple-700 bg-purple-100 px-4 py-3 border-b border-purple-200 flex items-center justify-between cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => setShowPermanentAddress(!showPermanentAddress)}
                    >
                      <span className="flex items-center gap-2">🏠 Permanent Address</span>
                      <span className="text-xs font-normal">{showPermanentAddress ? '▼' : '▶'}</span>
                    </div>
                    {showPermanentAddress && employeeDetailsData.permanent_address && (
                      <div>
                        <div className="px-4 py-2 flex gap-2 bg-white border-b border-purple-200">
                          <button 
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium bg-white px-2 py-1 rounded border border-purple-300"
                            onClick={() => {
                              const addr = employeeDetailsData.permanent_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              navigator.clipboard.writeText(address);
                              alert('Address copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-white px-2 py-1 rounded border border-blue-300"
                            onClick={() => {
                              const addr = employeeDetailsData.permanent_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                            }}
                          >
                            🗺️ View Map
                          </button>
                        </div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.permanent_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.city}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.state}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.pincode}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.country}</div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  {/* Bank Details - Enhanced UI with Masked Account */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <div 
                      className="font-bold text-lg text-orange-700 bg-orange-100 px-4 py-3 border-b border-orange-200 flex items-center justify-between cursor-pointer hover:bg-orange-200 transition-colors"
                      onClick={() => setShowBankDetails(!showBankDetails)}
                    >
                      <span className="flex items-center gap-2">🏦 Bank Details</span>
                      <span className="text-xs font-normal">{showBankDetails ? '▼' : '▶'}</span>
                    </div>
                    {showBankDetails && employeeDetailsData.bank_details && (
                      <div>
                        <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Account Holder Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.account_holder_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Bank Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.bank_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Account Number</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showAccountNumber 
                              ? employeeDetailsData.bank_details?.account_number 
                              : maskAccountNumber(employeeDetailsData.bank_details?.account_number)}
                          </span>
                          <button
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            {showAccountNumber ? '👁️ Hide' : '👁️ Show'}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(employeeDetailsData.bank_details?.account_number);
                              alert('Account number copied!');
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">IFSC Code</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-600">{employeeDetailsData.bank_details?.ifsc_code}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(employeeDetailsData.bank_details?.ifsc_code);
                              alert('IFSC code copied!');
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-0 px-4 py-2"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Branch</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.branch}</div>
                      </Grid2>
                    </Grid2>
                      </div>
                    )}
                  </div>

                </Grid2>
              </Grid2>
            </div>
            
            {/* Download and Print Buttons */}
            <div className="mt-6 flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => {
                  // Generate PDF using jsPDF
                  const doc = new jsPDF();
                  
                  // Set title
                  doc.setFontSize(18);
                  doc.setTextColor(0, 0, 255);
                  doc.text('Employee Details', 105, 20, { align: 'center' });
                  
                  // Personal Information
                  doc.setFontSize(14);
                  doc.setTextColor(0, 0, 0);
                  doc.text('Personal Information', 14, 35);
                  
                  let yPos = 45;
                  doc.setFontSize(11);
                  doc.text(`Name: ${employeeDetailsData.name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Email: ${employeeDetailsData.user?.email || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Contact: ${employeeDetailsData.contact_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Alternate Contact: ${employeeDetailsData.alternate_contact_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Father Name: ${employeeDetailsData.father_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Gender: ${employeeDetailsData.gender || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`PAN Card: ${employeeDetailsData.pan_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Aadhar Card: ${employeeDetailsData.aadhar_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`DOB: ${employeeDetailsData.dob || 'N/A'}`, 14, yPos);
                  yPos += 10;
                  
                  // Employment Details
                  doc.setFontSize(14);
                  doc.text('Employment Details', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  doc.text(`Department: ${employeeDetailsData.department?.title || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Designation: ${employeeDetailsData.designation?.title || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Joining Date: ${employeeDetailsData.joining_date || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Status: ${employeeDetailsData.user?.is_active ? 'Active' : 'Inactive'}`, 14, yPos);
                  yPos += 10;
                  
                  // Current Address
                  doc.setFontSize(14);
                  doc.text('Current Address', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  const currentAddress = `${employeeDetailsData.current_address?.address || 'N/A'}, ${employeeDetailsData.current_address?.city || 'N/A'}, ${employeeDetailsData.current_address?.state || 'N/A'} - ${employeeDetailsData.current_address?.pincode || 'N/A'}`;
                  doc.text(currentAddress, 14, yPos);
                  yPos += 10;
                  
                  // Permanent Address
                  doc.setFontSize(14);
                  doc.text('Permanent Address', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  const permanentAddress = `${employeeDetailsData.permanent_address?.address || 'N/A'}, ${employeeDetailsData.permanent_address?.city || 'N/A'}, ${employeeDetailsData.permanent_address?.state || 'N/A'} - ${employeeDetailsData.permanent_address?.pincode || 'N/A'}`;
                  doc.text(permanentAddress, 14, yPos);
                  yPos += 10;
                  
                  // Bank Details
                  doc.setFontSize(14);
                  doc.text('Bank Details', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  doc.text(`Account Holder: ${employeeDetailsData.bank_details?.account_holder_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Bank Name: ${employeeDetailsData.bank_details?.bank_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Account Number: ${employeeDetailsData.bank_details?.account_number || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`IFSC Code: ${employeeDetailsData.bank_details?.ifsc_code || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Branch: ${employeeDetailsData.bank_details?.branch || 'N/A'}`, 14, yPos);
                  
                  // Save PDF
                  doc.save(`employee-${employeeDetailsData.name}-details.pdf`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                📥 Download PDF
              </button>
              
              <button
                onClick={() => {
                  // Print employee details
                  window.print();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        )}
      </ModalComp>

      {/* for Add Emloyee modal */}

      {/* Edit employee modal */}
    </div>
  );
};

export default Employee;
