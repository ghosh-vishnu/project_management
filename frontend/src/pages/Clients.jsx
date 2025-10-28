import React, { useEffect, useState } from "react";

import {
  Breadcrumbs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Grid2,
  IconButton,
} from "@mui/material";
import { Link } from "react-router";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import CloseBtn from "../components/Buttons/CloseBtn";
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteBtn from "../components/Buttons/DeleteBtn";
import ModalComp from "../components/Modal/ModalComp";
import BASE_API_URL from "../data";
import { set, useForm } from "react-hook-form";

import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../utils";
import axios from "axios";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import { getToken } from "../Token";

const SelectOthers = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const Clients = () => {
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

  

  const [clientsData, setClientsData] = useState([]);

  // To fetch the client data list
  const getClientsData = async (pageNumber, pageSize) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/peoples/clients/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: pageNumber + 1, 
            page_size: pageSize,
          },
        });
        setClientsData(response.data.results);
        setCount(response.data.count)
      }else{
        window.location.href = "/"
      }
    } catch (error) {
      // console.log(error)
    }
  };

  //Use Effect
  useEffect(() => {
    getClientsData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  // Create client modal
  const [createClientsOpen, setCreateClientsOpen] = useState(false);

  const handleCreateClientsOpen = () => {
    reset({
      name: "",
      email: "",
      phone: "",
      gender: "",
      address: "",
      country: "",
      state: "",
      pincode: "",
    });
    setCreateClientsOpen(true);
  };
  const handleCreateClientsClose = () => {
    setCreateClientsOpen(false);
  };

  // Edit client Modal
  const [editClientsOpen, setEditClientsOpen] = useState(false);

  const handleEditClientsOpen = (data) => {
    if (localStorage.getItem("clientsId")) {
      localStorage.removeItem("clientsId");
    }
    localStorage.setItem("clientsId", data.id);
    // console.log(data)
    reset({
      name: data.name,
      email: data.user.email,
      phone: data.phone,
      gender: data.gender,
      address: data.address,
      country: data.country,
      state: data.state,
      pincode: data.pincode,
    });
    setEditClientsOpen(true);
  };

  const handleEditClientsClose = () => {
    setEditClientsOpen(false);
  };

  // Delete client Modal
  const [deleteClientsOpen, setDeleteClientsOpen] = useState(false);
  const handleDeleteClientsOpen = (data) => {
    if (localStorage.getItem("clientsId")) {
      localStorage.removeItem("clientsId");
    }
    localStorage.setItem("clientsId", data.id);
    setDeleteClientsOpen(true);
  };
  const handleDeleteClientsClose = () => {
    setDeleteClientsOpen(false);
  };

  // View client Modal
  const [viewClientsOpen, setViewClientsOpen] = useState(false);
  const [clientDetailsData, setClientDetailsData] = useState({});

  const handleViewClientsOpen = (data) => {
    setViewClientsOpen(true);
    setClientDetailsData(data);
  };

  const handleViewClientsClose = () => {
    setViewClientsOpen(false);
  };

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Post API Call
  const createClientForm = async (data) => {
    try {
      // console.log('data',data)
      const { email, password, confirm_password, ...formData } = data;
      formData["user"] = {
        email: email,
        password: password,
        confirm_password: confirm_password,
        user_type: "Client",
      };
      // console.log('formData',formData)
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/peoples/clients/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Client added successfully.");
        getClientsData(page, rowsPerPage);
        reset();
      } else {
        setShowError(true);
        setShowMessage("Failed to add client.");
      }
    } catch (error) {
      // console.log(error.response);
      if (error.response) {
        const data = error.response?.data;

        // //  single string error
        if (data.detail) {
          setShowMessage(data.detail);
        }
        // single error message
        else if (data.error) {
          setShowMessage(data.error);
        }
        // serializer field errors (dict of arrays)
        else if (data.user) {
          let messages = [];

          for (const field in data.user) {
            if (Array.isArray(data.user[field])) {
              messages.push(`${field} : ${data.user[field][0]}`);
            }
          }
          setShowMessage(messages);
        } else if (typeof data === "object") {
          let messages = [];

          for (const field in data) {
            if (Array.isArray(data[field])) {
              messages.push(`${data[field][0]}`);
            }
          }
          setShowMessage(messages);
        } else {
          setShowMessage("Something went wrong. Please try again.");
        }
      }
      setShowError(true);
    }
  };

  // Update api call
  const editClientsForm = async (data) => {
    
    try {
      const { email, password, confirm_password, ...formData } = data;
      formData["user"] = {
        email: email,
        user_type: "client",
      };
      if (password) {
        formData["user"] = {
          ...formData["user"],
          password: password,
          confirm_password: confirm_password,
        };
      }
      // console.log(formData);
      const accessToken = getToken("accessToken");
      const clientsId = localStorage.getItem("clientsId");
      if (accessToken && clientsId) {
        const response = await axios.put(
          `${BASE_API_URL}/peoples/clients/${clientsId}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log(response)
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Clients edited successfully.");
          getClientsData(page, rowsPerPage);
          handleDeleteClientsClose();
        }
      }
    } catch (error) {
      // console.log(error.response)
      if (error.response) {
        const data = error.response?.data;

        // //  single string error
        if (data.detail) {
          setShowMessage(data.detail);
        }
        // single error message
        else if (data.error) {
          setShowMessage(data.error);
        }
        // serializer field errors (dict of arrays)
        else if (data.user) {
          let messages = [];

          for (const field in data.user) {
            if (Array.isArray(data.user[field])) {
              messages.push(`${field} : ${data.user[field][0]}`);
            }
          }
          setShowMessage(messages);
        } else if (typeof data === "object") {
          let messages = [];

          for (const field in data) {
            if (Array.isArray(data[field])) {
              messages.push(`${data[field][0]}`);
            }
          }
          setShowMessage(messages);
        } else {
          setShowMessage("Something went wrong. Please try again.");
        }
      }
      setShowError(true);
    }
  };

  // Delete api call
  const deleteClientData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const clientId = localStorage.getItem("clientsId");
      if (accessToken && clientId) {
        const response = await axios.delete(
          `${BASE_API_URL}/peoples/clients/${clientId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Client deleted successfully.");
          getClientsData(page, rowsPerPage);
          handleDeleteClientsClose();
        }
      }
    } catch (error) {
      // console.log(error.response)
      setShowError(true);
      setShowMessage("Failed to delete client.");
    }
  };

  


  return (
    <div>
      {/* Show alerts */}
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
        <div className="">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Clients</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Clients</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateClientsOpen}>
              <AddIcon /> Add Clients
            </PrimaryBtn>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[5px] mt-8 shadow-[2px_2px_5px_2px] shadow-gray-400 overflow-x-scroll no-scrollbar w-full">
          <TableContainer
            component={Paper}
            className=" mx-auto "
            sx={{ minWidth: 1000 }}
          >
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact no.</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientsData &&
                  clientsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.user && data.user.email}</TableCell>
                      <TableCell>{data.phone}</TableCell>
                      <TableCell>{data.address}</TableCell>
                      <TableCell>{data.country}</TableCell>
                      <TableCell>{data.state}</TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleViewClientsOpen(data)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditClientsOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteClientsOpen(data)}
                          aria-label="delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </div>

        {/* Create client Modal */}
        <ModalComp
          open={createClientsOpen}
          onClose={handleCreateClientsClose}
          title={"Add Client"}
        >
          <form onSubmit={handleSubmit(createClientForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientName">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Client Name"
                    type="text"
                    name="clientName"
                    id="clientName"
                    {...register("name", {
                      required: "This field is required.",
                      minLength: {
                        value: 3,
                        message: <span>Length should be greater than 2.</span>,
                      },
                    })}
                  />
                  {errors.name && (
                    <small className="text-red-600">
                      {errors.name.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientEmail">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Client Email"
                    name="clientEmail"
                    id="clientEmail"
                    {...register("email", {
                      pattern: {
                        value: EMAIL_REGEX,
                        message: "Email is not valid.",
                      },
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.email && (
                    <small className="text-red-600">
                      {errors.email.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientContact">
                    Contact No. <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Client Contact No."
                    name="clientContact"
                    id="clientContact"
                    {...register("phone", {
                      pattern: {
                        value: PHONE_REGEX,
                        message: "Contact no. is not valid.",
                      },
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.phone && (
                    <small className="text-red-600">
                      {errors.phone.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("gender", {
                      required: "This fied is required.",
                    })}
                    label="Gender"
                    options={["Male", "Female", "Other"]}
                    selectOption={"Gender"}
                  />
                  {errors.gender && (
                    <small className="text-red-600">
                      {errors.gender.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("country", {
                      required: "This fied is required.",
                    })}
                    label="Country"
                    options={[
                      "India",
                      "USA",
                      "KSA",
                      "Qatar",
                      "Japan",
                      "Bangladesh",
                      "Nepal",
                      "Pakistan",
                      "UAE",
                      "UK",
                    ]}
                    selectOption={"Country"}
                  />
                  {errors.country && (
                    <small className="text-red-600">
                      {errors.country.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("state", {
                      required: "This fied is required.",
                    })}
                    label="State"
                    options={[
                      "Jharkhand",
                      "Riyadh",
                      "Dhaka",
                      "Lahore",
                      "Kathmandu",
                      "Dubai",
                      "Halfmoon",
                      "London",
                      "Texas",
                      "Tokyo",
                    ]}
                    selectOption={"State"}
                  />
                  {errors.state && (
                    <small className="text-red-600">
                      {errors.state.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientAddress">
                    Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="clientAddress"
                    id="clientAddress"
                    placeholder="Client Address"
                    {...register("address", {
                      required: "This fied is required.",
                    })}
                  ></textarea>
                  {errors.address && (
                    <small className="text-red-600">
                      {errors.address.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientPincode">
                    Pincode <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Client pincode"
                    type="text"
                    id="clientPincode"
                    name="clientPincode"
                    {...register("pincode", {
                      required: "This fied is required.",
                    })}
                  />
                  {errors.pincode && (
                    <small className="text-red-600">
                      {errors.pincode.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="password">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="enter password"
                    name="password"
                    id="password"
                    {...register("password", {
                      pattern: {
                        value: PASSWORD_REGEX,
                        message:
                          "Password must contain a letter , a digit , a special character and minimum length should be 7.",
                      },
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.password && (
                    <small className="text-red-600">
                      {errors.password.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="confirm_password">
                    Confirm password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Confirm password"
                    name="confirm_password"
                    id="confirm_password"
                    {...register("confirm_password", {
                      required: "This field is required.",
                      validate: (value) => {
                        const password = getValues("password");
                        return (
                          password === value ||
                          "Password and Confirm password must be same."
                        );
                      },
                    })}
                  />
                  {errors.confirm_password && (
                    <small className="text-red-600">
                      {errors.confirm_password.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateClientsClose}>Close</CloseBtn>
                <PrimaryBtn
                  type={"Submit"}
                  disabled={isSubmitting}
                  className={`${isSubmitting ? " cursor-wait  " : ""}`}
                >
                  {isSubmitting ? "Submitting" : "Submit"}
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit client Modal */}
        <ModalComp
          title={"Edit client"}
          open={editClientsOpen}
          onClose={handleEditClientsClose}
        >
          <form onSubmit={handleSubmit(editClientsForm)} action="">
          <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientName">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Client Name"
                    type="text"
                    name="clientName"
                    id="clientName"
                    {...register("name", {
                      required: "This field is required.",
                      minLength: {
                        value: 3,
                        message: <span>Length should be greater than 2.</span>,
                      },
                    })}
                  />
                  {errors.name && (
                    <small className="text-red-600">
                      {errors.name.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientEmail">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Client Email"
                    name="clientEmail"
                    id="clientEmail"
                    {...register("email", {
                      pattern: {
                        value: EMAIL_REGEX,
                        message: "Email is not valid.",
                      },
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.email && (
                    <small className="text-red-600">
                      {errors.email.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientContact">
                    Contact No. <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Client Contact No."
                    name="clientContact"
                    id="clientContact"
                    {...register("phone", {
                      pattern: {
                        value: PHONE_REGEX,
                        message: "Contact no. is not valid.",
                      },
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.phone && (
                    <small className="text-red-600">
                      {errors.phone.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("gender", {
                      required: "This fied is required.",
                    })}
                    label="Gender"
                    options={["Male", "Female", "Other"]}
                    selectOption={"Gender"}
                  />
                  {errors.gender && (
                    <small className="text-red-600">
                      {errors.gender.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("country", {
                      required: "This fied is required.",
                    })}
                    label="Country"
                    options={[
                      "India",
                      "USA",
                      "KSA",
                      "Qatar",
                      "Japan",
                      "Bangladesh",
                      "Nepal",
                      "Pakistan",
                      "UAE",
                      "UK",
                    ]}
                    selectOption={"Country"}
                  />
                  {errors.country && (
                    <small className="text-red-600">
                      {errors.country.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("state", {
                      required: "This fied is required.",
                    })}
                    label="State"
                    options={[
                      "Jharkhand",
                      "Riyadh",
                      "Dhaka",
                      "Lahore",
                      "Kathmandu",
                      "Dubai",
                      "Halfmoon",
                      "London",
                      "Texas",
                      "Tokyo",
                    ]}
                    selectOption={"State"}
                  />
                  {errors.state && (
                    <small className="text-red-600">
                      {errors.state.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientAddress">
                    Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="clientAddress"
                    id="clientAddress"
                    placeholder="Client Address"
                    {...register("address", {
                      required: "This fied is required.",
                    })}
                  ></textarea>
                  {errors.address && (
                    <small className="text-red-600">
                      {errors.address.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="clientPincode">
                    Pincode <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Client pincode"
                    type="text"
                    id="clientPincode"
                    name="clientPincode"
                    {...register("pincode", {
                      required: "This fied is required.",
                    })}
                  />
                  {errors.pincode && (
                    <small className="text-red-600">
                      {errors.pincode.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="password">
                    Password 
                  </label>
                  <input
                    type="password"
                    placeholder="enter password"
                    name="password"
                    id="password"
                    {...register("password", {
                      required: {
                        value: false,
                        
                      },
                      pattern: {
                        value: PASSWORD_REGEX,
                        message:
                          "Password must contain a letter , a digit , a special character and minimum length should be 7.",
                      },
                      
                    })}
                  />
                  {errors.password && (
                    <small className="text-red-600">
                      {errors.password.message}
                    </small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="confirm_password">
                    Confirm password 
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Confirm password"
                    name="confirm_password"
                    id="confirm_password"
                    {...register("confirm_password", {
                      required: false,
                      validate: (value) => {
                        const password = getValues("password");
                        return (
                          password === value ||
                          "Password and Confirm password must be same."
                        );
                      },
                    })}
                  />
                  {errors.confirm_password && (
                    <small className="text-red-600">
                      {errors.confirm_password.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditClientsClose}>Close</CloseBtn>
                <PrimaryBtn
                  type={"Submit"}
                  disabled={isSubmitting}
                  className={`${isSubmitting ? " cursor-wait  " : ""}`}
                >
                  {isSubmitting ? "Submitting" : "Submit"}
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Delete client Modal */}
        <ModalComp open={deleteClientsOpen} onClose={handleDeleteClientsClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteClientsClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteClientData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View client Modal */}
        <ModalComp
          title={"Client Details"}
          open={viewClientsOpen}
          onClose={handleViewClientsClose}
        >
          {clientDetailsData && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Client Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.name && clientDetailsData.name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Email</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.user && clientDetailsData.user.email}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Contact No.</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.phone && clientDetailsData.phone}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500  px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Gender</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.gender && clientDetailsData.gender}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">State</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.state && clientDetailsData.state}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Address</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.address && clientDetailsData.address}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  columnSpacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Country</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.country && clientDetailsData.country}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  columnSpacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">State</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.state && clientDetailsData.state}
                    </div>
                  </Grid2>
                </Grid2>
                <Grid2 container columnSpacing={2} className=" px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Pin code</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {clientDetailsData.pincode && clientDetailsData.pincode}
                    </div>
                  </Grid2>
                </Grid2>
              </div>
            </div>
          )}
        </ModalComp>
      </div>
    </div>
  );
};

export default Clients;
