import React, { useState, useEffect } from "react";

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
import axios from "axios";
import BASE_API_URL from "../data";
import { getToken } from "../Token";
import { useForm } from "react-hook-form";
import SuccessAlert from "../components/Alert/SuccessAlert";
import ErrorAlert from "../components/Alert/ErrorAlert";

const Tasks = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Alert states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Dropdown data
  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  // Remove duplicates from data array
  const removeDuplicates = (tasks) => {
    const seen = new Map();
    const unique = [];
    
    tasks.forEach((task) => {
      const key = task.id; // Use task ID as unique identifier
      if (!seen.has(key)) {
        seen.set(key, true);
        unique.push(task);
      }
    });
    
    return unique;
  };

  // Fetch tasks data
  const getTasksData = async (pageNumber, pageSize) => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found. Please login again.");
        return;
      }
      
      const response = await axios.get(`${BASE_API_URL}/tasks/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1,
          page_size: pageSize,
        },
      });
      
      // Remove duplicates from response
      const uniqueTasks = removeDuplicates(response.data.results || []);
      setData(uniqueTasks);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setErrorMessage("Failed to fetch tasks. Please try again.");
      if (error.response?.status === 401) {
        console.error("Authentication failed. Please login again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for dropdown
  const getProjectData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const response = await axios.get(`${BASE_API_URL}/project/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page_size: 100,
        },
      });
      
      setProjectData(response.data.results || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Fetch employees for dropdown
  const getEmployeeData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const response = await axios.get(`${BASE_API_URL}/peoples/employees-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setEmployeeData(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch single task for view/edit
  const fetchTaskDetails = async (taskId) => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return null;
      
      const response = await axios.get(`${BASE_API_URL}/tasks/${taskId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching task details:", error);
      return null;
    }
  };

  useEffect(() => {
    getTasksData(page, rowsPerPage);
    getProjectData();
    getEmployeeData();
  }, [page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Form handling
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
  } = useForm();

  // Create task modal
  const [createTasksOpen, setCreateTasksOpen] = useState(false);

  const handleCreateTasksOpen = () => {
    resetCreate();
    setCreateTasksOpen(true);
  };
  const handleCreateTasksClose = () => {
    setCreateTasksOpen(false);
    resetCreate();
  };

  // Create task form submit
  const onCreateSubmit = async (formData, e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setErrorMessage("Authentication required. Please login again.");
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.taskName || !formData.taskName.trim()) {
        setErrorMessage("Task name is required");
        setSubmitting(false);
        return;
      }
      if (!formData.taskPriority || !formData.taskPriority.trim()) {
        setErrorMessage("Priority is required");
        setSubmitting(false);
        return;
      }
      if (!formData.taskStatus || !formData.taskStatus.trim()) {
        setErrorMessage("Status is required");
        setSubmitting(false);
        return;
      }
      if (!formData.taskStartDate) {
        setErrorMessage("Start date is required");
        setSubmitting(false);
        return;
      }
      if (!formData.taskEndDate) {
        setErrorMessage("End date is required");
        setSubmitting(false);
        return;
      }

      // Prepare task data
      const taskData = {
        task_name: formData.taskName.trim(),
        priority: formData.taskPriority.trim(),
        status: formData.taskStatus.trim(),
        start_date: formData.taskStartDate,
        end_date: formData.taskEndDate,
        description: formData.taskDescription?.trim() || "",
      };

      // Handle optional fields - only include if they have values
      if (formData.taskProjectName && formData.taskProjectName !== "" && formData.taskProjectName !== "0") {
        taskData.project_name_id = parseInt(formData.taskProjectName);
      }

      if (formData.taskAssignTo && formData.taskAssignTo !== "" && formData.taskAssignTo !== "0") {
        taskData.assign_to_id = parseInt(formData.taskAssignTo);
      }

      console.log("Sending task data:", taskData);

      const response = await axios.post(`${BASE_API_URL}/tasks/`, taskData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Task created successfully:", response.data);
      setSuccessMessage("Task created successfully!");
      resetCreate();
      handleCreateTasksClose();
      setPage(0); // Go back to first page to see new task
      getTasksData(0, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating task:", error);
      console.error("Full error object:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      // Better error message handling
      let errorMsg = "Failed to create task. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else {
          // Handle serializer errors which come as an object
          const errorEntries = Object.entries(error.response.data);
          if (errorEntries.length > 0) {
            const errors = errorEntries
              .map(([key, value]) => {
                const errorText = Array.isArray(value) ? value.join(', ') : String(value);
                return `${key}: ${errorText}`;
              })
              .join('; ');
            errorMsg = errors;
          }
        }
      }
      
      console.error("Final error message:", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Task Modal
  const [editTasksOpen, setEditTasksOpen] = useState(false);

  const handleEditTasksOpen = async (task) => {
    setSelectedTask(task);
    const taskDetails = await fetchTaskDetails(task.id);
    if (taskDetails) {
      setValueEdit("taskName", taskDetails.task_name || "");
      setValueEdit("taskProjectName", taskDetails.project_name?.id?.toString() || "");
      setValueEdit("taskAssignTo", taskDetails.assign_to?.id?.toString() || "");
      setValueEdit("taskPriority", taskDetails.priority || "");
      setValueEdit("taskStatus", taskDetails.status || "");
      setValueEdit("taskStartDate", taskDetails.start_date || "");
      setValueEdit("taskEndDate", taskDetails.end_date || "");
      setValueEdit("taskDescription", taskDetails.description || "");
    }
    setEditTasksOpen(true);
  };
  const handleEditTasksClose = () => {
    setEditTasksOpen(false);
    setSelectedTask(null);
    resetEdit();
  };

  // Edit task form submit
  const onEditSubmit = async (formData) => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken || !selectedTask) {
        setErrorMessage("Authentication required or task not selected.");
        return;
      }

      const taskData = {
        task_name: formData.taskName,
        project_name_id: formData.taskProjectName ? parseInt(formData.taskProjectName) : null,
        assign_to_id: formData.taskAssignTo ? parseInt(formData.taskAssignTo) : null,
        priority: formData.taskPriority,
        status: formData.taskStatus || "todo",
        start_date: formData.taskStartDate,
        end_date: formData.taskEndDate,
        description: formData.taskDescription || "",
      };

      await axios.put(`${BASE_API_URL}/tasks/${selectedTask.id}/`, taskData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("Task updated successfully!");
      handleEditTasksClose();
      getTasksData(page, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Failed to update task. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Delete Task Modal
  const [deleteTasksOpen, setDeleteTasksOpen] = useState(false);

  const handleDeleteTasksOpen = (task) => {
    setSelectedTask(task);
    setDeleteTasksOpen(true);
  };
  const handleDeleteTasksClose = () => {
    setDeleteTasksOpen(false);
    setSelectedTask(null);
  };

  // Delete task
  const handleDeleteTask = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken || !selectedTask) {
        setErrorMessage("Authentication required or task not selected.");
        return;
      }

      await axios.delete(`${BASE_API_URL}/tasks/${selectedTask.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSuccessMessage("Task deleted successfully!");
      handleDeleteTasksClose();
      getTasksData(page, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Failed to delete task. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // View Task Modal
  const [viewTasksOpen, setViewTasksOpen] = useState(false);
  const [viewTaskData, setViewTaskData] = useState(null);

  const handleViewTasksOpen = async (task) => {
    const taskDetails = await fetchTaskDetails(task.id);
    setViewTaskData(taskDetails);
    setViewTasksOpen(true);
  };
  const handleViewTasksClose = () => {
    setViewTasksOpen(false);
    setViewTaskData(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div>
      {successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />
      )}
      {errorMessage && (
        <ErrorAlert message={errorMessage} onClose={() => setErrorMessage("")} />
      )}
      <div className="">
        <div className="">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Tasks</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Tasks</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateTasksOpen}>
              <AddIcon /> Create Tasks
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
                  <TableCell>Task Name</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.task_name || "N/A"}</TableCell>
                      <TableCell>{row.project_name?.title || "N/A"}</TableCell>
                      <TableCell>{row.assign_to?.name || "N/A"}</TableCell>
                      <TableCell>{row.priority || "N/A"}</TableCell>
                      <TableCell>{row.status || "N/A"}</TableCell>
                      <TableCell>{formatDate(row.start_date)}</TableCell>
                      <TableCell>{formatDate(row.end_date)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewTasksOpen(row)}
                          aria-label="view"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditTasksOpen(row)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteTasksOpen(row)}
                          aria-label="delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

        {/* Create Task Modal */}
        <ModalComp
          open={createTasksOpen}
          onClose={handleCreateTasksClose}
          title={"Create Task"}
        >
          <form onSubmit={handleSubmitCreate(onCreateSubmit)}>
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskName">
                    Task Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...registerCreate("taskName", { required: "Task name is required" })}
                    placeholder="Task Name"
                    type="text"
                    name="taskName"
                    id="taskName"
                  />
                  {errorsCreate.taskName && (
                    <small className="text-red-600">{errorsCreate.taskName.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskProjectName">
                    Project Name
                  </label>
                  <select {...registerCreate("taskProjectName")} name="taskProjectName" id="taskProjectName">
                    <option value="">Select Project</option>
                    {projectData.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskAssignTo">
                    Assign To
                  </label>
                  <select {...registerCreate("taskAssignTo")} name="taskAssignTo" id="taskAssignTo">
                    <option value="">Select Member</option>
                    {employeeData.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select {...registerCreate("taskPriority", { required: "Priority is required" })} name="taskPriority" id="taskPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  {errorsCreate.taskPriority && (
                    <small className="text-red-600">{errorsCreate.taskPriority.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskStatus">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select {...registerCreate("taskStatus", { required: "Status is required" })} name="taskStatus" id="taskStatus">
                    <option value="">Select Status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {errorsCreate.taskStatus && (
                    <small className="text-red-600">{errorsCreate.taskStatus.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerCreate("taskStartDate", { required: "Start date is required" })}
                    type="date" 
                    name="taskStartDate" 
                    id="taskStartDate" 
                  />
                  {errorsCreate.taskStartDate && (
                    <small className="text-red-600">{errorsCreate.taskStartDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerCreate("taskEndDate", { required: "End date is required" })}
                    type="date" 
                    name="taskEndDate" 
                    id="taskEndDate" 
                  />
                  {errorsCreate.taskEndDate && (
                    <small className="text-red-600">{errorsCreate.taskEndDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="taskDescription">
                  Description
                </label>
                <textarea
                  {...registerCreate("taskDescription")}
                  placeholder="Task Description"
                  rows={4}
                  name="taskDescription"
                  id="taskDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateTasksClose} disabled={submitting}>Close</CloseBtn>
                <PrimaryBtn type={"submit"} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit Task Modal */}
        <ModalComp
          title={"Edit Task"}
          open={editTasksOpen}
          onClose={handleEditTasksClose}
        >
          <form onSubmit={handleSubmitEdit(onEditSubmit)}>
            <div className=" space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskName">
                    Task Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...registerEdit("taskName", { required: "Task name is required" })}
                    placeholder="Task Name"
                    type="text"
                    name="taskName"
                    id="editTaskName"
                  />
                  {errorsEdit.taskName && (
                    <small className="text-red-600">{errorsEdit.taskName.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskProjectName">
                    Project Name
                  </label>
                  <select {...registerEdit("taskProjectName")} name="taskProjectName" id="editTaskProjectName">
                    <option value="">Select Project</option>
                    {projectData.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskAssignTo">
                    Assign To
                  </label>
                  <select {...registerEdit("taskAssignTo")} name="taskAssignTo" id="editTaskAssignTo">
                    <option value="">Select Member</option>
                    {employeeData.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select {...registerEdit("taskPriority", { required: "Priority is required" })} name="taskPriority" id="editTaskPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  {errorsEdit.taskPriority && (
                    <small className="text-red-600">{errorsEdit.taskPriority.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskStatus">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select {...registerEdit("taskStatus", { required: "Status is required" })} name="taskStatus" id="editTaskStatus">
                    <option value="">Select Status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {errorsEdit.taskStatus && (
                    <small className="text-red-600">{errorsEdit.taskStatus.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerEdit("taskStartDate", { required: "Start date is required" })}
                    type="date" 
                    name="taskStartDate" 
                    id="editTaskStartDate" 
                  />
                  {errorsEdit.taskStartDate && (
                    <small className="text-red-600">{errorsEdit.taskStartDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editTaskEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerEdit("taskEndDate", { required: "End date is required" })}
                    type="date" 
                    name="taskEndDate" 
                    id="editTaskEndDate" 
                  />
                  {errorsEdit.taskEndDate && (
                    <small className="text-red-600">{errorsEdit.taskEndDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="editTaskDescription">
                  Description
                </label>
                <textarea
                  {...registerEdit("taskDescription")}
                  placeholder="Task Description"
                  rows={4}
                  name="taskDescription"
                  id="editTaskDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditTasksClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Delete Task Modal */}
        <ModalComp open={deleteTasksOpen} onClose={handleDeleteTasksClose}>
          <div className="w-full ">
            <div>Do you want to delete this task?</div>
            {selectedTask && (
              <div className="mt-2 text-gray-600">
                Task: <strong>{selectedTask.task_name}</strong>
              </div>
            )}
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteTasksClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={handleDeleteTask}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View Task Modal */}
        <ModalComp
          title={"Task Details"}
          open={viewTasksOpen}
          onClose={handleViewTasksClose}
        >
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            {viewTaskData ? (
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Task Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{viewTaskData.task_name || "N/A"}</div>
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
                    <div>{viewTaskData.project_name?.title || "N/A"}</div>
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
                    <div>{viewTaskData.assign_to?.name || "N/A"}</div>
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
                    <div>{viewTaskData.priority || "N/A"}</div>
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
                    <div>{viewTaskData.status || "N/A"}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Start Date</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{formatDate(viewTaskData.start_date)}</div>
                  </Grid2>
                </Grid2>
                <Grid2
                  container
                  columnSpacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">End Date</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{formatDate(viewTaskData.end_date)}</div>
                  </Grid2>
                </Grid2>
                <Grid2 container columnSpacing={2} className=" px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Description</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{viewTaskData.description || "No description provided"}</div>
                  </Grid2>
                </Grid2>
              </div>
            ) : (
              <div className="text-center py-8">Loading task details...</div>
            )}
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default Tasks;