import React, { useEffect, useState } from "react";

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
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import { set, useForm } from "react-hook-form";
import { getToken } from "../Token";

// select for status

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
            <option key={index} value={option.id}>
              {option.name}
            </option>
          ))}
      </select>
    </>
  )
);

const SelectOthers = React.forwardRef(
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

const Teams = () => {
  // Pagination variables
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // Employee data variable
  const [TeamsData, setTeamsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'

  // fetch the emp data list
  const getTeamsData = async (pageNumber, pageSize, search = '', filter = 'all') => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const params = {
          page: pageNumber + 1, // API might be 1-indexed, but TablePagination is 0-indexed
          page_size: pageSize,
        };
        
        // Add search parameter
        if (search && search.trim()) {
          params.search = search.trim();
        }
        
        // Add filter parameter
        if (filter !== 'all') {
          params.is_active = filter === 'active' ? 'true' : 'false';
        }
        
        const response = await axios.get(`${BASE_API_URL}/peoples/teams/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        });
        setTeamsData(response.data.results);
        setCount(response.data.count);
        // console.log(response.data)
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  
  // Search handler
  const handleSearch = () => {
    setPage(0); // Reset to first page
    getTeamsData(0, rowsPerPage, searchQuery, activeFilter);
  };

  useEffect(() => {
    getTeamsData(page, rowsPerPage, searchQuery, activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);
  
  // Debounced search effect - only trigger when search/filter changes manually
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      getTeamsData(0, rowsPerPage, searchQuery, activeFilter);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter]);

  // employee name data
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
      setEmployeeNameData(response.data);

      if (response.data) {
        const selectEmployeeOptions = response.data.map((data, index) => ({
          value: data.id,
          label: data.name,
        }));
        setSelectMultiOptions(selectEmployeeOptions);
      }
    } catch (error) {}
  };

  //  project name data

  // const [projectNameData, setProjectNameData] = useState();
  // const getProjectNameData = async () => {
  //   try {
  //     const accessToken = getToken("accessToken");
  //     const response = await axios.get(`${BASE_API_URL}/projects-name/`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     setProjectNameData(response.data);
  //   } catch (error) {}
  // };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Create Team modal
  const [createTeamsOpen, setCreateTeamsOpen] = useState(false);

  const handleCreateTeamsOpen = () => {
    reset({
      name: "",
      team_lead_id: "",
      teamNote: "",
    });
    // console.log(data.team_members)
    setSelectedTeamMembers(
      []
    );
    setCreateTeamsOpen(true);
  };
  const handleCreateTeamsClose = () => {
    setCreateTeamsOpen(false);
  };

  // Edit Team Modal
  const [editTeamsOpen, setEditTeamsOpen] = useState(false);

  const handleEditTeamsOpen = async (rowData) => {
    if (localStorage.getItem("teamsId")) {
      localStorage.removeItem("teamsId");
    }
    localStorage.setItem("teamsId", rowData.id);
    try {
      const accessToken = getToken("accessToken");
      let data = rowData;
      if (rowData?.id && accessToken) {
        const response = await axios.get(
          `${BASE_API_URL}/peoples/teams/${rowData.id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response?.data) data = response.data;
      }

      const mappedMembers = Array.isArray(data.team_members)
        ? data.team_members.map((member) => ({ value: member.id, label: member.name }))
        : [];

      setSelectedTeamMembers(mappedMembers);
      reset({
        name: data.name,
        team_lead_id: data.team_lead?.id,
        teamNote: data.note,
      });
      setEditTeamsOpen(true);
    } catch (e) {
      // fallback to opening with what we have
      setSelectedTeamMembers([]);
      reset({
        name: rowData?.name,
        team_lead_id: rowData?.team_lead?.id,
        teamNote: rowData?.note,
      });
      setEditTeamsOpen(true);
    }
  };
  const handleEditTeamsClose = () => {
    setEditTeamsOpen(false);
  };

  // Delete Team Modal
  const [deleteTeamsOpen, setDeleteTeamsOpen] = useState(false);
  const handleDeleteTeamsOpen = (data) => {
    if (localStorage.getItem("teamsId")) {
      localStorage.removeItem("teamsId");
    }
    localStorage.setItem("teamsId", data.id);
    setDeleteTeamsOpen(true);
  };
  const handleDeleteTeamsClose = () => {
    setDeleteTeamsOpen(false);
  };

  // View Team Modal
  const [viewTeamsOpen, setViewTeamsOpen] = useState(false);
  const [teamDetailsData, setTeamDetailsData] = useState({});
  const handleViewTeamsOpen = async (data) => {
    setViewTeamsOpen(true);
    try {
      const accessToken = getToken("accessToken");
      let details = data || {};
      if (data?.id && accessToken) {
        const response = await axios.get(
          `${BASE_API_URL}/peoples/teams/${data.id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response?.data) {
          details = response.data;
        }
      }
      setTeamDetailsData(details);
    } catch (error) {
      // If details fetch fails, fall back to the row data so at least something is shown
      setTeamDetailsData(data || {});
    }
  };
  const handleViewTeamsClose = () => {
    setViewTeamsOpen(false);
  };

  // delete api call

  const deleteTeamsData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const teamsId = localStorage.getItem("teamsId");
      if (accessToken && teamsId) {
        const response = await axios.delete(
          `${BASE_API_URL}/peoples/teams/${teamsId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Team deleted successfully.");
          getTeamsData(page, rowsPerPage, searchQuery, activeFilter);
          handleDeleteTeamsClose();
        }
      }
    } catch (error) {
      // console.log(error)
      setShowError(true);
      setShowMessage("Team doesn't deleted.");
    }
  };

  // Team member's options
  const teamMembers = employeeNameData || [];
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  // post API call
  const createTeamform = async (data) => {
    try {
      const payload = {
        name: data.name,
        note: data.teamNote,
        team_lead_id: data.team_lead_id,
        team_members_id: selectedTeamMembers.map((member) => member.value),
      };

      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/peoples/teams/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Teams created successfully.");
        setSelectedTeamMembers([]);
        reset();
        handleCreateTeamsClose();
        getTeamsData(page, rowsPerPage, searchQuery, activeFilter);
      }
    } catch (error) {
      // console.log(error.response)

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
        else if (data.user?.email) {
          setShowMessage("Employee with this email is already exist.");
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

  // update api call
  const editTeamsForm = async (data) => {
    try {
      const payload = {
        name: data.name,
        note: data.teamNote,
        team_lead_id: data.team_lead_id,
        team_members_id: selectedTeamMembers.map((member) => member.value),
      };
      
      const accessToken = getToken("accessToken");
      const teamsId = localStorage.getItem("teamsId");
      if (accessToken && teamsId) {
        const response = await axios.put(
          `${BASE_API_URL}/peoples/teams/${teamsId}/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log(response)
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Teams edited successfully.");
          handleEditTeamsClose();
          getTeamsData(page, rowsPerPage, searchQuery, activeFilter);
        }
      }
    } catch (error) {
      // console.log(error.response)
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
        else if (data.user?.email) {
          setShowMessage("Employee with this email is already exist.");
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

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // use effect
  useEffect(() => {
    setSelectedTeamMembers([]);
    getEmployeeNameData();
    // getProjectNameData();
  }, []);

  return (
    <div>
      <div>
        {/* Show alerts */}
        <ErrorAlert
          show={showError}
          message={showMessage}
          onClose={() => setShowError(false)}
        ></ErrorAlert>
        <SuccessAlert
          message={showMessage}
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
        <div className="">
          <div className="">
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" to={"/"}>
                Dashboard
              </Link>

              <Typography sx={{ color: "text.primary" }}>Teams</Typography>
            </Breadcrumbs>
          </div>

          <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
            <div>
              <h4 className="text-2xl font-bold">Teams Management</h4>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search teams..."
                className="px-4 py-2 border-2 border-gray-300 rounded-[5px] focus:outline-none focus:border-blue-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {/* Filter buttons */}
              <button
                onClick={() => {
                  setActiveFilter(activeFilter === 'all' ? 'active' : activeFilter === 'active' ? 'inactive' : 'all');
                  handleSearch();
                }}
                className={`px-4 py-2 rounded-[5px] border-2 ${
                  activeFilter === 'active' 
                    ? 'bg-green-500 text-white border-green-600' 
                    : activeFilter === 'inactive'
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                {activeFilter === 'all' ? 'All Teams' : activeFilter === 'active' ? 'Active Only' : 'Inactive Only'}
              </button>
              <PrimaryBtn onClick={handleCreateTeamsOpen}>
                <AddIcon /> Create Team
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
                    <TableCell>Team Name</TableCell>
                    <TableCell>Team Lead</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TeamsData &&
                    TeamsData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-semibold">{data.name}</div>
                          {data.note && (
                            <small className="text-gray-500">{data.note.substring(0, 50)}...</small>
                          )}
                        </TableCell>
                        <TableCell>
                          {data.team_lead ? (
                            <div>
                              <div className="font-medium">{data.team_lead.name}</div>
                              <small className="text-gray-500">{data.team_lead.designation || 'N/A'}</small>
                            </div>
                          ) : (
                            <span className="text-gray-400">No lead assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {data.member_count || 0} {data.member_count === 1 ? 'member' : 'members'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {data.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleViewTeamsOpen(data)}
                            aria-label="edit"
                            color="success"
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleEditTeamsOpen(data)}
                            aria-label="edit"
                            color="warning"
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDeleteTeamsOpen(data)}
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
                rowsPerPageOptions={[25, 50, 100]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>

          {/* Create Team Modal */}
          <ModalComp
            open={createTeamsOpen}
            onClose={handleCreateTeamsClose}
            title={"Create Team"}
          >
            <form onSubmit={handleSubmit(createTeamform)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="teamName">
                      Team Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      placeholder="Team Name"
                      type="text"
                      name="teamName"
                      id="teamName"
                      {...register("name", {
                        required: "This field is required.",
                        minLength: {
                          value: 3,
                          message: (
                            <span>Length should be greater than 3.</span>
                          ),
                        },
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-600">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      {...register("team_lead_id", {
                        required: "This field is required.",
                      })}
                      label="Team Lead"
                      options={employeeNameData}
                      selectOption={"Team Lead"}
                    />
                    {errors.team_lead_id && (
                      <small className="text-red-600">
                        {errors.team_lead_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="Team Members">
                      Team members
                      {/* <span className="text-red-600">*</span> */}
                    </label>
                    <Select
                      isMulti
                      options={selectMultiOptions}
                      value={selectedTeamMembers}
                      onChange={setSelectedTeamMembers}
                      className="text-black"
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
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="teamNote">
                    Note
                    {/* <span className="text-red-600">*</span> */}
                  </label>
                  <textarea
                    placeholder="Team Note"
                    rows={4}
                    name="teamNote"
                    id="teamNote"
                    {...register("teamNote")}
                  ></textarea>
                  {errors.teamNote && <small>{errors.teamNote.message}</small>}
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleCreateTeamsClose}>Close</CloseBtn>
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

          {/* Edit Team Modal */}
          <ModalComp
            title={"Edit Team"}
            open={editTeamsOpen}
            onClose={handleEditTeamsClose}
          >
            <form onSubmit={handleSubmit(editTeamsForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="teamName">
                      Team Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      placeholder="Team Name"
                      type="text"
                      name="teamName"
                      id="teamName"
                      {...register("name", {
                        required: "This field is required.",
                        minLength: {
                          value: 3,
                          message: <span>Length should be greater than 2.</span>,
                        },
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-600">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      {...register("team_lead_id", {
                        required: "This field is required.",
                      })}
                      label="Team Lead"
                      options={employeeNameData}
                      selectOption={"Team Lead"}
                    />
                    {errors.team_lead_id && (
                      <small className="text-red-600">
                        {errors.team_lead_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="teamMembers">
                      Team members
                      {/* <span className="text-red-600">*</span> */}
                    </label>
                    <Select
                      isMulti
                      options={selectMultiOptions}
                      value={selectedTeamMembers}
                      onChange={setSelectedTeamMembers}
                      className="text-black"
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
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="teamNote">
                    Note
                    {/* <span className="text-red-600">*</span> */}
                  </label>
                  <textarea
                    placeholder="Team Note"
                    rows={4}
                    name="teamNote"
                    id="teamNote"
                    {...register("teamNote")}
                  ></textarea>
                  <small>
                    {errors.teamNote && (
                      <small>{errors.teamNote.message}</small>
                    )}
                  </small>
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleEditTeamsClose}>Close</CloseBtn>
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

          {/* Delete Team Modal */}
          <ModalComp open={deleteTeamsOpen} onClose={handleDeleteTeamsClose}>
            <div className="w-full ">
              <div>Do you wand to delete ?</div>
              <div className="flex mt-8 justify-end gap-4">
                <CloseBtn
                  onClick={handleDeleteTeamsClose}
                  className={"border border-gray"}
                >
                  Close
                </CloseBtn>
                <DeleteBtn onClick={deleteTeamsData}>Delete</DeleteBtn>
              </div>
            </div>
          </ModalComp>

          {/* View Team Modal */}
          <ModalComp
            title={"Team Details"}
            open={viewTeamsOpen}
            onClose={handleViewTeamsClose}
          >
            {teamDetailsData && (
              <div className="mt-4  no-scrollbar overflow-y-scroll">
                <div className=" border    border-gray-500  rounded-[.5rem]">
                  <Grid2
                    container
                    spacing={2}
                    className="border-b px-4 py-2 border-gray-500"
                  >
                    <Grid2 size={4}>
                      <div className="font-bold">Team Name</div>
                    </Grid2>
                    <Grid2 size={8}>
                      <div>{teamDetailsData.name && teamDetailsData.name}</div>
                    </Grid2>
                  </Grid2>

                  <Grid2
                    container
                    spacing={2}
                    className="border-b px-4 py-2 border-gray-500"
                  >
                    <Grid2 size={4}>
                      <div className="font-bold">Team Lead</div>
                    </Grid2>
                    <Grid2 size={8}>
                      <div>
                        {teamDetailsData?.team_lead?.name || "-"}
                      </div>
                    </Grid2>
                  </Grid2>

                  <Grid2
                    container
                    spacing={2}
                    className="border-b px-4 py-2 border-gray-500"
                  >
                    <Grid2 size={4}>
                      <div className="font-bold">Team Members</div>
                    </Grid2>
                    <Grid2 size={8}>
                      {Array.isArray(teamDetailsData.team_members) &&
                      teamDetailsData.team_members.length > 0 ? (
                        teamDetailsData.team_members.map((teamMember, index) => (
                          <div key={index}>{teamMember.name}</div>
                        ))
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
                      <div>{teamDetailsData.note || "-"}</div>
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

export default Teams;
