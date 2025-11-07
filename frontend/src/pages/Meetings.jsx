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
import Select from "react-select";
import axios from "axios";
import BASE_API_URL from "../data";
import { getToken } from "../Token";

const Meetings = () => {
  // Meetings list state
  const [meetings, setMeetings] = useState([]);
  const [count, setCount] = useState(0);

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

  // Fetch meetings from backend
  const fetchMeetings = async (pageNumber, pageSize) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/meetings/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page: pageNumber + 1, page_size: pageSize },
      });
      setMeetings(response.data.results || []);
      setCount(response.data.count || 0);
    } catch (e) {
      setMeetings([]);
      setCount(0);
    }
  };

  useEffect(() => {
    fetchMeetings(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // Create Meeting modal
  const [createMeetingsOpen, setCreateMeetingsOpen] = useState(false);

  const handleCreateMeetingsOpen = () => {
    setCreateForm({ name: "", lead: "", note: "", link: "", startAt: "", duration: 30, status: "scheduled" });
    setSelectedMeetingMembers([]);
    setSelectedTeams([]);
    setCreateMeetingsOpen(true);
  };
  const handleCreateMeetingsClose = () => {
    setCreateMeetingsOpen(false);
  };

  // Edit Meeting Modal
  const [editMeetingsOpen, setEditMeetingsOpen] = useState(false);

  const handleEditMeetingsOpen = () => {
    setEditMeetingsOpen(true);
  };
  const handleEditMeetingsClose = () => {
    setEditMeetingsOpen(false);
  };

  // Delete Meeting Modal
  const [deleteMeetingsOpen, setDeleteMeetingsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const handleDeleteMeetingsOpen = (row) => {
    setDeleteId(row?.id || null);
    setDeleteMeetingsOpen(true);
  };
  const handleDeleteMeetingsClose = () => {
    setDeleteMeetingsOpen(false);
  };

  const deleteMeeting = async () => {
    if (!deleteId) return;
    try {
      const accessToken = getToken("accessToken");
      await axios.delete(`${BASE_API_URL}/meetings/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDeleteMeetingsOpen(false);
      setDeleteId(null);
      fetchMeetings(page, rowsPerPage);
    } catch {}
  };

  // View Meeting Modal
  const [viewMeetingsOpen, setViewMeetingsOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const handleViewMeetingsOpen = async (row) => {
    try {
      const accessToken = getToken("accessToken");
      const resp = await axios.get(`${BASE_API_URL}/meetings/${row.id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMeetingDetails(resp.data);
    } catch {
      setMeetingDetails(row);
    }
    setViewMeetingsOpen(true);
  };
  const handleViewMeetingsClose = () => {
    setViewMeetingsOpen(false);
  };

  // Employees for lead + members
  const [employeeNameData, setEmployeeNameData] = useState([]);
  const [selectMultiOptions, setSelectMultiOptions] = useState([]);
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
      setEmployeeNameData(response.data || []);

      if (Array.isArray(response.data)) {
        const opts = response.data.map((emp) => ({ value: emp.id, label: emp.name }));
        setSelectMultiOptions(opts);
      }
    } catch (err) {
      // ignore silently for now
    }
  };

  useEffect(() => {
    getEmployeeNameData();
  }, []);

  const [selectedMeetingMembers, setSelectedMeetingMembers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [editForm, setEditForm] = useState({ id: null, name: "", lead: "", note: "", link: "", startAt: "", duration: 30, status: "scheduled" });
  const [createForm, setCreateForm] = useState({ name: "", lead: "", note: "", link: "", startAt: "", duration: 30, status: "scheduled" });

  // Get filtered member options (excluding the lead)
  const getFilteredMemberOptions = (leadId) => {
    if (!leadId) return selectMultiOptions;
    return selectMultiOptions.filter(opt => opt.value !== parseInt(leadId));
  };

  // Auto-add lead to members when lead is selected
  useEffect(() => {
    if (createForm.lead && createMeetingsOpen) {
      const leadEmp = employeeNameData.find(emp => emp.id === parseInt(createForm.lead));
      if (leadEmp) {
        const leadOption = { value: leadEmp.id, label: leadEmp.name };
        setSelectedMeetingMembers(prev => {
          // Check if lead already exists in members
          const leadAlreadyExists = prev.some(m => m.value === leadEmp.id);
          if (leadAlreadyExists) {
            // If lead exists, just ensure it's at the beginning (no duplicates)
            const filtered = prev.filter(m => m.value !== leadEmp.id);
            return [leadOption, ...filtered];
          } else {
            // If lead doesn't exist, add it at the beginning
            return [leadOption, ...prev];
          }
        });
      }
    } else if (!createForm.lead && createMeetingsOpen) {
      // If lead is cleared, remove it from members
      setSelectedMeetingMembers(prev => prev.filter(m => {
        return true; // Keep all members when lead is cleared
      }));
    }
  }, [createForm.lead, createMeetingsOpen, employeeNameData]);

  // Handle team selection - add all team members
  const handleTeamSelection = (selectedTeamOptions) => {
    setSelectedTeams(selectedTeamOptions || []);
    
    // Determine which form is active and get the lead
    const currentLeadId = editMeetingsOpen ? editForm.lead : createForm.lead;
    
    // Get all unique members from selected teams
    const allTeamMemberIds = new Set();
    const allTeamMembers = [];
    
    selectedTeamOptions?.forEach(teamOption => {
      const team = teamOptions.find(t => t.value === teamOption.value);
      if (team && team.teamData && Array.isArray(team.teamData.team_members)) {
        team.teamData.team_members.forEach(member => {
          if (!allTeamMemberIds.has(member.id)) {
            allTeamMemberIds.add(member.id);
            allTeamMembers.push({ value: member.id, label: member.name });
          }
        });
      }
    });

    // Merge with existing members, ensuring no duplicates
    setSelectedMeetingMembers(prev => {
      const existingIds = new Set(prev.map(m => m.value));
      const leadId = currentLeadId ? parseInt(currentLeadId) : null;
      
      // Separate lead and other existing members
      const leadMember = leadId ? prev.find(m => m.value === leadId) : null;
      const otherMembers = prev.filter(m => m.value !== leadId);
      
      // Add new team members (excluding lead if it exists)
      const newMembers = allTeamMembers.filter(m => {
        // Don't add if already exists or if it's the lead
        return !existingIds.has(m.value) && (!leadId || m.value !== leadId);
      });
      
      // If lead exists, ensure it stays at the beginning
      // If lead is in team members but not yet selected as lead, still don't add it here
      // (it will be added when lead is selected)
      if (leadMember) {
        return [leadMember, ...otherMembers, ...newMembers];
      } else {
        // If no lead selected yet, but team member might become lead later
        // So we add all members, and when lead is selected, it will be moved to front
        return [...otherMembers, ...newMembers];
      }
    });
  };

  // Auto-add lead to members when lead is selected in edit form
  useEffect(() => {
    if (editForm.lead && editMeetingsOpen) {
      const leadEmp = employeeNameData.find(emp => emp.id === parseInt(editForm.lead));
      if (leadEmp) {
        const leadOption = { value: leadEmp.id, label: leadEmp.name };
        setSelectedMeetingMembers(prev => {
          // Check if lead already exists in members
          const leadAlreadyExists = prev.some(m => m.value === leadEmp.id);
          if (leadAlreadyExists) {
            // If lead exists, just ensure it's at the beginning (no duplicates)
            const filtered = prev.filter(m => m.value !== leadEmp.id);
            return [leadOption, ...filtered];
          } else {
            // If lead doesn't exist, add it at the beginning
            return [leadOption, ...prev];
          }
        });
      }
    }
  }, [editForm.lead, editMeetingsOpen, employeeNameData]);

  // Handle meeting members change - ensure lead is always included
  const handleMeetingMembersChange = (selectedMembers) => {
    const currentLeadId = editMeetingsOpen ? editForm.lead : createForm.lead;
    
    if (currentLeadId) {
      const leadId = parseInt(currentLeadId);
      const leadEmp = employeeNameData.find(emp => emp.id === leadId);
      
      if (leadEmp) {
        const leadOption = { value: leadEmp.id, label: leadEmp.name };
        // Ensure lead is always in the list
        const leadExists = selectedMembers?.some(m => m.value === leadId);
        if (!leadExists) {
          setSelectedMeetingMembers([leadOption, ...(selectedMembers || [])]);
        } else {
          // Keep lead at the beginning
          const otherMembers = selectedMembers.filter(m => m.value !== leadId);
          setSelectedMeetingMembers([leadOption, ...otherMembers]);
        }
      } else {
        setSelectedMeetingMembers(selectedMembers || []);
      }
    } else {
      setSelectedMeetingMembers(selectedMembers || []);
    }
  };

  // Teams data
  const [teamsData, setTeamsData] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  
  // Fetch teams data
  const getTeamsData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(
        `${BASE_API_URL}/peoples/teams/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: { page_size: 1000, is_active: 'true' },
        }
      );
      const teams = response.data.results || [];
      setTeamsData(teams);
      
      // Fetch detailed team info to get all members
      const teamsWithDetails = await Promise.all(
        teams.map(async (team) => {
          try {
            const detailResp = await axios.get(
              `${BASE_API_URL}/peoples/teams/${team.id}/`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            return detailResp.data;
          } catch {
            return team;
          }
        })
      );
      
      const opts = teamsWithDetails.map((team) => ({
        value: team.id,
        label: team.name || `Team ${team.id}`,
        teamData: team,
      }));
      setTeamOptions(opts);
    } catch (err) {
      // ignore silently for now
    }
  };

  useEffect(() => {
    getTeamsData();
  }, []);
  return (
    <div>
      <div>
        <div className="">
          <div className="">
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" to={"/"}>
                Dashboard
              </Link>

              <Typography sx={{ color: "text.primary" }}>Meetings</Typography>
            </Breadcrumbs>
          </div>

          <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
            <div>
              <h4 className="text-2xl font-bold">Schedule Meetings</h4>
            </div>
            <div>
              <PrimaryBtn onClick={handleCreateMeetingsOpen}>
                <AddIcon /> Create Meeting
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
                    <TableCell>Meeting Name</TableCell>
                    <TableCell>Start Date & Time</TableCell>
                    <TableCell>Meeting Link</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Scheduled by</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meetings.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.start_at ? new Date(row.start_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          {row.meeting_link ? (
                            <a href={row.meeting_link} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-[5px] bg-gray-200 cursor-pointer ">Join</a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{row.duration_minutes} mins</TableCell>
                        <TableCell>{row.scheduled_by_employee?.name || row.scheduled_by?.first_name || row.scheduled_by?.username || '-'}</TableCell>
                        <TableCell>{row.status}</TableCell>

                        <TableCell>
                          <IconButton
                            onClick={() => handleViewMeetingsOpen(row)}
                            aria-label="edit"
                            color="success"
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>
                          <IconButton
                            onClick={async () => {
                              try {
                                const accessToken = getToken("accessToken");
                                const resp = await axios.get(`${BASE_API_URL}/meetings/${row.id}/`, { headers: { Authorization: `Bearer ${accessToken}` }});
                                const d = resp.data;
                                setEditForm({ id: d.id, name: d.name, lead: d.scheduled_by_employee?.id || "", note: d.note || "", link: d.meeting_link || "", startAt: d.start_at ? d.start_at.substring(0,16) : "", duration: d.duration_minutes || 30, status: d.status || "scheduled" });
                                const members = (d.attendee_employees || []).map((e)=>({ value: e.id, label: e.name }));
                                // Ensure lead is at the beginning
                                const leadId = d.scheduled_by_employee?.id;
                                if (leadId) {
                                  const leadMember = members.find(m => m.value === leadId);
                                  const otherMembers = members.filter(m => m.value !== leadId);
                                  setSelectedMeetingMembers(leadMember ? [leadMember, ...otherMembers] : members);
                                } else {
                                  setSelectedMeetingMembers(members);
                                }
                                setSelectedTeams([]);
                              } catch {
                                setEditForm({ id: row.id, name: row.name, lead: row.scheduled_by_employee?.id || "", note: row.note || "", link: row.meeting_link || "", startAt: row.start_at ? row.start_at.substring(0,16) : "", duration: row.duration_minutes || 30, status: row.status || "scheduled" });
                                setSelectedMeetingMembers([]);
                                setSelectedTeams([]);
                              }
                              setEditMeetingsOpen(true);
                            }}
                            aria-label="edit"
                            color="warning"
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDeleteMeetingsOpen(row)}
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

          {/* Create Meeting Modal */}
          <ModalComp
            open={createMeetingsOpen}
            onClose={handleCreateMeetingsClose}
            title={"Create Meeting"}
          >
            <form onSubmit={async (e)=>{
              e.preventDefault();
              try {
                const accessToken = getToken("accessToken");
                const payload = {
                  name: createForm.name,
                  start_at: createForm.startAt ? new Date(createForm.startAt).toISOString() : null,
                  meeting_link: createForm.link || null,
                  duration_minutes: Number(createForm.duration) || 30,
                  status: createForm.status || "scheduled",
                  note: createForm.note || "",
                  scheduled_by_employee_id: createForm.lead || null,
                  attendee_employee_ids: selectedMeetingMembers.map((m)=>m.value),
                };
                await axios.post(`${BASE_API_URL}/meetings/`, payload, { headers: { Authorization: `Bearer ${accessToken}` }});
                handleCreateMeetingsClose();
                fetchMeetings(page, rowsPerPage);
              } catch (err) {
                const msg = err?.response?.data || err?.message || 'Failed to create meeting';
                window.alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
              }
            }}>
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingName">
                      Meeting Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      placeholder="Meeting Name"
                      type="text"
                      name="MeetingName"
                      id="MeetingName"
                      value={createForm.name}
                      onChange={(e)=>setCreateForm((p)=>({...p, name: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingLead">
                      Meeting Lead<span className="text-red-600">*</span>
                    </label>
                    <select name="MeetingLead" id="MeetingLead" value={createForm.lead} onChange={(e)=>setCreateForm((p)=>({...p, lead: e.target.value}))}>
                      <option value="">Select Meeting Lead</option>
                      {employeeNameData.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="StartAt">
                      Start Date & Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="StartAt"
                      id="StartAt"
                      value={createForm.startAt}
                      onChange={(e)=>setCreateForm((p)=>({...p, startAt: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingLink">Meeting Link</label>
                    <input
                      placeholder="https://…"
                      type="url"
                      name="MeetingLink"
                      id="MeetingLink"
                      value={createForm.link}
                      onChange={(e)=>setCreateForm((p)=>({...p, link: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="Duration">
                      Duration (mins) <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      placeholder="30"
                      type="number"
                      min={1}
                      name="Duration"
                      id="Duration"
                      value={createForm.duration}
                      onChange={(e)=>setCreateForm((p)=>({...p, duration: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="Status">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <select name="Status" id="Status" value={createForm.status} onChange={(e)=>setCreateForm((p)=>({...p, status: e.target.value}))}>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="AddTeams">
                      Add Team <span className="text-gray-500">(Optional)</span>
                    </label>
                    <Select
                      isMulti
                      options={teamOptions}
                      value={selectedTeams}
                      onChange={handleTeamSelection}
                      className="text-black"
                      placeholder="Select teams to add all members..."
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "5px",
                          borderColor: state.isFocused
                            ? "#282C6C"
                            : "rgb(145, 144, 144)",
                          borderWidth: "2px",
                          boxShadow: "none",
                          padding: "0px 8px",
                          "&:hover": { borderColor: "#282C6C" },
                        }),

                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#fff",
                          borderRadius: "5px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#282C6C"
                            : state.isFocused
                              ? "#0073E6"
                              : "white",
                          color: state.isSelected
                            ? "white"
                            : state.isFocused
                              ? "white"
                              : "black",
                          padding: "5px 16px",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2563EB",
                          },
                        }),
                      }}
                    />
                    <small className="text-gray-500">Select teams to automatically add all team members to the meeting</small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="MeetingMembers">
                      Meeting members <span className="text-red-600">*</span>
                    </label>
                    <Select
                      isMulti
                      options={getFilteredMemberOptions(createForm.lead)}
                      value={selectedMeetingMembers}
                      onChange={handleMeetingMembersChange}
                      className="text-black"
                      placeholder="Select meeting members..."
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "5px",
                          borderColor: state.isFocused
                            ? "#282C6C"
                            : "rgb(145, 144, 144)",
                          borderWidth: "2px",
                          boxShadow: "none",
                          padding: "0px 8px",
                          "&:hover": { borderColor: "#282C6C" },
                        }),

                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#fff", // Light gray dropdown background
                          borderRadius: "5px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#282C6C" // Blue when selected
                            : state.isFocused
                              ? "#0073E6" // Light blue when hovered
                              : "white", // Default background
                          color: state.isSelected
                            ? "white"
                            : state.isFocused
                              ? "white"
                              : "black",
                          padding: "5px 16px",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2563EB", // Darker blue on click
                          },
                        }),
                      }}
                    />
                    <small className="text-gray-500">Meeting lead is automatically included and cannot be removed from this list</small>
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="MeetingNote">
                    Note <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Meeting Note"
                    rows={4}
                    name="MeetingNote"
                    id="MeetingNote"
                    value={createForm.note}
                    onChange={(e)=>setCreateForm((p)=>({...p, note: e.target.value}))}
                  ></textarea>
                  <small></small>
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleCreateMeetingsClose}>Close</CloseBtn>
                  <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
                </div>
              </div>
            </form>
          </ModalComp>

          {/* Edit Meeting Modal */}
          <ModalComp
            title={"Edit Meeting"}
            open={editMeetingsOpen}
            onClose={handleEditMeetingsClose}
          >
            <form onSubmit={async (e)=>{
              e.preventDefault();
              try {
                if (!editForm.id) return;
                const accessToken = getToken("accessToken");
                const payload = {
                  name: editForm.name,
                  start_at: editForm.startAt ? new Date(editForm.startAt).toISOString() : null,
                  meeting_link: editForm.link || null,
                  duration_minutes: Number(editForm.duration) || 30,
                  status: editForm.status || "scheduled",
                  note: editForm.note || "",
                  scheduled_by_employee_id: editForm.lead || null,
                  attendee_employee_ids: selectedMeetingMembers.map((m)=>m.value),
                };
                await axios.put(`${BASE_API_URL}/meetings/${editForm.id}/`, payload, { headers: { Authorization: `Bearer ${accessToken}` }});
                handleEditMeetingsClose();
                fetchMeetings(page, rowsPerPage);
              } catch (err) {
                const msg = err?.response?.data || err?.message || 'Failed to update meeting';
                window.alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
              }
            }}>
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingName">
                      Meeting Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      placeholder="Meeting Name"
                      type="text"
                      name="MeetingName"
                      id="MeetingName"
                      value={editForm.name}
                      onChange={(e)=>setEditForm((p)=>({...p, name: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingLead">
                      Meeting Lead<span className="text-red-600">*</span>
                    </label>
                    <select name="MeetingLead" id="MeetingLead" value={editForm.lead} onChange={(e)=>setEditForm((p)=>({...p, lead: e.target.value}))}>
                      <option value="">Select Meeting Lead</option>
                      {employeeNameData.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="EditStartAt">
                      Start Date & Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="EditStartAt"
                      id="EditStartAt"
                      value={editForm.startAt}
                      onChange={(e)=>setEditForm((p)=>({...p, startAt: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="EditMeetingLink">Meeting Link</label>
                    <input
                      placeholder="https://…"
                      type="url"
                      name="EditMeetingLink"
                      id="EditMeetingLink"
                      value={editForm.link}
                      onChange={(e)=>setEditForm((p)=>({...p, link: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="EditDuration">
                      Duration (mins) <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      placeholder="30"
                      type="number"
                      min={1}
                      name="EditDuration"
                      id="EditDuration"
                      value={editForm.duration}
                      onChange={(e)=>setEditForm((p)=>({...p, duration: e.target.value}))}
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="EditStatus">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <select name="EditStatus" id="EditStatus" value={editForm.status} onChange={(e)=>setEditForm((p)=>({...p, status: e.target.value}))}>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="EditAddTeams">
                      Add Team <span className="text-gray-500">(Optional)</span>
                    </label>
                    <Select
                      isMulti
                      options={teamOptions}
                      value={selectedTeams}
                      onChange={handleTeamSelection}
                      className="text-black"
                      placeholder="Select teams to add all members..."
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "5px",
                          borderColor: state.isFocused
                            ? "#282C6C"
                            : "rgb(145, 144, 144)",
                          borderWidth: "2px",
                          boxShadow: "none",
                          padding: "0px 8px",
                          "&:hover": { borderColor: "#282C6C" },
                        }),

                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#fff",
                          borderRadius: "5px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#282C6C"
                            : state.isFocused
                              ? "#0073E6"
                              : "white",
                          color: state.isSelected
                            ? "white"
                            : state.isFocused
                              ? "white"
                              : "black",
                          padding: "5px 16px",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2563EB",
                          },
                        }),
                      }}
                    />
                    <small className="text-gray-500">Select teams to automatically add all team members to the meeting</small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="EditMeetingMembers">
                      Meeting members <span className="text-red-600">*</span>
                    </label>
                    <Select
                      isMulti
                      options={getFilteredMemberOptions(editForm.lead)}
                      value={selectedMeetingMembers}
                      onChange={handleMeetingMembersChange}
                      className="text-black"
                      placeholder="Select meeting members..."
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "5px",
                          borderColor: state.isFocused
                            ? "#282C6C"
                            : "rgb(145, 144, 144)",
                          borderWidth: "2px",
                          boxShadow: "none",
                          padding: "0px 8px",
                          "&:hover": { borderColor: "#282C6C" },
                        }),

                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#fff", // Light gray dropdown background
                          borderRadius: "5px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#282C6C" // Blue when selected
                            : state.isFocused
                              ? "#0073E6" // Light blue when hovered
                              : "white", // Default background
                          color: state.isSelected
                            ? "white"
                            : state.isFocused
                              ? "white"
                              : "black",
                          padding: "5px 16px",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2563EB", // Darker blue on click
                          },
                        }),
                      }}
                    />
                    <small className="text-gray-500">Meeting lead is automatically included and cannot be removed from this list</small>
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="MeetingNote">
                    Note <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Meeting Note"
                    rows={4}
                    name="MeetingNote"
                    id="MeetingNote"
                    value={editForm.note}
                    onChange={(e)=>setEditForm((p)=>({...p, note: e.target.value}))}
                  ></textarea>
                  <small></small>
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleEditMeetingsClose}>Close</CloseBtn>
                  <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
                </div>
              </div>
            </form>
          </ModalComp>

          {/* Delete Meeting Modal */}
          <ModalComp
            open={deleteMeetingsOpen}
            onClose={handleDeleteMeetingsClose}
          >
            <div className="w-full ">
              <div>Do you wand to delete ?</div>
              <div className="flex mt-8 justify-end gap-4">
                <CloseBtn
                  onClick={handleDeleteMeetingsClose}
                  className={"border border-gray"}
                >
                  Close
                </CloseBtn>
                <DeleteBtn onClick={deleteMeeting}>Delete</DeleteBtn>
              </div>
            </div>
          </ModalComp>

          {/* View Meeting Modal */}
          <ModalComp
            title={"Meeting Details"}
            open={viewMeetingsOpen}
            onClose={handleViewMeetingsClose}
          >
            {meetingDetails && (
            <div className="mt-4  no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Meeting Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{meetingDetails.name || '-'}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Start Date & Time</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{meetingDetails.start_at ? new Date(meetingDetails.start_at).toLocaleString() : '-'}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Meeting Link</div>
                  </Grid2>
                  <Grid2 size={8}>
                    {meetingDetails.meeting_link ? (
                      <a href={meetingDetails.meeting_link} target="_blank" rel="noreferrer" className="text-blue-700 underline">{meetingDetails.meeting_link}</a>
                    ) : (
                      <div>-</div>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Meeting Lead</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{meetingDetails.scheduled_by_employee?.name || meetingDetails.scheduled_by?.first_name || meetingDetails.scheduled_by?.username || '-'}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Meeting Members</div>
                  </Grid2>
                  <Grid2 size={8}>
                    {Array.isArray(meetingDetails.attendee_employees) && meetingDetails.attendee_employees.length > 0 ? (
                      meetingDetails.attendee_employees.map((m, i)=> (<div key={i}>{m.name}</div>))
                    ) : (
                      <div>-</div>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2} className="  px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Notes</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{meetingDetails.note || '-'}</div>
                  </Grid2>
                </Grid2>
              </div>
            </div>
            )}
          </ModalComp>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
