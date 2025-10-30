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
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import CloseBtn from "../../components/Buttons/CloseBtn";
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteBtn from "../../components/Buttons/DeleteBtn";
import ModalComp from "../../components/Modal/ModalComp";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";

const AllProposals = () => {
  // Backend data
  const [proposalsData, setProposalsData] = useState([]);
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

  // Fetch proposals
  const getProposalsData = async (page, rowsPerPage) => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      const response = await axios.get(`${BASE_API_URL}/proposals/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page: page + 1, page_size: rowsPerPage },
      });
      if (response && response.status === 200) {
        setProposalsData(Array.isArray(response.data?.results) ? response.data.results : []);
        setCount(typeof response.data?.count === 'number' ? response.data.count : 0);
      } else {
        setProposalsData([]);
        setCount(0);
      }
    } catch (err) {
      setProposalsData([]);
      setCount(0);
    }
  };

  useEffect(() => {
    getProposalsData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Alerts
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create submit using plain form handler (prevents page refresh)
  const handleCreateSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      const form = e.target;
      const payload = {
        proposal_title: form.contractName?.value || "",
        client_lead: form.contractClientName?.value || "",
        proposal_date: form.contractStartDate?.value || "",
        valid_until: form.contractEndDate?.value || "",
        proposal_value: form.contractBudget?.value?.toString() || "",
        description: form.contractDescription?.value || "",
        status: form.proposalStatus?.value || "Pending",
      };

      // Validate minimal required fields client-side
      if (!payload.proposal_title || !payload.client_lead || !payload.proposal_date || !payload.valid_until || !payload.proposal_value) {
        setShowError(true);
        setShowMessage("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }

      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowError(true);
        setShowMessage("Not authenticated.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(`${BASE_API_URL}/proposals/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response && response.status === 201) {
        setShowSuccess(true);
        setShowMessage("Proposal created successfully.");
        setCreatecontractsOpen(false);
        // Reset form fields
        form.reset();
        getProposalsData(page, rowsPerPage);
      } else {
        setShowError(true);
        setShowMessage("Failed to create proposal.");
      }
    } catch (err) {
      const apiMsg = err?.response?.data && typeof err.response.data === 'object'
        ? JSON.stringify(err.response.data)
        : (err?.message || 'Request failed');
      setShowError(true);
      setShowMessage(apiMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create contract modal
  const [createcontractsOpen, setCreatecontractsOpen] = useState(false);

  const handleCreatecontractsOpen = () => {
    setCreatecontractsOpen(true);
  };
  const handleCreatecontractsClose = () => {
    setCreatecontractsOpen(false);
  };

  // Edit contract Modal
  const [editcontractsOpen, setEditcontractsOpen] = useState(false);

  const handleEditcontractsOpen = () => {
    setEditcontractsOpen(true);
  };
  const handleEditcontractsClose = () => {
    setEditcontractsOpen(false);
  };

  // Delete contract Modal
  const [deletecontractsOpen, setDeletecontractsOpen] = useState(false);
  const handleDeletecontractsOpen = () => {
    setDeletecontractsOpen(true);
  };
  const handleDeletecontractsClose = () => {
    setDeletecontractsOpen(false);
  };

  // View contract Modal
  const [viewcontractsOpen, setViewcontractsOpen] = useState(false);
  const [proposalDetails, setProposalDetails] = useState(null);
  const handleViewcontractsOpen = (row) => {
    setProposalDetails(row || null);
    setViewcontractsOpen(true);
  };
  const handleViewcontractsClose = () => {
    setViewcontractsOpen(false);
  };

  return (
    <div>
      <div className="">
        <div className="">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Proposals</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Proposals</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreatecontractsOpen}>
              <AddIcon /> Create Proposals
            </PrimaryBtn>
          </div>
        </div>

        {/* Alerts */}
        <ErrorAlert show={showError} message={showMessage} onClose={() => setShowError(false)} />
        <SuccessAlert show={showSuccess} message={showMessage} onClose={() => setShowSuccess(false)} />

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
                  <TableCell>Proposal Value</TableCell>
                  <TableCell>Client Lead</TableCell>
                  <TableCell>Proposal Date</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Proposal Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposalsData && proposalsData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.proposal_value}</TableCell>
                      <TableCell>{row.client_lead}</TableCell>
                      <TableCell>{row.proposal_date}</TableCell>
                      <TableCell>{row.valid_until}</TableCell>
                      <TableCell>{row.proposal_title}</TableCell>
                      <TableCell>{row.status}</TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleViewcontractsOpen(row)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleEditcontractsOpen}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={handleDeletecontractsOpen}
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

        {/* Create contract Modal */}
        <ModalComp
          open={createcontractsOpen}
          onClose={handleCreatecontractsClose}
          title={"Create Contract"}
        >
          <form onSubmit={handleCreateSubmit}>
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractName">
                    Proposal Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="Contract Name"
                    type="text"
                    name="contractName"
                    id="contractName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractClientName">
                    Client Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contract Email"
                    name="contractClientName"
                    id="contractClientName"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    placeholder="Start Date"
                    name="contractStartDate"
                    id="contractStartDate"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    placeholder="End Date"
                    name="contractEndDate"
                    id="contractEndDate"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="proposalStatus">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select name="proposalStatus" id="proposalStatus" defaultValue={'Pending'}>
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractBudget">
                    Budget <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contract Budget"
                    name="contractBudget"
                    id="contractBudget"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12 }} className="inputData">
                  <label htmlFor="contractDescription">Description</label>
                  <textarea
                    rows={4}
                    name="contractDescription"
                    id="contractDescription"
                    placeholder="Contract Description"
                  ></textarea>
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreatecontractsClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"} disabled={isSubmitting} className={`${isSubmitting ? " cursor-wait" : ""}`}>{isSubmitting ? "Submitting" : "Submit"}</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit contract Modal */}
        <ModalComp
          title={"Edit contract"}
          open={editcontractsOpen}
          onClose={handleEditcontractsClose}
        >
          <form action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractName">
                    Proposal Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="Contract Name"
                    type="text"
                    name="contractName"
                    id="contractName"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractClientName">
                    Client Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contract Email"
                    name="contractClientName"
                    id="contractClientName"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    placeholder="Start Date"
                    name="contractStartDate"
                    id="contractStartDate"
                  />
                  <small></small>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    placeholder="End Date"
                    name="contractEndDate"
                    id="contractEndDate"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractStatus">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select name="contractStatus" id="contractStatus">
                    <option value="">Select Status</option>
                    <option value="Pendig">Pendig</option>
                    <option value="Pendig">Active</option>
                    <option value="Pendig">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractBudget">
                    Budget <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contract Budget"
                    name="contractBudget"
                    id="contractBudget"
                  />
                  <small></small>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12 }} className="inputData">
                  <label htmlFor="contractDescription">Description</label>
                  <textarea
                    rows={4}
                    name="contractDescription"
                    id="contractDescription"
                    placeholder="Contract Description"
                  ></textarea>
                  <small></small>
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditcontractsClose}>Close</CloseBtn>
                <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Delete contract Modal */}
        <ModalComp
          open={deletecontractsOpen}
          onClose={handleDeletecontractsClose}
        >
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeletecontractsClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View contract Modal */}
        <ModalComp
          title={"contract Details"}
          open={viewcontractsOpen}
          onClose={handleViewcontractsClose}
        >
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            <div className=" border    border-gray-500  rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Proposal Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.proposal_title || '-'}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Client Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.client_lead || '-'}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Start Date</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.proposal_date || '-'}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b border-gray-500  px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">End Date</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.valid_until || '-'}</div>
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
                  <div>{proposalDetails?.status || '-'}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b border-gray-500 px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Budget</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.proposal_value || '-'}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                columnSpacing={2}
                className=" px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Description</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalDetails?.description || '-'}</div>
                </Grid2>
              </Grid2>

             
            </div>
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default AllProposals;
