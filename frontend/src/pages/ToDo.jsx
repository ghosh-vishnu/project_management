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

const ToDo = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selectedToDo, setSelectedToDo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Alert states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Dropdown data
  const [projectData, setProjectData] = useState([]);

  // Remove duplicates from data array
  const removeDuplicates = (todos) => {
    const seen = new Map();
    const unique = [];
    
    todos.forEach((todo) => {
      const key = todo.id; // Use todo ID as unique identifier
      if (!seen.has(key)) {
        seen.set(key, true);
        unique.push(todo);
      }
    });
    
    return unique;
  };

  // Fetch todos data
  const getToDosData = async (pageNumber, pageSize) => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found. Please login again.");
        return;
      }
      
      const response = await axios.get(`${BASE_API_URL}/todo/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1,
          page_size: pageSize,
        },
      });
      
      // Remove duplicates from response
      const uniqueToDos = removeDuplicates(response.data.results || []);
      setData(uniqueToDos);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setErrorMessage("Failed to fetch todos. Please try again.");
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

  // Fetch single todo for view/edit
  const fetchToDoDetails = async (todoId) => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return null;
      
      const response = await axios.get(`${BASE_API_URL}/todo/${todoId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching todo details:", error);
      return null;
    }
  };

  useEffect(() => {
    getToDosData(page, rowsPerPage);
    getProjectData();
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

  // Create ToDo modal
  const [createToDoOpen, setCreateToDoOpen] = useState(false);

  const handleCreateToDoOpen = () => {
    resetCreate();
    setCreateToDoOpen(true);
  };
  const handleCreateToDoClose = () => {
    setCreateToDoOpen(false);
    resetCreate();
  };

  // Create todo form submit
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
      if (!formData.ToDoName || !formData.ToDoName.trim()) {
        setErrorMessage("ToDo name is required");
        setSubmitting(false);
        return;
      }
      if (!formData.ToDoPriority || !formData.ToDoPriority.trim()) {
        setErrorMessage("Priority is required");
        setSubmitting(false);
        return;
      }
      if (!formData.projectStatus || !formData.projectStatus.trim()) {
        setErrorMessage("Status is required");
        setSubmitting(false);
        return;
      }
      if (!formData.ToDoStartDate) {
        setErrorMessage("Start date is required");
        setSubmitting(false);
        return;
      }
      if (!formData.ToDoEndDate) {
        setErrorMessage("End date is required");
        setSubmitting(false);
        return;
      }

      // Prepare todo data
      const todoData = {
        todo_name: formData.ToDoName.trim(),
        priority: formData.ToDoPriority.trim(),
        status: formData.projectStatus.trim(),
        start_date: formData.ToDoStartDate,
        end_date: formData.ToDoEndDate,
        description: formData.ToDoDescription?.trim() || "",
      };

      // Handle optional fields - only include if they have values
      if (formData.ToDoProjectName && formData.ToDoProjectName !== "" && formData.ToDoProjectName !== "0") {
        todoData.project_name_id = parseInt(formData.ToDoProjectName);
      }

      console.log("Sending todo data:", todoData);

      const response = await axios.post(`${BASE_API_URL}/todo/`, todoData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("ToDo created successfully:", response.data);
      setSuccessMessage("ToDo created successfully!");
      resetCreate();
      handleCreateToDoClose();
      setPage(0); // Go back to first page to see new todo
      getToDosData(0, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating todo:", error);
      console.error("Full error object:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      // Better error message handling
      let errorMsg = "Failed to create todo. Please try again.";
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

  // Edit ToDo Modal
  const [editToDoOpen, setEditToDoOpen] = useState(false);

  const handleEditToDoOpen = async (todo) => {
    setSelectedToDo(todo);
    const todoDetails = await fetchToDoDetails(todo.id);
    if (todoDetails) {
      setValueEdit("ToDoName", todoDetails.todo_name || "");
      setValueEdit("ToDoProjectName", todoDetails.project_name?.id?.toString() || "");
      setValueEdit("ToDoPriority", todoDetails.priority || "");
      setValueEdit("projectStatus", todoDetails.status || "");
      setValueEdit("ToDoStartDate", todoDetails.start_date || "");
      setValueEdit("ToDoEndDate", todoDetails.end_date || "");
      setValueEdit("ToDoDescription", todoDetails.description || "");
    }
    setEditToDoOpen(true);
  };
  const handleEditToDoClose = () => {
    setEditToDoOpen(false);
    setSelectedToDo(null);
    resetEdit();
  };

  // Edit todo form submit
  const onEditSubmit = async (formData) => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken || !selectedToDo) {
        setErrorMessage("Authentication required or todo not selected.");
        return;
      }

      const todoData = {
        todo_name: formData.ToDoName,
        project_name_id: formData.ToDoProjectName ? parseInt(formData.ToDoProjectName) : null,
        priority: formData.ToDoPriority,
        status: formData.projectStatus || "not_started",
        start_date: formData.ToDoStartDate,
        end_date: formData.ToDoEndDate,
        description: formData.ToDoDescription || "",
      };

      await axios.put(`${BASE_API_URL}/todo/${selectedToDo.id}/`, todoData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("ToDo updated successfully!");
      handleEditToDoClose();
      getToDosData(page, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating todo:", error);
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Failed to update todo. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Delete ToDo Modal
  const [deleteToDoOpen, setDeleteToDoOpen] = useState(false);
  const handleDeleteToDoOpen = (todo) => {
    setSelectedToDo(todo);
    setDeleteToDoOpen(true);
  };
  const handleDeleteToDoClose = () => {
    setDeleteToDoOpen(false);
    setSelectedToDo(null);
  };

  // Delete todo
  const handleDeleteToDo = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken || !selectedToDo) {
        setErrorMessage("Authentication required or todo not selected.");
        return;
      }

      await axios.delete(`${BASE_API_URL}/todo/${selectedToDo.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSuccessMessage("ToDo deleted successfully!");
      handleDeleteToDoClose();
      getToDosData(page, rowsPerPage);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Failed to delete todo. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // View ToDo Modal
  const [viewToDoOpen, setViewToDoOpen] = useState(false);
  const [viewToDoData, setViewToDoData] = useState(null);

  const handleViewToDoOpen = async (todo) => {
    const todoDetails = await fetchToDoDetails(todo.id);
    setViewToDoData(todoDetails);
    setViewToDoOpen(true);
  };
  const handleViewToDoClose = () => {
    setViewToDoOpen(false);
    setViewToDoData(null);
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

            <Typography sx={{ color: "text.primary" }}>ToDo</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">ToDo</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateToDoOpen}>
              <AddIcon /> Create ToDo
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
                  <TableCell>ToDo Name</TableCell>
                  <TableCell>Project Name</TableCell>
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
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No todos found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.todo_name || "N/A"}</TableCell>
                      <TableCell>{row.project_name?.title || "N/A"}</TableCell>
                      <TableCell>{row.priority || "N/A"}</TableCell>
                      <TableCell>{row.status || "N/A"}</TableCell>
                      <TableCell>{formatDate(row.start_date)}</TableCell>
                      <TableCell>{formatDate(row.end_date)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewToDoOpen(row)}
                          aria-label="view"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditToDoOpen(row)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteToDoOpen(row)}
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

        {/* Create ToDo Modal */}
        <ModalComp
          open={createToDoOpen}
          onClose={handleCreateToDoClose}
          title={"Create ToDo"}
        >
          <form onSubmit={handleSubmitCreate(onCreateSubmit)}>
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoName">
                    ToDo Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...registerCreate("ToDoName", { required: "ToDo name is required" })}
                    placeholder="ToDo Name"
                    type="text"
                    name="ToDoName"
                    id="ToDoName"
                  />
                  {errorsCreate.ToDoName && (
                    <small className="text-red-600">{errorsCreate.ToDoName.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoProjectName">
                    Project Name
                  </label>
                  <select {...registerCreate("ToDoProjectName")} name="ToDoProjectName" id="ToDoProjectName">
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
                  <label htmlFor="ToDoPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select {...registerCreate("ToDoPriority", { required: "Priority is required" })} name="ToDoPriority" id="ToDoPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  {errorsCreate.ToDoPriority && (
                    <small className="text-red-600">{errorsCreate.ToDoPriority.message}</small>
                  )}
                </Grid2>
              



               <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                              <label htmlFor="projectStatus">Status <span className="text-red-600">*</span></label>
                              <select {...registerCreate("projectStatus", { required: "Status is required" })} name="projectStatus" id="projectStatus">
                                <option value="">Select Status</option>
                                <option value="Not Started">Not Started</option>
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Paused">Paused</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {errorsCreate.projectStatus && (
                                <small className="text-red-600">{errorsCreate.projectStatus.message}</small>
                              )}
                            </Grid2>

                            </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerCreate("ToDoStartDate", { required: "Start date is required" })}
                    type="date" 
                    name="ToDoStartDate" 
                    id="ToDoStartDate" 
                  />
                  {errorsCreate.ToDoStartDate && (
                    <small className="text-red-600">{errorsCreate.ToDoStartDate.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerCreate("ToDoEndDate", { required: "End date is required" })}
                    type="date" 
                    name="ToDoEndDate" 
                    id="ToDoEndDate" 
                  />
                  {errorsCreate.ToDoEndDate && (
                    <small className="text-red-600">{errorsCreate.ToDoEndDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="ToDoDescription">
                  Description
                </label>
                <textarea
                  {...registerCreate("ToDoDescription")}
                  placeholder="ToDo Description"
                  rows={4}
                  name="ToDoDescription"
                  id="ToDoDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateToDoClose} disabled={submitting}>Close</CloseBtn>
                <PrimaryBtn type={"submit"} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit ToDo Modal */}
        <ModalComp
          title={"Edit ToDo"}
          open={editToDoOpen}
          onClose={handleEditToDoClose}
        >
          <form onSubmit={handleSubmitEdit(onEditSubmit)}>
            <div className=" space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editToDoName">
                    ToDo Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...registerEdit("ToDoName", { required: "ToDo name is required" })}
                    placeholder="ToDo Name"
                    type="text"
                    name="ToDoName"
                    id="editToDoName"
                  />
                  {errorsEdit.ToDoName && (
                    <small className="text-red-600">{errorsEdit.ToDoName.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editToDoProjectName">
                    Project Name
                  </label>
                  <select {...registerEdit("ToDoProjectName")} name="ToDoProjectName" id="editToDoProjectName">
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
                  <label htmlFor="editToDoPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select {...registerEdit("ToDoPriority", { required: "Priority is required" })} name="ToDoPriority" id="editToDoPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  {errorsEdit.ToDoPriority && (
                    <small className="text-red-600">{errorsEdit.ToDoPriority.message}</small>
                  )}
                </Grid2>
              


               <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                              <label htmlFor="editProjectStatus">Status <span className="text-red-600">*</span></label>
                              <select {...registerEdit("projectStatus", { required: "Status is required" })} name="projectStatus" id="editProjectStatus">
                                <option value="">Select Status</option>
                                <option value="Not Started">Not Started</option>
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Paused">Paused</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {errorsEdit.projectStatus && (
                                <small className="text-red-600">{errorsEdit.projectStatus.message}</small>
                              )}
                            </Grid2>
                            </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editToDoStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerEdit("ToDoStartDate", { required: "Start date is required" })}
                    type="date" 
                    name="ToDoStartDate" 
                    id="editToDoStartDate" 
                  />
                  {errorsEdit.ToDoStartDate && (
                    <small className="text-red-600">{errorsEdit.ToDoStartDate.message}</small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="editToDoEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input 
                    {...registerEdit("ToDoEndDate", { required: "End date is required" })}
                    type="date" 
                    name="ToDoEndDate" 
                    id="editToDoEndDate" 
                  />
                  {errorsEdit.ToDoEndDate && (
                    <small className="text-red-600">{errorsEdit.ToDoEndDate.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="editToDoDescription">
                  Description
                </label>
                <textarea
                  {...registerEdit("ToDoDescription")}
                  placeholder="ToDo Description"
                  rows={4}
                  name="ToDoDescription"
                  id="editToDoDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditToDoClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Delete ToDo Modal */}
        <ModalComp open={deleteToDoOpen} onClose={handleDeleteToDoClose}>
          <div className="w-full ">
            <div>Do you want to delete this todo?</div>
            {selectedToDo && (
              <div className="mt-2 text-gray-600">
                ToDo: <strong>{selectedToDo.todo_name}</strong>
              </div>
            )}
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteToDoClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={handleDeleteToDo}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View ToDo Modal */}
        <ModalComp
          title={"ToDo Details"}
          open={viewToDoOpen}
          onClose={handleViewToDoClose}
        >
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            {viewToDoData ? (
            <div className=" border    border-gray-500  rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">ToDo Name</div>
                </Grid2>
                <Grid2 size={8}>
                    <div>{viewToDoData.todo_name || "N/A"}</div>
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
                    <div>{viewToDoData.project_name?.title || "N/A"}</div>
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
                    <div>{viewToDoData.priority || "N/A"}</div>
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
                    <div>{viewToDoData.status || "N/A"}</div>
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
                    <div>{formatDate(viewToDoData.start_date)}</div>
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
                    <div>{formatDate(viewToDoData.end_date)}</div>
                </Grid2>
              </Grid2>
              <Grid2 container columnSpacing={2} className=" px-4 py-2">
                <Grid2 size={4}>
                  <div className="font-bold">Description</div>
                </Grid2>
                <Grid2 size={8}>
                    <div>{viewToDoData.description || "No description provided"}</div>
                </Grid2>
              </Grid2>
            </div>
            ) : (
              <div className="text-center py-8">Loading todo details...</div>
            )}
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default ToDo;
