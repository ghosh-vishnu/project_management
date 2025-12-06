import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SuccessAlert from "../Alert/SuccessAlert";
import ErrorAlert from "../Alert/ErrorAlert";

// Enable relative time plugin
dayjs.extend(relativeTime);

const SprintComments = ({ sprintId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");
  const commentsEndRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch users for filter
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      const response = await axios.get(`${BASE_API_URL}/sprint-users/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers(response.data || []);
    } catch (error) {
      // Silently handle error - users filter is optional
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch comments with search and filter
  const fetchComments = useCallback(async (search = "", userId = null) => {
    if (!sprintId) {
      setComments([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setLoading(false);
        setComments([]);
        setTotalCount(0);
        return;
      }

      const params = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (userId) {
        params.user_id = userId;
      }

      const response = await axios.get(
        `${BASE_API_URL}/sprints/${sprintId}/comments/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
          timeout: 10000, // 10 second timeout
        }
      );

      // Handle paginated response (results array) or direct array
      if (response.data && Array.isArray(response.data)) {
        // Direct array response
        setComments(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Paginated response with results
        setComments(response.data.results);
        setTotalCount(response.data.count || 0);
      } else {
        // Empty or unexpected response
        setComments([]);
        setTotalCount(0);
      }
    } catch (error) {
      // Only log critical errors
      setComments([]);
      setTotalCount(0);
      
      // Only show error for actual failures, not network cancellations
      if (error.code !== 'ECONNABORTED' && !axios.isCancel(error)) {
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch comments. Please try again.";
        setMessage(errorMsg);
        setShowError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [sprintId]);

  // Fetch users on mount
  useEffect(() => {
    if (sprintId) {
      fetchUsers();
    }
  }, [sprintId]);

  // Fetch comments on mount only
  useEffect(() => {
    if (sprintId) {
      fetchComments("", null);
      
      // Set up auto-refresh (only when not searching/filtering)
      autoRefreshIntervalRef.current = setInterval(() => {
        // Only auto-refresh if no active search/filter
        if (!searchQuery && !filterUser) {
          fetchComments("", null);
        }
      }, 60000); // Refresh every 60 seconds (reduced frequency)

      return () => {
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current);
          autoRefreshIntervalRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId]); // Only depend on sprintId

  // Debounce search and filter changes
  useEffect(() => {
    if (!sprintId) return;
    
    const searchTimeout = setTimeout(() => {
      fetchComments(searchQuery, filterUser?.id || null);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(searchTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterUser]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (comments.length > 0 && !loading) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, loading]);

  // Handle submit comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setMessage("Authentication required. Please login again.");
        setShowError(true);
        return;
      }

      await axios.post(
        `${BASE_API_URL}/sprints/${sprintId}/comments/`,
        {
          content: newComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNewComment("");
      setMessage("Comment added successfully!");
      setShowSuccess(true);
      await fetchComments(); // Refresh comments
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.detail ||
        "Failed to submit comment. Please try again.";
      setMessage(errorMsg);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit comment
  const handleEditComment = async () => {
    if (!editContent.trim() || !editingId) return;

    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setMessage("Authentication required. Please login again.");
        setShowError(true);
        return;
      }

      await axios.put(
        `${BASE_API_URL}/sprints/${sprintId}/comments/${editingId}/`,
        {
          content: editContent.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEditingId(null);
      setEditContent("");
      setAnchorEl(null);
      setMessage("Comment updated successfully!");
      setShowSuccess(true);
      await fetchComments();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.detail ||
        "Failed to update comment. Please try again.";
      setMessage(errorMsg);
      setShowError(true);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      setAnchorEl(null);
      return;
    }

    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setMessage("Authentication required. Please login again.");
        setShowError(true);
        return;
      }

      await axios.delete(
        `${BASE_API_URL}/sprints/${sprintId}/comments/${selectedCommentId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setAnchorEl(null);
      setSelectedCommentId(null);
      setMessage("Comment deleted successfully!");
      setShowSuccess(true);
      await fetchComments();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.detail ||
        "Failed to delete comment. Please try again.";
      setMessage(errorMsg);
      setShowError(true);
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, commentId, commentUserId) => {
    // Check if current user is the comment owner
    // For now, we'll allow edit/delete for all comments (backend will handle permissions)
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  // Handle start edit
  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setAnchorEl(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // Check if user can edit/delete comment
  const canEditDelete = (comment) => {
    // Backend will handle permissions, but we can check user ID here
    // For now, return true (backend will validate)
    return true;
  };

  // Format relative time
  const formatTime = (date) => {
    const now = dayjs();
    const commentDate = dayjs(date);
    const diffInHours = now.diff(commentDate, "hour");

    if (diffInHours < 24) {
      return commentDate.fromNow(); // "2 hours ago", "5 minutes ago"
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return commentDate.format("MMM DD, YYYY HH:mm");
    }
  };

  // Show loading state only on initial load
  if (loading && comments.length === 0 && !sprintId) {
    return (
      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Comments
        </Typography>
        <Box className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Box key={i} className="flex items-start gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <Box className="flex-1">
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width="100%" height={60} />
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  // Show error if no sprintId
  if (!sprintId) {
    return (
      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          Comments
        </Typography>
        <Box className="text-center py-8">
          <Typography variant="body1" className="text-gray-500">
            Invalid sprint ID. Please select a valid sprint.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <div>
      <SuccessAlert
        show={showSuccess}
        message={message}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorAlert
        show={showError}
        message={message}
        onClose={() => setShowError(false)}
      />

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4 flex items-center gap-2">
          Comments
          <Chip
            label={totalCount || comments.length}
            size="small"
            sx={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: 600,
            }}
          />
        </Typography>

        {/* Search and Filter */}
        <Box className="mb-4 flex gap-2 flex-wrap">
          <TextField
            placeholder="Search comments..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Autocomplete
            options={users}
            getOptionLabel={(option) => {
              const name = option.name || option.username || "";
              return name + (option.email ? ` (${option.email})` : "");
            }}
            value={filterUser}
            onChange={(event, newValue) => {
              setFilterUser(newValue);
            }}
            size="small"
            sx={{ minWidth: 200 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Filter by user"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <FilterListIcon fontSize="small" sx={{ mr: 1, color: "action.active" }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 1 }}
                  className="bg-blue-500"
                >
                  {(option.name || option.username || "U").charAt(0).toUpperCase()}
                </Avatar>
                {option.name || option.username || "User"}{option.email ? ` (${option.email})` : ""}
              </Box>
            )}
          />
          {(searchQuery || filterUser) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchQuery("");
                setFilterUser(null);
              }}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Comment Form */}
        <Box className="mb-6">
          <form onSubmit={handleSubmitComment}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment... (Markdown supported)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              className="mb-2"
              disabled={submitting}
              helperText={`${newComment.length}/2000 characters • Markdown supported: **bold**, *italic*, _underline_, \`code\`, >quote`}
              inputProps={{ maxLength: 2000 }}
            />
            <Box className="flex items-center gap-2 justify-between">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                disabled={submitting || !newComment.trim()}
                sx={{
                  minWidth: 140,
                }}
              >
                {submitting ? "Submitting..." : "Add Comment"}
              </Button>
              {newComment.trim() && (
                <Button
                  variant="text"
                  onClick={() => setNewComment("")}
                  disabled={submitting}
                >
                  Clear
                </Button>
              )}
            </Box>
          </form>
        </Box>

        {/* Comments List */}
        <Box className="space-y-4 max-h-[600px] overflow-y-auto">
          {comments.length === 0 ? (
            <Box className="text-center py-12">
              <Typography variant="h6" className="text-gray-400 mb-2">
                No comments yet
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Be the first to comment on this sprint!
              </Typography>
            </Box>
          ) : (
            comments.map((comment) => (
              <Box
                key={comment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {editingId === comment.id ? (
                  // Edit Mode
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      variant="outlined"
                      className="mb-2"
                      placeholder="Edit comment... (Markdown supported)"
                      helperText={`${editContent.length}/2000 characters • Markdown supported: **bold**, *italic*, _underline_, \`code\`, >quote`}
                      inputProps={{ maxLength: 2000 }}
                    />
                    <Box className="flex items-center gap-2">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleEditComment}
                        disabled={!editContent.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // View Mode
                  <Box className="flex items-start gap-3">
                    <Avatar
                      className="bg-blue-500"
                      sx={{ width: 40, height: 40 }}
                    >
                      {comment.user?.name?.charAt(0)?.toUpperCase() ||
                        comment.user?.username?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </Avatar>
                    <Box className="flex-1">
                      <Box className="flex items-center justify-between mb-2">
                        <Box className="flex items-center gap-2">
                          <Typography
                            variant="subtitle2"
                            className="font-semibold"
                          >
                            {comment.user?.name ||
                              comment.user?.username ||
                              "User"}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                            title={dayjs(comment.created_at).format(
                              "MMM DD, YYYY HH:mm"
                            )}
                          >
                            {formatTime(comment.created_at)}
                          </Typography>
                          {comment.updated_at !== comment.created_at && (
                            <Chip
                              label="Edited"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                backgroundColor: "#f5f5f5",
                              }}
                            />
                          )}
                        </Box>
                        {canEditDelete(comment) && (
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              handleMenuOpen(e, comment.id, comment.user?.id)
                            }
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Box className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {comment.content}
                        </ReactMarkdown>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            ))
          )}
          <div ref={commentsEndRef} />
        </Box>

        {/* Edit/Delete Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              const comment = comments.find((c) => c.id === selectedCommentId);
              if (comment) {
                handleStartEdit(comment);
              }
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDeleteComment}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  );
};

export default SprintComments;
