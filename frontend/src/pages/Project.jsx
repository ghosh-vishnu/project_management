import React, { useEffect, useState } from "react";

import {
  Breadcrumbs,
  Grid2,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CloseBtn from "../components/Buttons/CloseBtn";
import DeleteBtn from "../components/Buttons/DeleteBtn";
import { Link } from "react-router";
import ModalComp from "../components/Modal/ModalComp";
import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../utils";
import axios from "axios";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import { Description } from "@mui/icons-material";
import BASE_API_URL from "../data";
import { useForm } from "react-hook-form";
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
        {options &&
          options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
      </select>
    </>
  )
);

const SelectEmployeeName = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Employee</option>
        {options &&
          options.map((option, index) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
      </select>
    </>
  )
);

const SelectClientName = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Client name</option>
        {options &&
          options.map((option, index) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
      </select>
    </>
  )
);

// const SelectStartdate = React.forwardRef(
//   ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
//     <>
//       <label>{label} <span className="text-red-600">*</span> </label>
//       <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
//         <option value="">Select {selectOption}</option>
//         {options && options.map((option, index) => (
//           <option key={index} value={option}>
//             {option.date}
//           </option>
//         ))}
//       </select>
//     </>
//   )
// );

// const SelectEnddate = React.forwardRef(
//   ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
//     <>
//       <label>{label} <span className="text-red-600">*</span> </label>
//       <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
//         <option value="">Select {selectOption}</option>
//         {options && options.map((option, index) => (
//           <option key={index} value={option}>
//             {option.date}
//           </option>
//         ))}
//       </select>
//     </>
//   )
// );

