import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Breadcrumbs,
  Typography,
  Tabs,
  Tab,
  Box,
  LinearProgress,
  Paper,
  Grid2,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SprintKanbanBoard from "../../components/Sprints/SprintKanbanBoard";
import SprintBurndownChart from "../../components/Sprints/SprintBurndownChart";
import SprintComments from "../../components/Sprints/SprintComments";
import SprintRetrospective from "../../components/Sprints/SprintRetrospective";
import CreateTaskModal from "../../components/Sprints/CreateTaskModal";

const SprintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Alert states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");

  // Debug logging
  useEffect(() => {
    console.log("SprintDetail mounted with id:", id);
    if (!id) {
      console.error("No sprint ID found in URL params");
      setShowError(true);
      setMessage("Invalid sprint ID");
      setLoading(false);
    }
  }, [id]);

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

  // AbortController for request cancellation
  const abortControllerRef = React.useRef(null);
  const fetchTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);

  // Fetch sprint details - optimized with request cancellation and debouncing
  const fetchSprint = React.useCallback(async (silent = false) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current && !silent) {
      return;
    }

    // Cancel previous request only if it's still pending and we're making a new one
    if (abortControllerRef.current && abortControllerRef.current.signal && !abortControllerRef.current.signal.aborted) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        // Ignore errors when aborting
      }
    }

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    isFetchingRef.current = true;

    try {
      if (!silent) {
        setLoading(true);
      }
      
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/sprints/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: abortController.signal,
        timeout: 15000, // Increased timeout to 15 seconds
      });

      // Only update state if request wasn't cancelled
      if (!abortController.signal.aborted) {
        console.log("Sprint data fetched successfully:", response.data);
        setSprint(response.data);
        setTasks(response.data.tasks || []);
        setLoading(false);
      }
    } catch (error) {
      // Ignore aborted requests - these are intentional
      if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED' || abortController.signal.aborted) {
        // Request was cancelled intentionally, ignore
        return;
      }
      
      // Ignore broken pipe errors (client closed connection) - these are harmless
      if (error.code === 'EPIPE' || error.message?.includes('Broken pipe') || error.message?.includes('ECONNRESET')) {
        // Connection was closed by client, ignore
        return;
      }

      // Only log and show errors for actual failures
      if (error.response) {
        // Server responded with an error
        console.error("Error fetching sprint:", error.response.status, error.response.data);
        if (error.response.status >= 400 && !abortController.signal.aborted) {
          setShowError(true);
          setMessage("Failed to fetch sprint details.");
          setLoading(false);
        }
      } else if (error.request && !abortController.signal.aborted) {
        // Request was made but no response received (network error)
        console.error("Network error fetching sprint:", error.message);
        setShowError(true);
        setMessage("Network error. Please check your connection.");
        setLoading(false);
      }
    } finally {
      // Only reset fetching flag if this request completed (wasn't replaced)
      if (abortControllerRef.current === abortController) {
        isFetchingRef.current = false;
        if (!silent) {
          setLoading(false);
        }
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    console.log("useEffect triggered, id:", id);
    if (id) {
      // Fetch sprint data immediately
      console.log("Fetching sprint data for id:", id);
      fetchSprint();
    } else {
      console.warn("No ID provided, cannot fetch sprint");
      setLoading(false);
    }

    // Cleanup: Cancel any pending requests on unmount or id change
    return () => {
      console.log("Cleaning up SprintDetail for id:", id);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      isFetchingRef.current = false;
    };
  }, [id, fetchSprint]);

  // Handle task update (after drag and drop or edit) - debounced to prevent rapid calls
  const handleTaskUpdate = React.useCallback(() => {
    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce: Wait 300ms before fetching (prevents rapid successive calls)
    fetchTimeoutRef.current = setTimeout(() => {
      fetchSprint(true); // Silent update
    }, 300);
  }, [fetchSprint]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate remaining days
  const getRemainingDays = () => {
    if (!sprint?.end_date) return 0;
    const today = new Date();
    const endDate = new Date(sprint.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Show loading state
  if (loading && !sprint) {
    return (
      <div className="p-6" style={{ minHeight: '100vh' }}>
        <ErrorAlert
          show={showError}
          message={message}
          onClose={() => setShowError(false)}
        />
        <Breadcrumbs aria-label="breadcrumb" className="mb-4">
          <Link underline="hover" color="inherit" to={"/"}>
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" to={"/sprints"}>
            Sprints
          </Link>
          <Typography sx={{ color: "text.primary" }}>
            Loading...
          </Typography>
        </Breadcrumbs>
        <Box className="flex items-center justify-center min-h-[400px]">
          <Box className="text-center">
            <CircularProgress size={60} />
            <Typography variant="h6" className="mt-4 text-gray-600">
              Loading sprint details...
            </Typography>
            <Typography variant="body2" className="mt-2 text-gray-500">
              Sprint ID: {id || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </div>
    );
  }

  // If no ID, show error
  if (!id) {
    return (
      <div className="p-6" style={{ minHeight: '100vh' }}>
        <ErrorAlert
          show={true}
          message="Invalid sprint ID"
          onClose={() => navigate("/sprints")}
        />
        <Paper className="p-8 text-center mt-4">
          <Typography variant="h6" className="mb-2 text-gray-600">
            Invalid Sprint ID
          </Typography>
          <button
            onClick={() => navigate("/sprints")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
          >
            Back to Sprints
          </button>
        </Paper>
      </div>
    );
  }

  console.log("Rendering SprintDetail, sprint:", sprint, "loading:", loading, "id:", id);

  // Always render something - even if there's an error
  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#ffffff' }}>
      <ErrorAlert
        show={showError}
        message={message}
        onClose={() => setShowError(false)}
      />
      <SuccessAlert
        show={showSuccess}
        message={message}
        onClose={() => setShowSuccess(false)}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" to={"/"}>
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" to={"/sprints"}>
          Sprints
        </Link>
        <Typography sx={{ color: "text.primary" }}>
          {sprint?.name || 'Sprint'}
        </Typography>
      </Breadcrumbs>

      {/* Header - Render immediately, data will populate when loaded */}
      <div className="mt-6">
        <div className="flex items-center gap-4 mb-4">
          <IconButton onClick={() => navigate("/sprints")}>
            <ArrowBackIcon />
          </IconButton>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold">{sprint?.name || 'Sprint'}</h2>
              {sprint?.status && (
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm capitalize ${getStatusColor(
                    sprint.status
                  )}`}
                >
                  {sprint.status}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">{sprint?.project?.title || ''}</p>
          </div>
        </div>

        {/* Sprint Info Cards - Show data when available */}
        {sprint ? (
          <>
            <Grid2 container spacing={2} className="mb-6">
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4">
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-lg font-semibold">
                    {sprint.start_date} - {sprint.end_date}
                  </div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4">
                  <div className="text-sm text-gray-600">Remaining Days</div>
                  <div className="text-lg font-semibold">{getRemainingDays()} days</div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="flex items-center gap-2 mt-2">
                    <LinearProgress
                      variant="determinate"
                      value={sprint.progress || 0}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <span className="text-lg font-semibold">
                      {sprint.progress || 0}%
                    </span>
                  </div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4">
                  <div className="text-sm text-gray-600">Tasks</div>
                  <div className="text-lg font-semibold">{tasks.length}</div>
                </Paper>
              </Grid2>
            </Grid2>

            {/* Tabs */}
            <Paper className="mb-4">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="sprint tabs"
              >
                <Tab label="Tasks" />
                <Tab label="Progress" />
                <Tab label="Comments" />
                <Tab label="Retrospective" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Tasks</h3>
                    <button
                      onClick={() => setCreateTaskOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                      <AddIcon /> Add Task
                    </button>
                  </div>
                  {tasks.length > 0 ? (
                    <SprintKanbanBoard
                      sprintId={id}
                      tasks={tasks}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  ) : (
                    <Paper className="p-8 text-center text-gray-500">
                      No tasks yet. Click "Add Task" to create one.
                    </Paper>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Burndown Chart</h3>
                  <SprintBurndownChart sprintId={id} />
                </div>
              )}

              {activeTab === 2 && (
                <SprintComments sprintId={id} />
              )}

              {activeTab === 3 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Retrospective</h3>
                  <SprintRetrospective sprintId={id} />
                </div>
              )}
            </div>
          </>
        ) : (
          <Paper className="p-8 text-center">
            <Typography variant="h6" className="mb-2 text-gray-600">
              Sprint not found
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              The sprint you're looking for doesn't exist or you don't have access to it.
            </Typography>
            <button
              onClick={() => navigate("/sprints")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Sprints
            </button>
          </Paper>
        )}
      </div>

      {/* Create Task Modal */}
      {id && (
        <CreateTaskModal
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          sprintId={id}
          onTaskCreated={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default SprintDetail;
