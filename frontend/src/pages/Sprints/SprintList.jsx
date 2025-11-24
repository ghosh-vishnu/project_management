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
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import CloseBtn from "../../components/Buttons/CloseBtn";
import DeleteBtn from "../../components/Buttons/DeleteBtn";
import { Link, useNavigate } from "react-router";
import ModalComp from "../../components/Modal/ModalComp";
import axios from "axios";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import BASE_API_URL from "../../data";
import { useForm } from "react-hook-form";
import { getToken } from "../../Token";

// Select for project
const SelectProject = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Project</option>
        {options &&
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))}
      </select>
    </>
  )
);

// Select for status
const SelectStatus = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Status</option>
        {options &&
          options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
      </select>
    </>
  )
);

const SprintList = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Variables to show success and error alerts
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Create Sprint modal
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const handleCreateSprintOpen = () => {
    reset({
      name: "",
      project_id: "",
      start_date: "",
      end_date: "",
      status: "",
      description: "",
    });
    setCreateSprintOpen(true);
  };
  const handleCreateSprintClose = () => {
    setCreateSprintOpen(false);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Edit sprint modal
  const [editSprintOpen, setEditSprintOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const handleEditSprintOpen = (data) => {
    setSelectedSprint(data);
    reset({
      name: data.name,
      project_id: data.project?.id,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      description: data.description || "",
    });
    setEditSprintOpen(true);
  };
  const handleEditSprintClose = () => {
    setEditSprintOpen(false);
    setSelectedSprint(null);
  };

  // Delete modal
  const [deleteSprintOpen, setDeleteSprintOpen] = useState(false);
  const handleDeleteSprintOpen = (data) => {
    setSelectedSprint(data);
    setDeleteSprintOpen(true);
  };
  const handleDeleteSprintClose = () => {
    setDeleteSprintOpen(false);
    setSelectedSprint(null);
  };

  // Sprint data variable
  const [sprintData, setSprintData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "upcoming":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // To fetch the sprint data list
  const getSprintData = async (page, rowsPerPage, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }
      
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
      };
      if (search) {
        params.search = search;
      }
      
      console.log("Fetching sprints with params:", params);
      const response = await axios.get(`${BASE_API_URL}/sprints/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });

      console.log("Sprint API response:", response.data);
      
      // Handle both paginated and non-paginated responses
      if (response.data.results) {
        // Paginated response
        setSprintData(response.data.results || []);
        setCount(response.data.count || 0);
      } else if (Array.isArray(response.data)) {
        // Non-paginated response (array)
        setSprintData(response.data || []);
        setCount(response.data.length || 0);
      } else {
        // Unexpected response format
        console.error("Unexpected response format:", response.data);
        setSprintData([]);
        setCount(0);
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
      setError(error.response?.data?.error || error.response?.data?.detail || error.message || "Failed to fetch sprints. Please try again.");
      setSprintData([]);
      setCount(0);
      
      // Show error alert
      if (error.response?.status === 401) {
        setShowError(true);
        setShowMessage("Authentication required. Please login again.");
      } else {
        setShowError(true);
        setShowMessage(error.response?.data?.error || error.response?.data?.detail || "Failed to fetch sprints. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get projects for dropdown
  const getProjectData = async () => {
    try {
      const accessToken = getToken("accessToken");
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

  useEffect(() => {
    getSprintData(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage]);

  useEffect(() => {
    getProjectData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(0);
    getSprintData(0, rowsPerPage, query);
  };

  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Post API Call
  const createSprintForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/sprints/`,
        {
          name: data.name,
          project_id: parseInt(data.project_id),
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status.toLowerCase(),
          description: data.description || "",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 201) {
        setShowSuccess(true);
        setShowMessage("Sprint created successfully.");
        reset();
        handleCreateSprintClose();
        getSprintData(page, rowsPerPage, searchQuery);
      } else {
        setShowError(true);
        setShowMessage("Sprint creation failed.");
      }
    } catch (error) {
      if (error.response) {
        const data = error.response?.data;
        if (data.error) {
          setShowMessage(data.error);
        } else if (data.detail) {
          setShowMessage(data.detail);
        } else {
          setShowMessage("Something went wrong. Please try again.");
        }
      }
      setShowError(true);
    }
  };

  // Update api call
  const editSprintForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken && selectedSprint) {
        const response = await axios.put(
          `${BASE_API_URL}/sprints/${selectedSprint.id}/`,
          {
            name: data.name,
            project_id: parseInt(data.project_id),
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status.toLowerCase(),
            description: data.description || "",
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 200) {
          setShowSuccess(true);
          setShowMessage("Sprint updated successfully.");
          getSprintData(page, rowsPerPage, searchQuery);
          handleEditSprintClose();
        }
      }
    } catch (error) {
      if (error.response) {
        const data = error.response?.data;
        if (data.error) {
          setShowMessage(data.error);
        } else if (data.detail) {
          setShowMessage(data.detail);
        } else {
          setShowMessage("Something went wrong. Please try again.");
        }
      }
      setShowError(true);
    }
  };

  // Delete api call
  const deleteSprintData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken && selectedSprint) {
        const response = await axios.delete(
          `${BASE_API_URL}/sprints/${selectedSprint.id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 204) {
          setShowSuccess(true);
          setShowMessage("Sprint deleted successfully.");
          getSprintData(page, rowsPerPage, searchQuery);
          handleDeleteSprintClose();
        }
      } else {
        setShowError(true);
        setShowMessage("Sprint deletion failed.");
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Sprint deletion failed.");
    }
  };

  // Navigate to sprint detail
  const handleSprintClick = (sprint) => {
    navigate(`/sprints/${sprint.id}`);
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
          <Typography sx={{ color: "text.primary" }}>Sprint List</Typography>
        </Breadcrumbs>

        {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6 gap-x-2 gap-y-4">
          <h4 className="text-2xl font-bold">Sprint List</h4>
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search sprints..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <PrimaryBtn
              className="bg-[var(--primary1)] text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={handleCreateSprintOpen}
            >
              <AddIcon /> Create Sprint
            </PrimaryBtn>
          </div>
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
                  <TableCell>Sprint Name</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Loading state
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading sprints...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {error}
                      </Typography>
                      <PrimaryBtn
                        onClick={() => getSprintData(page, rowsPerPage, searchQuery)}
                        className="bg-[var(--primary1)] text-white px-4 py-2 rounded"
                      >
                        Retry
                      </PrimaryBtn>
                    </TableCell>
                  </TableRow>
                ) : sprintData.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No sprints found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {searchQuery
                          ? "No sprints match your search criteria. Try a different search term."
                          : "Get started by creating your first sprint."}
                      </Typography>
                      {!searchQuery && (
                        <PrimaryBtn
                          onClick={handleCreateSprintOpen}
                          className="bg-[var(--primary1)] text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          <AddIcon /> Create Sprint
                        </PrimaryBtn>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  sprintData.map((data) => (
                    <TableRow
                      key={data.id}
                      onClick={() => handleSprintClick(data)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.project?.title || "N/A"}</TableCell>
                      <TableCell>
                        {data.start_date} - {data.end_date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LinearProgress
                            variant="determinate"
                            value={data.progress || 0}
                            sx={{ width: "100px", height: 8, borderRadius: 4 }}
                          />
                          <span className="text-sm">{data.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-white text-xs capitalize ${getStatusColor(
                            data.status
                          )}`}
                        >
                          {data.status}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          onClick={() => handleEditSprintOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteSprintOpen(data)}
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

            {/* Pagination - Only show if not loading and has data */}
            {!loading && sprintData.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </TableContainer>
        </div>

        {/*Create Sprint MODAL */}
        {createSprintOpen && (
          <ModalComp
            open={createSprintOpen}
            onClose={handleCreateSprintClose}
            title={"Create Sprint"}
          >
            <form onSubmit={handleSubmit(createSprintForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="sprintName">
                      Sprint Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Sprint Name"
                      id="sprintName"
                      {...register("name", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-500">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectProject
                      label={"Project"}
                      options={projectData}
                      {...register("project_id", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.project_id && (
                      <small className="text-red-600">
                        {errors.project_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="sprintStartDate">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="Start Date"
                      id="sprintStartDate"
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
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="sprintEndDate">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="End Date"
                      id="sprintEndDate"
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
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectStatus
                      label={"Status"}
                      options={["active", "completed", "upcoming"]}
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
                </Grid2>

                <Grid2 container spacing={2} className="w-full">
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <div className="w-full inputData">
                      <label htmlFor="sprintDescription">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Sprint Description"
                        name="sprintDescription"
                        id="sprintDescription"
                        {...register("description")}
                      ></textarea>
                    </div>
                  </Grid2>
                </Grid2>
                <div className="flex flex-row flex-wrap gap-4 justify-end">
                  <CloseBtn onClick={handleCreateSprintClose}>Close</CloseBtn>
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

        {/* Edit Sprint Modal */}
        {editSprintOpen && (
          <ModalComp
            title={"Edit Sprint"}
            open={editSprintOpen}
            onClose={handleEditSprintClose}
          >
            <form onSubmit={handleSubmit(editSprintForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="editSprintName">
                      Sprint Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Sprint Name"
                      id="editSprintName"
                      {...register("name", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-500">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectProject
                      label={"Project"}
                      options={projectData}
                      {...register("project_id", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.project_id && (
                      <small className="text-red-600">
                        {errors.project_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="editSprintStartDate">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="Start Date"
                      id="editSprintStartDate"
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
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="editSprintEndDate">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="End Date"
                      id="editSprintEndDate"
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
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectStatus
                      label={"Status"}
                      options={["active", "completed", "upcoming"]}
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
                </Grid2>

                <Grid2 container spacing={2} className="w-full">
                  <Grid2 size={{ xs: 12, sm: 12 }} className="inputData">
                    <div className="w-full inputData">
                      <label htmlFor="editSprintDescription">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Sprint Description"
                        name="editSprintDescription"
                        id="editSprintDescription"
                        {...register("description")}
                      ></textarea>
                    </div>
                  </Grid2>
                </Grid2>
                <div className="flex flex-row flex-wrap gap-4 justify-end">
                  <CloseBtn onClick={handleEditSprintClose}>Close</CloseBtn>
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

        {/* Delete Sprint Modal */}
        <ModalComp open={deleteSprintOpen} onClose={handleDeleteSprintClose}>
          <div className="w-full ">
            <div>Do you want to delete this sprint?</div>
            {selectedSprint && (
              <div className="mt-2 text-gray-600">
                Sprint: <strong>{selectedSprint.name}</strong>
              </div>
            )}
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteSprintClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteSprintData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default SprintList;

