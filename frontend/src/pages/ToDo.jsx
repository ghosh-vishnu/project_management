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

const ToDo = () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    todoName: `ToDo ${i + 1}`,
    projectName: `Project ${i + 1}`,
    priority: `High`,
    status: `In progress`,
    startDate: `Date ${i + 1}`,
    endDate: `End Date ${i + 1}`,
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

  // Create ToDo modal
  const [createToDoOpen, setCreateToDoOpen] = useState(false);

  const handleCreateToDoOpen = () => {
    setCreateToDoOpen(true);
  };
  const handleCreateToDoClose = () => {
    setCreateToDoOpen(false);
  };

  // Edit ToDo Modal
  const [editToDoOpen, setEditToDoOpen] = useState(false);

  const handleEditToDoOpen = () => {
    setEditToDoOpen(true);
  };
  const handleEditToDoClose = () => {
    setEditToDoOpen(false);
  };

  // Delete ToDo Modal
  const [deleteToDoOpen, setDeleteToDoOpen] = useState(false);
  const handleDeleteToDoOpen = () => {
    setDeleteToDoOpen(true);
  };
  const handleDeleteToDoClose = () => {
    setDeleteToDoOpen(false);
  };

  // View ToDo Modal
  const [viewToDoOpen, setViewToDoOpen] = useState(false);
  const handleViewToDoOpen = () => {
    setViewToDoOpen(true);
  };
  const handleViewToDoClose = () => {
    setViewToDoOpen(false);
  };

  return (
    <div>
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
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.todoName}</TableCell>
                      <TableCell>{row.projectName}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell>{row.endDate}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={handleViewToDoOpen}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleEditToDoOpen}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={handleDeleteToDoOpen}
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

        {/* Create ToDo Modal */}
        <ModalComp
          open={createToDoOpen}
          onClose={handleCreateToDoClose}
          title={"Create ToDo"}
        >
          <form action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoName">
                    ToDo Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="ToDo Name"
                    type="text"
                    name="ToDoName"
                    id="ToDoName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoProjectName">
                    Project Name <span className="text-red-600">*</span>
                  </label>
                  <select name="ToDoProjectName" id="ToDoProjectName">
                    <option value="">Select Project</option>
                    <option value="Project 1">Project 1</option>
                    <option value="Project 2"> Project 2</option>
                    <option value="Project 3"> Project 3</option>
                    <option value="Project 4"> Project 4</option>
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>

             
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select name="ToDoPriority" id="ToDoPriority">
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                
                  </select>
                  <small></small>
                </Grid2>
              



               <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                              <label htmlFor="projectStatus">Project Status</label>
                              <select required name="projectStatus" id="projectStatus">
                                <option value="">Select Status</option>
                                <option value="Not Started">Not Started</option>
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Paused">Paused</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <small></small>
                            </Grid2>

                            </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="ToDotartDate" id="ToDoStartDate" />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="ToDoEndDate" id="ToDoEndDate" />
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="ToDoDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="ToDo Description"
                  rows={4}
                  name="ToDoDescription"
                  id="ToDoDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateToDoClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
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
          <form action="">
            <div className=" space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoName">
                    ToDo Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="ToDo Name"
                    type="text"
                    name="ToDokName"
                    id="ToDoName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoProjectName">
                    Project Name <span className="text-red-600">*</span>
                  </label>
                  <select name="ToDoProjectName" id="ToDoProjectName">
                    <option value="">Select Project</option>
                    <option value="Project 1">Project 1</option>
                    <option value="Project 2"> Project 2</option>
                    <option value="Project 3"> Project 3</option>
                    <option value="Project 4"> Project 4</option>
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>
            <Grid2 container spacing={2}>
              
             <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select name="ToDoPriority" id="ToDoPriority">
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                
                  </select>
                  <small></small>
                </Grid2>
              


               <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                              <label htmlFor="projectStatus">Project Status</label>
                              <select required name="projectStatus" id="projectStatus">
                                <option value="">Select Status</option>
                                <option value="Not Started">Not Started</option>
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Paused">Paused</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <small></small>
                            </Grid2>
                            </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="ToDoStartDate" id="ToDoStartDate" />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="ToDoEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="ToDoEndDate" id="ToDoEndDate" />
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="ToDoDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="ToDo Description"
                  rows={4}
                  name="ToDoDescription"
                  id="TOdoDescription"
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

        {/* Delete TODo Modal */}
        <ModalComp open={deleteToDoOpen} onClose={handleDeleteToDoClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteToDoClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View Task Modal */}
        <ModalComp
          title={"Task Details"}
          open={viewToDoOpen}
          onClose={handleViewToDoClose}
        >
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
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
                  <div>ToDo Name</div>
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
                  <div>Project Name</div>
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
                  <div>High</div>
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
                  <div>Todo</div>
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
                  <div>10-04-2025</div>
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
                  <div>10-05-2025</div>
                </Grid2>
              </Grid2>
              <Grid2 container columnSpacing={2} className=" px-4 py-2">
                <Grid2 size={4}>
                  <div className="font-bold">Description</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex
                    sed ab adipisci aut, sapiente magnam harum a consequatur
                    suscipit repudiandae commodi labore ipsam veritatis dolorem
                    quis maxime. Libero dolore corporis esse deleniti recusandae
                    sit laborum asperiores explicabo magnam eius officiis
                    voluptate impedit, delectus, sunt maiores. Fuga praesentium
                    nihil aperiam ut nam consequatur? Nobis soluta molestiae
                    repudiandae commodi, labore, iste error voluptas excepturi
                    unde similique dicta facilis aliquid qui a debitis odio
                    totam saepe eum est perspiciatis consequatur. Quisquam a
                    earum, cupiditate mollitia totam quas nobis similique hic
                    dolorem voluptatem nemo, harum, facere molestias accusantium
                    laboriosam in ducimus optio tenetur maxime!
                  </div>
                </Grid2>
              </Grid2>
            </div>
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default ToDo;
