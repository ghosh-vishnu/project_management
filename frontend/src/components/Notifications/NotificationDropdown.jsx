import { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import BASE_API_URL from '../../data';
import { getToken } from '../../Token';
import { useNavigate } from 'react-router';

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);

  const open = Boolean(anchorEl);

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const accessToken = getToken('accessToken');
      if (!accessToken) return;

      const response = await axios.get(`${BASE_API_URL}/notifications/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNum,
          page_size: 10,
        },
      });

      if (append) {
        setNotifications((prev) => [...prev, ...response.data.results]);
      } else {
        setNotifications(response.data.results);
      }

      setHasMore(response.data.results.length === 10);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const accessToken = getToken('accessToken');
      if (!accessToken) return;

      const response = await axios.get(`${BASE_API_URL}/notifications/unread-count/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const accessToken = getToken('accessToken');
      if (!accessToken) return;

      await axios.post(
        `${BASE_API_URL}/notifications/${notificationId}/read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      // Update count immediately without fetching
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const accessToken = getToken('accessToken');
      if (!accessToken) return;

      await axios.post(
        `${BASE_API_URL}/notifications/mark-all-read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const accessToken = getToken('accessToken');
      if (!accessToken) return;

      await axios.delete(`${BASE_API_URL}/notifications/${notificationId}/delete/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const deletedNotif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      // Only decrease count if deleted notification was unread
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate if action_url is provided
    if (notification.action_url) {
      navigate(notification.action_url);
      handleClose();
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications(1);

    // Set up polling
    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
      if (open) {
        fetchNotifications(1);
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Refresh when dropdown opens - only fetch notifications, not count
  useEffect(() => {
    if (open) {
      fetchNotifications(1);
      // Don't fetch unread count here - it's already being polled
      // This prevents double-counting or incorrect increments
    }
  }, [open]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: '📋',
      task_completed: '✅',
      task_updated: '🔄',
      sprint_created: '🚀',
      sprint_updated: '📝',
      employee_added: '👤',
      employee_updated: '✏️',
      project_created: '📁',
      project_updated: '📂',
      meeting_scheduled: '📅',
      deadline_approaching: '⏰',
      comment_added: '💬',
      system: '⚙️',
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      task_assigned: '#3b82f6',
      task_completed: '#10b981',
      task_updated: '#6366f1',
      sprint_created: '#8b5cf6',
      sprint_updated: '#a855f7',
      employee_added: '#06b6d4',
      employee_updated: '#14b8a6',
      project_created: '#f59e0b',
      project_updated: '#f97316',
      meeting_scheduled: '#ec4899',
      deadline_approaching: '#ef4444',
      comment_added: '#06b6d4',
      system: '#6b7280',
      info: '#3b82f6',
      warning: '#f59e0b',
      success: '#10b981',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <>
      <Tooltip title="Notifications">
        <Badge
          badgeContent={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined}
          color="error"
          invisible={unreadCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              top: 8,
              right: 8,
            },
          }}
        >
          <IconButton
            onClick={handleClick}
            className="hover:bg-white/10 transition-all duration-200 text-white hover:text-cyan-400"
          >
            <CircleNotificationsIcon sx={{ fontSize: 26 }} />
          </IconButton>
        </Badge>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            maxHeight: '80vh',
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkEmailReadIcon />}
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 1 }} />

          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  disablePadding
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? 'none' : `3px solid ${getNotificationColor(notification.type)}`,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                        {getNotificationIcon(notification.type)}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.read ? 400 : 600,
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: `${getNotificationColor(notification.type)}20`,
                              color: getNotificationColor(notification.type),
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time_ago}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => deleteNotification(notification.id, e)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {hasMore && notifications.length > 0 && (
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchNotifications(nextPage, true);
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={16} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;

