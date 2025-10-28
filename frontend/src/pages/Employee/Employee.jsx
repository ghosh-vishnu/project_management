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

const Employee = () => {
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
  // View Modal open and close
  const [viewOpen, setViewOpen] = useState(false);
  const handleViewOpen = (data) => {
    setEmployeeDetailsData(data);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // Employee data variable
  const [employeeData, setEmployeeData] = useState([]);

  // To fetch the employee data list
  const getEmployeeData = async (pageNumber, pageSize) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/employee/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1, // API might be 1-indexed, but TablePagination is 0-indexed
          page_size: pageSize,
        },
      });
      setEmployeeData(response.data.results);
      setCount(response.data.count);
    } catch (error) {}
  };

  // Use Effect
  useEffect(() => {
    getEmployeeData(page, rowsPerPage);
  }, [page, rowsPerPage]);

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
          `${BASE_API_URL}/peoples/employee/${employeeId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          getEmployeeData(page, rowsPerPage);
          setShowSuccess(true);
          setShowMessage(" deleted successfully.");
          handleDeleteClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage(" doesn't deleted.");
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
        <div>
          <Link to={"/employee/add"}>
            <PrimaryBtn onClick={handleOpen}>
              <AddIcon /> Add Employee
            </PrimaryBtn>
          </Link>
        </div>
      </div>

      {/* Data list table */}
      <div className="bg-white mt-8 px-4 py-2 rounded-lg shadow-[2px_2px_5px_2px] shadow-gray-400">
        {employeeData.map((data) => (
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
              <div>
                <p className="font-semibold">{data.name}</p>
                <p className="text-sm text-gray-500">
                  {data.user.email} — {data.user.user_type}
                </p>
                <div className="flex gap-2 mt-1">{data.phone}</div>
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
        ))}

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
          <div>Do you wand to delete ?</div>
          <div className="flex mt-8 justify-end gap-4">
            <CloseBtn
              onClick={handleDeleteClose}
              className={"border border-gray"}
            >
              Close
            </CloseBtn>
            <DeleteBtn onClick={deleteData}>Delete</DeleteBtn>
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
                        <div>{employeeDetailsData.department?.name}</div>
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
                        <div>{employeeDetailsData.designation?.title}</div>
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

                  <div className="mt-4 border border-gray-500 rounded-[.5rem] ">
                    <div className="font-bold text-[1.1rem] text-[var(--primary1)] border-b px-4 py-2 border-gray-500">
                      Documents
                    </div>
                    {employeeDetailsData.documents && (
                      <div>
                        <div className="flex flex-wrap gap-x-6 items-center gap-y-4 border-b px-4 py-2 border-gray-500">
                          <div className="font-bold w-[15rem] ">
                            Higher Education Certificate
                          </div>

                          <div className="w-[10rem]">
                            <iframe
                              src={
                                employeeDetailsData.documents
                                  ?.higher_education_certificate
                              }
                              className="w-full h-30 border rounded-md"
                              frameBorder={0}
                            ></iframe>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b px-4 py-2 border-gray-500">
                          <div className="font-bold w-[15rem]">Resume</div>

                          <div className="w-[10rem]">
                            <iframe
                              src={employeeDetailsData.documents?.resume}
                              className="w-full h-30 border rounded-md"
                            ></iframe>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b px-4 py-2 border-gray-500">
                          <div className="font-bold w-[15rem]">Aadhar Card</div>

                          <div className="w-[10rem]">
                            <iframe
                              src={employeeDetailsData.documents?.aadhar_card}
                              className="w-full h-30 border rounded-md"
                            ></iframe>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-0 px-4 py-2 border-gray-500">
                          <div className="font-bold w-[15rem]">PAN Card</div>

                          <div className="w-[10rem]">
                            <iframe
                              src={employeeDetailsData.documents?.pan_card}
                              className="w-full h-30 border rounded-md"
                            ></iframe>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Grid2>

                <Grid2 size={{xs:12, md:6}}>
                  <div className="border border-gray-500 rounded-[.5rem] ">
                    <div className="font-bold text-[1.1rem] text-[var(--primary1)] border-b px-4 py-2 border-gray-500">
                      Current Address
                    </div>
                    {employeeDetailsData.current_address && (
                      <div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.current_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.current_address?.city}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.current_address?.state}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.current_address?.pincode}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.current_address?.country}
                            </div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border border-gray-500 rounded-[.5rem] ">
                    <div className="font-bold text-[1.1rem] text-[var(--primary1)] border-b px-4 py-2 border-gray-500">
                      Permanent Address
                    </div>
                    {employeeDetailsData.permanent_address && (
                      <div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>
                              {employeeDetailsData.permanent_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>{employeeDetailsData.permanent_address?.city}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>{employeeDetailsData.permanent_address?.state}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>{employeeDetailsData.permanent_address?.pincode}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2 border-gray-500"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div>{employeeDetailsData.permanent_address?.country}</div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border border-gray-500 rounded-[.5rem] ">
                    <div className="font-bold text-[1.1rem] text-[var(--primary1)] border-b px-4 py-2 border-gray-500">
                      Bank Details
                    </div>
                    {employeeDetailsData.bank_details && (
                      <div>
                        <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Account Holder Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.bank_details?.account_holder_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Bank Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.bank_details?.bank_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Account Number</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.bank_details?.account_number}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">IFSC Code</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.bank_details?.ifsc_code}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-0 px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Branch</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.bank_details?.branch}</div>
                      </Grid2>
                    </Grid2>
                      </div>
                    )}
                  </div>
                </Grid2>
              </Grid2>
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
