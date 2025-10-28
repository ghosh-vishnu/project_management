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

const Tasks = () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    taskName: `Task ${i + 1}`,
    projectName: `Project ${i + 1}`,
    assignTo: `Member ${i + 1}`,
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

  // Create task modal
  const [createTasksOpen, setCreateTasksOpen] = useState(false);

  const handleCreateTasksOpen = () => {
    setCreateTasksOpen(true);
  };
  const handleCreateTasksClose = () => {
    setCreateTasksOpen(false);
  };

  // Edit Task Modal
  const [editTasksOpen, setEditTasksOpen] = useState(false);

  const handleEditTasksOpen = () => {
    setEditTasksOpen(true);
  };
  const handleEditTasksClose = () => {
    setEditTasksOpen(false);
  };

  // Delete Task Modal
  const [deleteTasksOpen, setDeleteTasksOpen] = useState(false);
  const handleDeleteTasksOpen = () => {
    setDeleteTasksOpen(true);
  };
  const handleDeleteTasksClose = () => {
    setDeleteTasksOpen(false);
  };

  // View Task Modal
  const [viewTasksOpen, setViewTasksOpen] = useState(false);
  const handleViewTasksOpen = () => {
    setViewTasksOpen(true);
  };
  const handleViewTasksClose = () => {
    setViewTasksOpen(false);
  };

  return (
    <div>
      <div className="">
        <div className="">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Tasks</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Tasks</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateTasksOpen}>
              <AddIcon /> Create Tasks
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
                  <TableCell>Task Name</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.taskName}</TableCell>
                      <TableCell>{row.projectName}</TableCell>
                      <TableCell>{row.assignTo}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell>{row.endDate}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={handleViewTasksOpen}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleEditTasksOpen}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={handleDeleteTasksOpen}
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

        {/* Create Task Modal */}
        <ModalComp
          open={createTasksOpen}
          onClose={handleCreateTasksClose}
          title={"Create Task"}
        >
          <form action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskName">
                    Task Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="Task Name"
                    type="text"
                    name="taskName"
                    id="taskName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskProjectName">
                    Project Name <span className="text-red-600">*</span>
                  </label>
                  <select name="taskProjectName" id="taskProjectName">
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
                  <label htmlFor="taskAssignTo">
                    Assign To <span className="text-red-600">*</span>
                  </label>
                  <select name="taskAssignTo" id="taskAssignTo">
                    <option value="">Select Member</option>
                    <option value="Member 1">Member 1</option>
                    <option value="Member 2"> Member 2</option>
                    <option value="Member 3"> Member 3</option>
                    <option value="Member 4"> Member 4</option>
                  </select>
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select name="taskPriority" id="taskPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="taskStartDate" id="taskStartDate" />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="taskEndDate" id="taskEndDate" />
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="taskDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="Task Description"
                  rows={4}
                  name="taskDescription"
                  id="taskDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateTasksClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit Task Modal */}
        <ModalComp
          title={"Edit Task"}
          open={editTasksOpen}
          onClose={handleEditTasksClose}
        >
          <form action="">
            <div className=" space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskName">
                    Task Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="Task Name"
                    type="text"
                    name="taskName"
                    id="taskName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskProjectName">
                    Project Name <span className="text-red-600">*</span>
                  </label>
                  <select name="taskProjectName" id="taskProjectName">
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
                  <label htmlFor="taskAssignTo">
                    Assign To <span className="text-red-600">*</span>
                  </label>
                  <select name="taskAssignTo" id="taskAssignTo">
                    <option value="">Select Member</option>
                    <option value="Member 1">Member 1</option>
                    <option value="Member 2"> Member 2</option>
                    <option value="Member 3"> Member 3</option>
                    <option value="Member 4"> Member 4</option>
                  </select>
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskPriority">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select name="taskPriority" id="taskPriority">
                    <option value="">Select Priority</option>
                    <option value="Highest">Highest</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Lowest">Lowest</option>
                  </select>
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="taskStartDate" id="taskStartDate" />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="taskEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input type="date" name="taskEndDate" id="taskEndDate" />
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="inputData">
                <label htmlFor="taskDescription">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="Task Description"
                  rows={4}
                  name="taskDescription"
                  id="taskDescription"
                ></textarea>
                <small></small>
              </div>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditTasksClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Delete Task Modal */}
        <ModalComp open={deleteTasksOpen} onClose={handleDeleteTasksClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteTasksClose}
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
          open={viewTasksOpen}
          onClose={handleViewTasksClose}
        >
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            <div className=" border    border-gray-500  rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Task Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>Task Name</div>
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
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Assign To</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>Assign To</div>
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

export default Tasks;