const Project = () => {
  const [count, SetCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Variables to show success and error alerts
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Create Project modal
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const handleCreateProjectOpen = () => {
    reset({
      title: "",
      start_date: "",
      end_date: "",
      status: "",
      assigned_to_id: "",
      client_name_id: "",
      budget: "",
      description: "",
    });
    setCreateProjectOpen(true);
  };
  const handleCreateProjectClose = () => {
    setCreateProjectOpen(false);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Edit project modal
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const handleEditProjectOpen = (data) => {
    if (localStorage.getItem("projectId")) {
      localStorage.removeItem("projectId");
    }
    localStorage.setItem("projectId", data.id);
    // console.log(data)
    reset({
      title: data.title,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      assigned_to_id: data.assigned_to?.id,
      client_name_id: data.client_name?.id,
      budget: data.budget,
      description: data.description,
    });
    setEditProjectOpen(true);
  };
  const handleEditProjectClose = () => {
    setEditProjectOpen(false);
  };

  // Delete modal open and close
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const handleDeleteProjectOpen = (data) => {
    if (localStorage.getItem("projectId")) {
      localStorage.removeItem("projectId");
    }
    localStorage.setItem("projectId", data.id);
    setDeleteProjectOpen(true);
  };
  const handleDeleteProjectClose = () => {
    setDeleteProjectOpen(false);
  };

  // // View Modal open and close
  const [viewProjectOpen, setViewProjectOpen] = useState(false);

  // // Get Project Details View
  const [projectdetailsdata, setProjectdetailsdata] = useState({});

  // Get Ticket Details Data
  const handleViewProjectOpen = (data) => {
    setViewProjectOpen(true);
    setProjectdetailsdata(data);
  };
  const handleViewProjectClose = () => {
    setViewProjectOpen(false);
  };

  // project data variable
  const [projectData, setProjectData] = useState([]);

  // To fetch the project data list
  const getProjectData = async (page, rowsPerPage) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/project/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: page + 1,
            page_size: rowsPerPage,
          },
        });

        setProjectData(response.data.results);
        SetCount(response.data.count);
        //consoile.log(response.data.results)
      }
    } catch (error) {}
  };

  useEffect(() => {
    getProjectData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // get employeename Data
  const [employeeNameData, setEmployeeNameData] = useState([]);
  const getEmployeeNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(
        `${BASE_API_URL}/peoples/employees-name/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setEmployeeNameData(response.data);
    } catch (error) {}
  };

  // Clients Name Data
  const [clientNameData, setClientNameData] = useState([]);
  const getClientNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(
        `${BASE_API_URL}/peoples/clients-name/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setClientNameData(response.data);
    } catch (error) {}
  };

  // Post API Call
  const createProjectForm = async (data) => {
    // console.log(data)
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(`${BASE_API_URL}/project/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Project created successfully.");
        reset();
        getProjectData(page, rowsPerPage);
      } else {
        setShowError(true);
        setShowMessage("Project doesn't created.");
      }
    } catch (error) {
      // console.log(error)
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
  const editProjectForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const projectId = localStorage.getItem("projectId");
      if (accessToken && projectId) {
        const response = await axios.put(
          `${BASE_API_URL}/project/${projectId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log(response)
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Project edited successfully.");
          getProjectData(page, rowsPerPage);
        }
      }
    } catch (error) {
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
  // Use Effect
  useEffect(() => {
    getEmployeeNameData();
    getClientNameData();
  }, []);

  // Delete api call
  const deleteProjectsData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const projectId = localStorage.getItem("projectId");
      if (accessToken && projectId) {
        const response = await axios.delete(
          `${BASE_API_URL}/project/${projectId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Projects deleted successfully.");
          getProjectData(page, rowsPerPage);
          handleDeleteProjectClose();
        }
      }
      else {
      setShowError(true);
      setShowMessage("Projects doesn't deleted.");
    }
    } catch (error) {
      
      setShowError(true);
      setShowMessage("Projects doesn't deleted.");
    }
  };

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

          <Typography sx={{ color: "text.primary" }}>Projects</Typography>
        </Breadcrumbs>

        {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6 gap-x-2 gap-y-4">
          <h4 className="text-2xl font-bold">Project</h4>
          <PrimaryBtn
            className="bg-[var(-primary1)_! important] text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={handleCreateProjectOpen}
          >
            <AddIcon /> Create Projects
          </PrimaryBtn>
        </div>

        {/* Data Table */}
        <div className="rounded-[5px] mt-8 shadow-[2px_2px_5px_2px] shadow-gray-400 overflow-x-scroll no-scrollbar w-full">
          <TableContainer
            component={Paper}
            className="mx-auto"
            sx={{ minWidth: 1000 }}
          >
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Clients Name </TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectData &&
                  projectData.map((data, index) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.title}</TableCell>
                      <TableCell>{data.status}</TableCell>
                      <TableCell>{data.start_date}</TableCell>
                      <TableCell>{data.end_date}</TableCell>
                      <TableCell>{data.client_name?.name}</TableCell>
                      <TableCell>{data.budget}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewProjectOpen(data)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditProjectOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteProjectOpen(data)}
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
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={count}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </div>

        {/*Create Project MODAL */}
        {createProjectOpen && (
          <ModalComp
            open={createProjectOpen}
            onClose={handleCreateProjectClose}
            title={"Create Project"}
          >
            <form onSubmit={handleSubmit(createProjectForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="ProjectName">
                      Project Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="Project Name"
                      placeholder="Project Name"
                      id="projectName"
                      {...register("title", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.title && (
                      <small className="text-red-500">
                        {errors.title.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="projectStartDate">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="Start Date"
                      id="projectStartDate"
                      {...register("start_date", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.start_date && (
                      <small className="text-red-600">
                        {errors.start_date.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="projectEndDate">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="End Date"
                      name="projectEndDate"
                      id="projectEndDate"
                      {...register("end_date", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.end_date && (
                      <small className="text-red-600">
                        {errors.end_date.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="budget">
                      Budget <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Budget"
                      name="Budget"
                      id="Budget"
                      {...register("budget", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.budget && (
                      <small className="text-red-600">
                        {errors.budget.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      label={"Status"}
                      selectOption={"Status"}
                      required={true}
                      options={[
                        "Not Started",
                        "Planning",
                        "In Progress",
                        "Paused",
                        "Completed",
                        "Cancelled",
                      ]}
                      {...register("status", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.status && (
                      <small className="text-red-600">
                        {errors.status.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectEmployeeName
                      label={"Assign To"}
                      options={employeeNameData}
                      {...register("assigned_to_id", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.assigned_to_id && (
                      <small className="text-red-600">
                        {errors.assigned_to_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <SelectClientName
                      label="Clients Name"
                      options={clientNameData}
                      {...register("client_name_id", {
                        required: {
                          value: true,
                          message: "This field is required.",
                        },
                      })}
                    />
                    {errors.client_name_id && (
                      <small className="text-red-600">
                        {errors.client_name_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2} className="w-full">
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <div className="w-full inputData">
                      <label htmlFor="projectDescription">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Project Description"
                        name="projectDescription"
                        id="projectDescription"
                        {...register("description", {
                          required: "This field is required.",
                        })}
                      ></textarea>
                      {errors.description && (
                        <small className="text-red-600">
                          {errors.description.message}
                        </small>
                      )}
                    </div>
                  </Grid2>
                </Grid2>
                <div className="flex flex-row flex-wrap gap-4 justify-end">
                  <CloseBtn onClick={handleCreateProjectClose}>Close</CloseBtn>
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
        )}
        {/* Edit Project Modal */}
        {editProjectOpen && (
          <ModalComp
            title={"Edit Project"}
            open={editProjectOpen}
            onClose={handleEditProjectClose}
          >
            <form onSubmit={handleSubmit(editProjectForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="ProjectName">
                      Project Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="Project Name"
                      placeholder="Project Name"
                      id="projectName"
                      {...register("title", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.title && (
                      <small className="text-red-500">
                        {errors.title.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="projectStartDate">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="Start Date"
                      id="projectStartDate"
                      {...register("start_date", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.start_date && (
                      <small className="text-red-600">
                        {errors.start_date.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="projectEndDate">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="End Date"
                      name="projectEndDate"
                      id="projectEndDate"
                      {...register("end_date", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.end_date && (
                      <small className="text-red-600">
                        {errors.end_date.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="budget">
                      Budget <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Budget"
                      name="Budget"
                      id="Budget"
                      {...register("budget", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.budget && (
                      <small className="text-red-600">
                        {errors.budget.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      label={"Status"}
                      selectOption={"Status"}
                      required={true}
                      options={[
                        "Not Started",
                        "Planning",
                        "In Progress",
                        "Paused",
                        "Completed",
                        "Cancelled",
                      ]}
                      {...register("status", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.status && (
                      <small className="text-red-600">
                        {errors.status.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectEmployeeName
                      label={"Assign To"}
                      options={employeeNameData}
                      {...register("assigned_to_id", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.assigned_to_id && (
                      <small className="text-red-600">
                        {errors.assigned_to_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <SelectClientName
                      label="Clients Name"
                      options={clientNameData}
                      {...register("client_name_id", {
                        required: {
                          value: true,
                          message: "This field is required.",
                        },
                      })}
                    />
                    {errors.client_name_id && (
                      <small className="text-red-600">
                        {errors.client_name_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2} className="w-full">
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <div className="w-full inputData">
                      <label htmlFor="projectDescription">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Project Description"
                        name="projectDescription"
                        id="projectDescription"
                        {...register("description", {
                          required: "This field is required.",
                        })}
                      ></textarea>
                      {errors.description && (
                        <small className="text-red-600">
                          {errors.description.message}
                        </small>
                      )}
                    </div>
                  </Grid2>
                </Grid2>
                <div className="flex flex-row flex-wrap gap-4 justify-end">
                  <CloseBtn onClick={handleEditProjectClose}>Close</CloseBtn>
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
        )}

        {/* Delete Projects Modal */}
        <ModalComp open={deleteProjectOpen} onClose={handleDeleteProjectClose}>
          <div className="w-full ">
            <div>Do you want to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteProjectClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteProjectsData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View Project Modal */}
        <ModalComp
          title={"Project Details"}
          open={viewProjectOpen}
          onClose={handleViewProjectClose}
        >
          {projectdetailsdata && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className="border border-gray-500 rounded-[.5rem]">
                {/* Project name */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Title</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.title}</div>
                  </Grid2>
                </Grid2>

                {/* Budget */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Budget</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.budget}</div>
                  </Grid2>
                </Grid2>

                {/* Date */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Start Date</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.start_date}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">End Date</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.end_date}</div>
                  </Grid2>
                </Grid2>

                {/* Clients Name */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">client_name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.client_name?.name}</div>
                  </Grid2>
                </Grid2>

                {/* Status */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">status</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>paused</div>
                  </Grid2>
                </Grid2>

                {/* Employee name */}
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">assigned_to</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.assigned_to?.name}</div>
                  </Grid2>
                </Grid2>

                {/* Description */}
                <Grid2
                  container
                  spacing={2}
                  className="border-0 px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Description</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{projectdetailsdata.description}</div>
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

export default Project;
