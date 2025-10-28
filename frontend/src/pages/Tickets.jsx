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
  Modal,
  Box,
  Grid2,
  IconButton,
} from "@mui/material";
import { Link } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete";import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ModalComp from "../components/Modal/ModalComp";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import CloseBtn from "../components/Buttons/CloseBtn";
import DeleteBtn from "../components/Buttons/DeleteBtn";
import BASE_API_URL from "../data";
import { set, useForm } from "react-hook-form";

// import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../utils";
import axios from "axios";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import { getToken } from "../Token";



// Select for status
const SelectOption = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  )
);

const SelectProject = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Project</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
    </>
  )
);

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

//pagination
const Tickets = () => {
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

  // To fetch the ticket data list
  const getTicketsData = async (pageNumber, pageSize) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/tickets/`, {
          params: {
            page: pageNumber + 1,
            page_size: pageSize,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setTicketsData(response.data.results);
        setCount(response.data.count);
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to fetch tickets data.");
    }
  };

  useEffect(() => {
    getTicketsData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  //create ticket modal
  const [createTicketsOpen, setCreateTicketsOpen] = useState(false);

  const handleCreateTicketsOpen = () => {
    reset({
      title: '',
      project_name_id: '',
      client_name_id: '',
      status: '',
      assign_to_id: '',
      priority: '',
      description: '',
    });
    setCreateTicketsOpen(true);
  };
  const handleCreateTicketsClose = () => {
    setCreateTicketsOpen(false);
  };

  //Delete ticket modal
  const [deleteTicketsOpen, setDeleteTicketsOpen] = useState(false);
  const handleDeleteTicketsOpen = (data) => {
    if (localStorage.getItem("ticketsId")) {
      localStorage.removeItem("ticketsId");
    }
    localStorage.setItem("ticketsId", data.id);
    setDeleteTicketsOpen(true);
  };
  const handleDeleteTicketsClose = () => {
    setDeleteTicketsOpen(false);
  };

  // Employee data variable
  const [ticketsData, setTicketsData] = useState([]);


  // Employee Name Data
  const [employeeNameData, setEmployeeNameData] = useState();
  const getEmployeeNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/employees-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setEmployeeNameData(response.data);
    } catch (error) { }
  };

  // Project Name data
  const [projectNameData, setProjectNameData] = useState();
  const getProjectNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/projects-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProjectNameData(response.data);
    } catch (error) { }
  };

  // get client name data
  const [clientNameData, setClientNameData] = useState();
  const getClientNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/clients-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setClientNameData(response.data);
    } catch (error) { }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  

  // Edit ticket Modal
  const [editTicketsOpen, setEditTicketsOpen] = useState(false);

  const handleEditTicketsOpen = (data) => {
    if (localStorage.getItem("ticketsId")) {
      localStorage.removeItem("ticketsId");
    }
    localStorage.setItem("ticketsId", data.id);
    reset({
      title: data.title,
      project_name_id: data.project_name.id,
      client_name_id: data.client_name.id,
      status: data.status,
      assign_to_id: data.assign_to.id,
      priority: data.priority,
      description: data.description,
    });
    setEditTicketsOpen(true);
  };
  const handleEditTicketsClose = () => {
    setEditTicketsOpen(false);
  };

  //view modal
  const [viewTicketsOpen, setViewTicketsOpen] = useState(false);
  // Employee details vars
  const [ticketDetailsData, setTicketDetailsData] = useState({});
  // get ticket;s detail dat
  const handleViewTicketsOpen = async (data) => {
    setViewTicketsOpen(true);
    setTicketDetailsData(data);
    
  };
  const handleViewTicketsClose = () => {
    setViewTicketsOpen(false);
  };

  

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Post API Call
  const createTicketForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(`${BASE_API_URL}/tickets/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        setShowSuccess(true);
        setShowMessage("Ticket created successfully.");
        getTicketsData(page, rowsPerPage);
        handleCreateTicketsClose();
        reset();
      }
    } catch (error) {
      if (error.response) {
        const data = error.response?.data;

        if (data.detail) {
          setShowMessage(data.detail);
        } else if (data.error) {
          setShowMessage(data.error);
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
  const editTicketForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const ticketId = localStorage.getItem("ticketsId");
      if (accessToken && ticketId) {
        const response = await axios.put(
          `${BASE_API_URL}/tickets/${ticketId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 200) {
          setShowSuccess(true);
          setShowMessage("Ticket edited successfully.");
          getTicketsData(page, rowsPerPage);
          handleEditTicketsClose();
        }
      }
    } catch (error) {
      if (error.response) {
        const data = error.response?.data;
        if (data.detail) {
          setShowMessage(data.detail);
        } else if (data.error) {
          setShowMessage(data.error);
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

  // Use Effect 
  useEffect(() => {
    getEmployeeNameData();
    getProjectNameData();
    getClientNameData();
  }, []);

  // Delete api call
  const deleteTicketData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const ticketId = localStorage.getItem("ticketsId");
      if (accessToken && ticketId) {
        const response = await axios.delete(
          `${BASE_API_URL}/tickets/${ticketId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 204) {
          setShowSuccess(true);
          setShowMessage("Ticket deleted successfully.");
          getTicketsData(page, rowsPerPage);
          handleDeleteTicketsClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to delete ticket.");
    }
  };
  


  //pagination
  //const paginatedData=ticketsData.slice(
   // page*rowsPerPage,
   // page*rowsPerPage + rowsPerPage
 // );

  return (
    <div>
      {/* Show alerts */}
      <ErrorAlert
        show={showError}
        message={showMessage}
        onClose={() => setShowError(false)}
      />
      <SuccessAlert
        message={showMessage}
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <div className="">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" to={"/"}>
            Dashboard
          </Link>
          <Typography sx={{ color: "text.primary" }}>Tickets</Typography>
        </Breadcrumbs>

        {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <h4 className="text-2xl font-bold">Tickets</h4>
          

          <PrimaryBtn onClick={handleCreateTicketsOpen}>
                          <AddIcon /> Create Tickets
                        </PrimaryBtn>
        </div>

        {/* Data Table */}
        <div className="rounded-[5px] mt-8 shadow-[2px_2px_5px_2px] shadow-gray-400 overflow-x-scroll no-scrollbar w-full">
          <TableContainer
            component={Paper}
            className="mx-auto "
            sx={{ minWidth: 1000 }}
          >
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell>Title</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Assign To</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticketsData && 
                  ticketsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.title}</TableCell>
                      <TableCell>{data.project_name?.title}</TableCell>
                      <TableCell>{data.assign_to?.name}</TableCell>
                      <TableCell>{data.client_name?.name}</TableCell>
                      <TableCell>{data.priority}</TableCell>
                      <TableCell>{data.status}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewTicketsOpen(data)}
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditTicketsOpen(data)}
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteTicketsOpen(data)}
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

        {/* Create Tickets Modal */}
        <ModalComp
          open={createTicketsOpen}
          onClose={handleCreateTicketsClose}
          title={"Create Ticket"}
        >
          <form onSubmit={handleSubmit(createTicketForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ticketTitle">
                    Title<span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Title"
                    type="text"
                    name="ticketTitle"
                    id="ticketTitle"
                    {...register("title", {
                      required: "This field is required."
                    })}
                  />
                  {errors.title && <small className="text-red-600">{errors.title.message}</small>}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectProject
                    {...register("project_name_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Project Name"
                    options={projectNameData}
                  />
                  {errors.project_name_id && (
                    <small className="text-red-600">{errors.project_name_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOption
                    {...register("client_name_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Client Name"
                    options={clientNameData}
                    selectOption={"Client Name"}
                  />
                  {errors.client_name_id && (
                    <small className="text-red-600">{errors.client_name_id.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("status", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Status"
                    options={["Open", "Close"]}
                    selectOption={"Status"}
                  />
                  {errors.status && <small className="text-red-600">{errors.status.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOption
                    {...register("assign_to_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Assign To"
                    options={employeeNameData}
                    selectOption={"Assign to"}
                  />
                  {errors.assign_to_id && (
                    <small className="text-red-600">{errors.assign_to_id.message}</small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("priority", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Priority"
                    options={["High", "Medium", "Low"]}
                    selectOption={"Priority"}
                  />
                  {errors.priority && <small className="text-red-600">{errors.priority.message}</small>}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="ticketDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="Ticket Description"
                  rows={4}
                  name="ticketDescription"
                  id="ticketDescription"
                  {...register("description", {
                    required: {
                      value: true,
                      message: (
                        <span >
                          This field is required.
                        </span>
                      ),
                    },
                  })}
                ></textarea>
                {errors.description && (
                  <small className="text-red-600">{errors.description.message}</small>
                )}
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateTicketsClose}>Close</CloseBtn>
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

        {/* Edit Task Modal */}
        <ModalComp
          title={"Edit Task"}
          open={editTicketsOpen}
          onClose={handleEditTicketsClose}
        >
          <form onSubmit={handleSubmit(editTicketForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ticketTitle">
                    Title<span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Title"
                    type="text"
                    name="ticketTitle"
                    id="ticketTitle"
                    {...register("title", {
                      required: "This field is required."
                    })}
                  />
                  {errors.title && <small className="text-red-600">{errors.title.message}</small>}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectProject
                    {...register("project_name_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Project Name"
                    options={projectNameData}
                  />
                  {errors.project_name_id && (
                    <small className="text-red-600">{errors.project_name_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOption
                    {...register("client_name_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Client Name"
                    options={clientNameData}
                    selectOption={"Client Name"}
                  />
                  {errors.client_name_id && (
                    <small className="text-red-600">{errors.client_name_id.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("status", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Status"
                    options={["Open", "Close"]}
                    selectOption={"Status"}
                  />
                  {errors.status && <small className="text-red-600">{errors.status.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOption
                    {...register("assign_to_id", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Assign To"
                    options={employeeNameData}
                    selectOption={"Assign to"}
                  />
                  {errors.assign_to_id && (
                    <small className="text-red-600">{errors.assign_to_id.message}</small>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("priority", {
                      required: {
                        value: true,
                        message: (
                          <span >
                            This field is required.
                          </span>
                        ),
                      },
                    })}
                    label="Priority"
                    options={["High", "Medium", "Low"]}
                    selectOption={"Priority"}
                  />
                  {errors.priority && <small className="text-red-600">{errors.priority.message}</small>}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="ticketDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="Ticket Description"
                  rows={4}
                  name="ticketDescription"
                  id="ticketDescription"
                  {...register("description", {
                    required: {
                      value: true,
                      message: (
                        <span >
                          This field is required.
                        </span>
                      ),
                    },
                  })}
                ></textarea>
                {errors.description && (
                  <small className="text-red-600">{errors.description.message}</small>
                )}
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditTicketsClose}>Close</CloseBtn>
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

        {/* Delete Task Modal */}
        <ModalComp open={deleteTicketsOpen} onClose={handleDeleteTicketsClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteTicketsClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteTicketData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/*view modal*/}

        <ModalComp
          title={"Ticket Details"}
          open={viewTicketsOpen}
          onClose={handleViewTicketsClose}
        >
          {ticketDetailsData && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold"> Title</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {" "}
                      {ticketDetailsData.title && ticketDetailsData.title}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Project Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {ticketDetailsData.project_name &&
                        ticketDetailsData.project_name.title}
                    </div>
                  </Grid2>
                </Grid2>

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
                      {ticketDetailsData.client_name &&
                        ticketDetailsData.client_name.name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Assign To</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {ticketDetailsData.assign_to &&
                        ticketDetailsData.assign_to.name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500  px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Priority</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {ticketDetailsData.priority && ticketDetailsData.priority}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Status</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {ticketDetailsData.status && ticketDetailsData.status}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2 container columnSpacing={2} className=" px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Description</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {ticketDetailsData.description &&
                        ticketDetailsData.description}
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

export default Tickets;
