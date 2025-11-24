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
  const [error, setError] = useState(null);

  // Alert states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");

  // Removed excessive debug logging

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981"; // green-500
      case "completed":
        return "#3b82f6"; // blue-500
      case "upcoming":
        return "#eab308"; // yellow-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // AbortController for request cancellation
  const abortControllerRef = React.useRef(null);
  const fetchTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);

  // Fetch sprint details
  const fetchSprint = React.useCallback(async (silent = false) => {
    if (!id) {
      console.error("No sprint ID provided");
      setError("No sprint ID provided");
      setLoading(false);
      return;
    }

    if (isFetchingRef.current && !silent) {
      return;
    }

    // Cancel previous request
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
        setError(null);
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
        timeout: 15000,
      });

      // Only update state if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setSprint(response.data);
        setTasks(response.data.tasks || []);
        setLoading(false);
        setError(null);
      }
    } catch (error) {
      // Ignore aborted requests
      if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED' || abortController.signal.aborted) {
        return;
      }
      
      // Ignore broken pipe errors
      if (error.code === 'EPIPE' || error.message?.includes('Broken pipe') || error.message?.includes('ECONNRESET')) {
        return;
      }

      // Handle errors silently (only show to user)
      if (error.response) {
        if (error.response.status >= 400 && !abortController.signal.aborted) {
          setError(`Failed to fetch sprint: ${error.response.status}`);
          setShowError(true);
          setMessage("Failed to fetch sprint details.");
          setLoading(false);
        }
      } else if (error.request && !abortController.signal.aborted) {
        setError("Network error. Please check your connection.");
        setShowError(true);
        setMessage("Network error. Please check your connection.");
        setLoading(false);
      } else {
        setError(error.message || "Unknown error occurred");
        setLoading(false);
      }
    } finally {
      // Only reset fetching flag if this request completed
      if (abortControllerRef.current === abortController) {
        isFetchingRef.current = false;
        if (!silent && loading) {
          setLoading(false);
        }
      }
    }
  }, [id, navigate]); // Removed loading from dependencies to prevent loops

  useEffect(() => {
    if (id) {
      fetchSprint();
    } else {
      setError("No sprint ID provided");
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      isFetchingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, fetchSprint is stable

  // Handle task update
  const handleTaskUpdate = React.useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchSprint(true);
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

  // Removed excessive render logging

  // Show loading state
  if (loading && !sprint && !error) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <ErrorAlert
          show={showError}
          message={message}
          onClose={() => setShowError(false)}
        />
        <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '20px' }}>
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
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <Box style={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" style={{ marginTop: '16px', color: '#666' }}>
              Loading sprint details...
            </Typography>
            <Typography variant="body2" style={{ marginTop: '8px', color: '#999' }}>
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
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <ErrorAlert
          show={true}
          message="Invalid sprint ID"
          onClose={() => navigate("/sprints")}
        />
        <Paper style={{ padding: '32px', textAlign: 'center', marginTop: '16px' }}>
          <Typography variant="h6" style={{ marginBottom: '8px', color: '#666' }}>
            Invalid Sprint ID
          </Typography>
          <button
            onClick={() => navigate("/sprints")}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Back to Sprints
          </button>
        </Paper>
      </div>
    );
  }

  // If error, show error message
  if (error && !sprint) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <ErrorAlert
          show={true}
          message={error}
          onClose={() => {
            setError(null);
            navigate("/sprints");
          }}
        />
        <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '20px' }}>
          <Link underline="hover" color="inherit" to={"/"}>
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" to={"/sprints"}>
            Sprints
          </Link>
          <Typography sx={{ color: "text.primary" }}>
            Error
          </Typography>
        </Breadcrumbs>
        <Paper style={{ padding: '32px', textAlign: 'center', marginTop: '16px' }}>
          <Typography variant="h6" style={{ marginBottom: '8px', color: '#666' }}>
            {error}
          </Typography>
          <button
            onClick={() => navigate("/sprints")}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Back to Sprints
          </button>
        </Paper>
      </div>
    );
  }

  // Main render
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

      {/* Header */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <IconButton onClick={() => navigate("/sprints")}>
            <ArrowBackIcon />
          </IconButton>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {sprint?.name || 'Sprint'}
              </h2>
              {sprint?.status && (
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    color: 'white',
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    backgroundColor: getStatusColor(sprint.status)
                  }}
                >
                  {sprint.status}
                </span>
              )}
            </div>
            <p style={{ color: '#666', marginTop: '8px', margin: 0 }}>
              {sprint?.project?.title || ''}
            </p>
          </div>
        </div>

        {/* Sprint Info Cards */}
        {sprint ? (
          <>
            <Grid2 container spacing={2} style={{ marginBottom: '24px' }}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Duration</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    {sprint.start_date} - {sprint.end_date}
                  </div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Remaining Days</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    {getRemainingDays()} days
                  </div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <LinearProgress
                      variant="determinate"
                      value={sprint.progress || 0}
                      style={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>
                      {sprint.progress || 0}%
                    </span>
                  </div>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Tasks</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{tasks.length}</div>
                </Paper>
              </Grid2>
            </Grid2>

            {/* Tabs */}
            <Paper style={{ marginBottom: '16px' }}>
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
            <div style={{ marginTop: '16px' }}>
              {activeTab === 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Tasks</h3>
                    <button
                      onClick={() => setCreateTaskOpen(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
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
                    <Paper style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                      No tasks yet. Click "Add Task" to create one.
                    </Paper>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Burndown Chart</h3>
                  <SprintBurndownChart sprintId={id} />
                </div>
              )}

              {activeTab === 2 && (
                <SprintComments sprintId={id} />
              )}

              {activeTab === 3 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Retrospective</h3>
                  <SprintRetrospective sprintId={id} />
                </div>
              )}
            </div>
          </>
        ) : (
          <Paper style={{ padding: '32px', textAlign: 'center' }}>
            <Typography variant="h6" style={{ marginBottom: '8px', color: '#666' }}>
              Sprint not found
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginBottom: '16px' }}>
              The sprint you're looking for doesn't exist or you don't have access to it.
            </Typography>
            <button
              onClick={() => navigate("/sprints")}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
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
