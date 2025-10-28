import React, { useState } from "react";

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

const Meetings = () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    MeetingName: `Meeting name ${i + 1}`,
    MeetingLead: `Meeting  lead ${i + 1}`,
  }));

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

  // Create Meeting modal
  const [createMeetingsOpen, setCreateMeetingsOpen] = useState(false);

  const handleCreateMeetingsOpen = () => {
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
  const handleDeleteMeetingsOpen = () => {
    setDeleteMeetingsOpen(true);
  };
  const handleDeleteMeetingsClose = () => {
    setDeleteMeetingsOpen(false);
  };

  // View Meeting Modal
  const [viewMeetingsOpen, setViewMeetingsOpen] = useState(false);
  const handleViewMeetingsOpen = () => {
    setViewMeetingsOpen(true);
  };
  const handleViewMeetingsClose = () => {
    setViewMeetingsOpen(false);
  };

  // Meeting member's options
  const MeetingMembers = [
    { value: "Employee 1", label: "Employee 1" },
    { value: "Employee 2", label: "Employee 2" },
    { value: "Employee 3", label: "Employee 3" },
    { value: "Employee 4", label: "Employee 4" },
  ];
  const [selectedMeetingMembers, setSelectedMeetingMembers] = useState([]);
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
                  {data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.MeetingName}</TableCell>
                        <TableCell>{row.MeetingLead}</TableCell>
                        <TableCell>
                          <a href="" target="_blank" className="px-4 py-2 rounded-[5px] bg-gray-200 cursor-pointer ">Join</a>
                        </TableCell>
                        <TableCell>{row.MeetingLead}</TableCell>
                        <TableCell>{row.MeetingLead}</TableCell>
                        <TableCell>{row.MeetingLead}</TableCell>

                        <TableCell>
                          <IconButton
                            onClick={handleViewMeetingsOpen}
                            aria-label="edit"
                            color="success"
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>
                          <IconButton
                            onClick={handleEditMeetingsOpen}
                            aria-label="edit"
                            color="warning"
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            onClick={handleDeleteMeetingsOpen}
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
                count={data.length}
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
            <form action="">
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
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingLead">
                      Meeting Lead<span className="text-red-600">*</span>
                    </label>
                    <select name="MeetingLead" id="MeetingLead">
                      <option value="">Select Meeting Lead</option>
                      <option value="Meeting Lead 1">Meeting Lead 1</option>
                      <option value="Meeting Lead 2"> Meeting Lead 2</option>
                      <option value="Meeting Lead 3"> Meeting Lead 3</option>
                      <option value="Meeting Lead 4"> Meeting Lead 4</option>
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="MeetingMembers">
                      Meeting members <span className="text-red-600">*</span>
                    </label>
                    <Select
                      isMulti
                      options={MeetingMembers}
                      value={selectedMeetingMembers}
                      onChange={setSelectedMeetingMembers}
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
                    <small></small>
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
            <form action="">
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
                    />
                    <small></small>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="MeetingLead">
                      Meeting Lead<span className="text-red-600">*</span>
                    </label>
                    <select name="MeetingLead" id="MeetingLead">
                      <option value="">Select Meeting Lead</option>
                      <option value="Meeting Lead 1">Meeting Lead 1</option>
                      <option value="Meeting Lead 2"> Meeting Lead 2</option>
                      <option value="Meeting Lead 3"> Meeting Lead 3</option>
                      <option value="Meeting Lead 4"> Meeting Lead 4</option>
                    </select>
                    <small></small>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={12} className="inputData">
                    <label htmlFor="MeetingMembers">
                      Meeting members <span className="text-red-600">*</span>
                    </label>
                    <Select
                      isMulti
                      options={MeetingMembers}
                      value={selectedMeetingMembers}
                      onChange={setSelectedMeetingMembers}
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
                    <small></small>
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
                <DeleteBtn>Delete</DeleteBtn>
              </div>
            </div>
          </ModalComp>

          {/* View Meeting Modal */}
          <ModalComp
            title={"Meeting Details"}
            open={viewMeetingsOpen}
            onClose={handleViewMeetingsClose}
          >
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
                    <div>Meeting Name</div>
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
                    <div>Meeting Lead Name</div>
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
                    <div>Member 1</div>
                    <div>Member 2</div>
                    <div>Member 3</div>
                    <div>Member 4</div>
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2} className="  px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Notes</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Nulla, aperiam?
                    </div>
                  </Grid2>
                </Grid2>
              </div>
            </div>
          </ModalComp>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
