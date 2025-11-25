import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import axios from 'axios';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Chip,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BASE_API_URL from '../data';
import { getToken } from '../Token';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Calculate dropdown position dynamically
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && searchRef.current) {
        const rect = searchRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left + (rect.width / 2),
        });
      }
    };
    
    if (showDropdown) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      // Update on any scroll/resize event
      const interval = setInterval(updatePosition, 100);
      return () => {
        clearInterval(interval);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showDropdown]);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const accessToken = getToken('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/auth/search/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: searchQuery,
          limit: 10,
        },
      });

      if (response.data) {
        const apiResults = response.data.results || [];
        const apiSuggestions = response.data.suggestions || [];
        
        console.log('🔍 Search results:', apiResults);
        console.log('💡 AI Suggestions:', apiSuggestions);
        
        setResults(apiResults);
        setSuggestions(apiSuggestions);
        
        // Show dropdown if we have any results or suggestions
        if (apiResults.length > 0 || apiSuggestions.length > 0) {
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setResults([]);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input - search after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query.trim());
      }, 300); // 300ms debounce
    } else {
      setResults([]);
      setSuggestions([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  // Handle navigation based on result type
  const handleResultClick = useCallback((item) => {
    console.log('📍 Navigating to:', item);
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    switch (item.type) {
      case 'project':
        navigate('/projects');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'sprint_task':
        if (item.sprint_id) {
          navigate(`/sprints/${item.sprint_id}`);
        } else {
          navigate('/sprints');
        }
        break;
      case 'sprint':
        navigate(`/sprints/${item.id}`);
        break;
      case 'employee':
        navigate('/employee');
        break;
      case 'team':
        navigate('/teams');
        break;
      default:
        break;
    }
  }, [navigate]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    console.log('💡 Suggestion clicked:', suggestion);
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (suggestion.type === 'result' && suggestion.data) {
      handleResultClick(suggestion.data);
    } else if (suggestion.type === 'action' && suggestion.route) {
      navigate(suggestion.route);
    } else if (suggestion.type === 'search') {
      const searchQuery = suggestion.query || query;
      if (searchQuery) {
        navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  }, [navigate, handleResultClick, query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + results.length;
    
    if (totalItems === 0) {
      if (e.key === 'Enter' && query.trim().length >= 2) {
        // Perform search on Enter
        performSearch(query.trim());
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setShowDropdown(true);
        setSelectedIndex((prev) => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) return -1;
          return prev - 1;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalItems) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            const resultIndex = selectedIndex - suggestions.length;
            handleResultClick(results[resultIndex]);
          }
        } else if (suggestions.length > 0) {
          handleSuggestionClick(suggestions[0]);
        } else if (results.length > 0) {
          handleResultClick(results[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const getStatusColor = (status) => {
    const statusMap = {
      'completed': '#10b981',
      'done': '#10b981',
      'in_progress': '#3b82f6',
      'active': '#3b82f6',
      'todo': '#6b7280',
      'pending': '#f59e0b',
      'cancelled': '#ef4444',
    };
    return statusMap[status] || '#6b7280';
  };

  return (
    <div className="relative" style={{ position: 'relative', zIndex: 9999 }}>
      {/* Search Input */}
      <TextField
        inputRef={searchRef}
        type="text"
        placeholder="Search projects, tasks, sprints..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedIndex(-1);
        }}
        onFocus={() => {
          if (results.length > 0 || suggestions.length > 0) {
            setShowDropdown(true);
          }
        }}
        onKeyDown={handleKeyDown}
        size="small"
        sx={{
          width: '280px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: 'rgba(6, 182, 212, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(6, 182, 212, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(6, 182, 212, 0.5)',
            },
            '& input::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
              opacity: 1,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)' }} />
              ) : (
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
              )}
            </InputAdornment>
          ),
        }}
      />

      {/* AI-Powered Dropdown Results */}
      {showDropdown && (results.length > 0 || suggestions.length > 0) && createPortal(
        <Paper
          ref={dropdownRef}
          elevation={24}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '600px',
            maxWidth: 'calc(90vw - 2rem)',
            maxHeight: '550px',
            overflowY: 'auto',
            zIndex: 99999,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            transform: 'translateX(-50%)',
          }}
        >
          {/* AI Suggestions Section */}
          {suggestions.length > 0 && (
            <>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f0f9ff', borderBottom: '1px solid #e0f2fe' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#0ea5e9', letterSpacing: '0.5px' }}>
                    AI Suggestions
                  </Typography>
                </Box>
              </Box>
              <List dense sx={{ py: 0.5 }}>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={`suggestion-${index}`}
                    disablePadding
                    sx={{
                      bgcolor: selectedIndex === index ? '#f0f9ff' : 'transparent',
                      '&:hover': {
                        bgcolor: '#f0f9ff',
                      },
                    }}
                  >
                    <ListItemButton 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(suggestion);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <span style={{ fontSize: '20px' }}>{suggestion.icon || '💡'}</span>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                            {suggestion.text}
                          </Typography>
                        }
                      />
                      <ArrowForwardIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {results.length > 0 && <Divider sx={{ my: 0.5 }} />}
            </>
          )}

          {/* Search Results Section */}
          {results.length > 0 && (
            <>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px' }}>
                  Search Results ({results.length})
                </Typography>
              </Box>
              <List dense sx={{ py: 0.5 }}>
                {results.map((item, index) => {
                  const itemIndex = suggestions.length + index;
                  return (
                    <ListItem
                      key={`${item.type}-${item.id}`}
                      disablePadding
                      sx={{
                        bgcolor: selectedIndex === itemIndex ? '#f3f4f6' : 'transparent',
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <ListItemButton 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResultClick(item);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <span style={{ fontSize: '20px' }}>{item.icon || '📄'}</span>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                                {item.title}
                              </Typography>
                              {item.status && (
                                <Chip
                                  label={item.status.replace(/_/g, ' ').toUpperCase()}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: getStatusColor(item.status),
                                    color: 'white',
                                    fontWeight: 700,
                                    px: 0.5,
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              {item.description && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>
                                  {item.description.length > 80 ? `${item.description.substring(0, 80)}...` : item.description}
                                </Typography>
                              )}
                              {(item.project || item.sprint) && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  {item.project && (
                                    <>
                                      <span>📁</span>
                                      <span>{item.project}</span>
                                    </>
                                  )}
                                  {item.sprint && (
                                    <>
                                      <span>•</span>
                                      <span>🏃</span>
                                      <span>{item.sprint}</span>
                                    </>
                                  )}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ArrowForwardIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}

          {/* Footer with keyboard shortcuts */}
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <span>💡</span>
              <span>AI-powered search</span>
              <span>•</span>
              <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}>↑↓</kbd>
              <span>Navigate</span>
              <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}>Enter</kbd>
              <span>Select</span>
              <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}>Esc</kbd>
              <span>Close</span>
            </Typography>
          </Box>
        </Paper>,
        document.body
      )}

      {/* Empty state when searching but no results */}
      {showDropdown && query.length >= 2 && !loading && results.length === 0 && suggestions.length === 0 && createPortal(
        <Paper
          ref={dropdownRef}
          elevation={24}
          sx={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '600px',
            maxWidth: 'calc(90vw - 2rem)',
            zIndex: 99999,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            transform: 'translateX(-50%)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            No results found for "{query}"
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af', mt: 1, display: 'block' }}>
            Try searching for projects, tasks, sprints, or teams
          </Typography>
        </Paper>,
        document.body
      )}
    </div>
  );
};

export default SearchBar;
