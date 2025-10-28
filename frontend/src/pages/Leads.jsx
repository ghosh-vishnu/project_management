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
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ModalComp from "../components/Modal/ModalComp";
import { EMAIL_REGEX, PHONE_REGEX } from "../utils";
import { useForm } from "react-hook-form";
import CloseBtn from "../components/Buttons/CloseBtn";
import DeleteBtn from "../components/Buttons/DeleteBtn";
import BASE_API_URL from "../data";
import axios from "axios";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";
import { ClassNames } from "@emotion/react";
import { getToken } from "../Token";

// Select for status
const SelectOthers = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const SelectOption = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>
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

const Leads = () => {
  

  // Create lead modal
  const [createLeadsOpen, setCreateLeadsOpen] = useState(false);

  const handleCreateLeadsOpen = () => {
    reset({
      name: '',
      email: '',
      contact: '',
      lead_source: '',
      status: '',
      assign_to_id: '',
      description: '',
    });
    setCreateLeadsOpen(true);
  };
  const handleCreateLeadsClose = () => {
    setCreateLeadsOpen(false);
  };

  // Edit lead Modal
  const [editLeadsOpen, setEditLeadsOpen] = useState(false);

  const handleEditLeadsOpen = (data) => {
    if (localStorage.getItem("leadsId")) {
      localStorage.removeItem("leadsId");
    }
    localStorage.setItem("leadsId", data.id);
    reset({
      name: data.name,
      email: data.email,
      contact: data.contact,
      lead_source: data.lead_source,
      status: data.status,
      assign_to_id: data.assign_to.id,
      description: data.description,
    });
    setEditLeadsOpen(true);
  };
  const handleEditLeadsClose = () => {
    setEditLeadsOpen(false);
  };

  // Delete lead Modal
  const [deleteLeadsOpen, setDeleteLeadsOpen] = useState(false);
  const handleDeleteLeadsOpen = (data) => {
    if (localStorage.getItem("leadsId")) {
      localStorage.removeItem("leadsId");
    }
    localStorage.setItem("leadsId", data.id);
    setDeleteLeadsOpen(true);
  };
  const handleDeleteLeadsClose = () => {
    setDeleteLeadsOpen(false);
  };

  // View lead Modal
  const [viewLeadsOpen, setViewLeadsOpen] = useState(false);
  const [leadsDetailsData, setLeadsDetailsData] = useState([]);
  const handleViewLeadsOpen = (data) => {
    setLeadsDetailsData(data);
    setViewLeadsOpen(true);
  };
  const handleViewLeadsClose = () => {
    setViewLeadsOpen(false);
  };

  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Employee data variable
  const [leadsData, setLeadsData] = useState([]);

  // To fetch the leads data list
  const getLeadsData = async (page, rowsPerPage) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/peoples/leads/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: page + 1,
            page_size: rowsPerPage,
          },
        });
        if (response.status == 200) {
          setLeadsData(response.data.results);
          setCount(response.data.count);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    getLeadsData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Employee Name Data
  const [employeeNameData, setEmployeeNameData] = useState();
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
    } catch (error) {}
  };

  // const [clientNameData, setClientNameData] = useState();
  // const getClientNameData = async () => {
  //   try {
  //     const accessToken = getToken("accessToken");
  //     const response = await axios.get(`${BASE_API_URL}/clients-name/`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     setClientNameData(response.data);
  //   } catch (error) { }
  // };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Post / Create Api call
  const createLeadsForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/peoples/leads/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Leads created successfully.");
        getLeadsData(page, rowsPerPage);
        handleCreateLeadsClose();
        reset();
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Leads doesn't created.");
    }
  };

  // Update/ Edit api call
  const editLeadsForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const leadsId = localStorage.getItem("leadsId");
      if (accessToken && leadsId) {
        const response = await axios.put(
          `${BASE_API_URL}/peoples/leads/${leadsId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log(response);
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Leads edited successfully.");
          getLeadsData(page, rowsPerPage);
          handleEditLeadsClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Leads doesn't edited.");
    }
  };

  // Use Effect
  useEffect(() => {
    getEmployeeNameData();

    // getClientNameData();
  }, []);

  // Delete api call
  const deleteLeadsData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const leadsId = localStorage.getItem("leadsId");
      if (accessToken && leadsId) {
        const response = await axios.delete(
          `${BASE_API_URL}/peoples/leads/${leadsId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Leads Deleted successfully.");
          getLeadsData(page, rowsPerPage);
          handleDeleteLeadsClose();
        }
      }
    } catch (error) {
      // console.log(error.response)
      setShowError(true);
      setShowMessage("Leads doesn't deleted.");
    }
  };

  return (
    <div>
      <div>
        {/* Show alerts */}
        <ErrorAlert
          show={showError}
          message={showMessage}
          onClose={() => setShowError(false)}
        />
        <SuccessAlert
          message={showMessage}
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
        <div className="">
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>
            <Typography sx={{ color: "text.primary" }}>Leads</Typography>
          </Breadcrumbs>
        </div>
        {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Leads</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateLeadsOpen}>
              <AddIcon /> Create Leads
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact no.</TableCell>
                  <TableCell>Lead source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assign To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {leadsData &&
                  leadsData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.contact}</TableCell>
                      <TableCell>{row.lead_source}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.assign_to?.name}</TableCell>
                      {/* <TableCell>{row.assign_to ? row.assign_to.name : 'N/A'}</TableCell> */}

                      <TableCell>
                        <IconButton
                          onClick={() => handleViewLeadsOpen(row)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditLeadsOpen(row)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteLeadsOpen(row)}
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

        {/* Create Lead Modal */}
        {createLeadsOpen && (
          <ModalComp
            open={createLeadsOpen}
            onClose={handleCreateLeadsClose}
            title={"Create Lead"}
          >
            <form onSubmit={handleSubmit(createLeadsForm)} action="">
              <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadName">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      placeholder="Lead Name"
                      type="text"
                      id="leadName"
                      {...register("name", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-600">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="LeadEmail">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Lead Email"
                      id="leadEmail"
                      {...register("email", {
                        required: "This field is required.",
                        pattern: {
                          value: EMAIL_REGEX,
                          message: "Email is not valid.",
                        },
                      })}
                    />
                    {errors.email && (
                      <small className="text-red-600">
                        {errors.email.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadContact">
                      Contact No. <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Lead Contact No."
                      id="leadContact"
                      {...register("contact", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.contact && (
                      <small className="text-red-600">
                        {errors.contact.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadSource">
                      Lead Source <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Lead Source"
                      id="leadSource"
                      {...register("lead_source", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.lead_source && (
                      <small className="text-red-600">
                        {errors.lead_source.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOthers
                      label={"Status"}
                      options={["New", "Discussion", "Won", "Lost"]}
                      selectOption={"Status"}
                      {...register("status", {
                        required: {
                          value: true,
                          message: <span>This field is required.</span>,
                        },
                      })}
                    />
                    {errors.status && (
                      <small className="text-red-600">
                        {errors.status.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      label={"Assign To"}
                      options={employeeNameData}
                      {...register("assign_to_id", {
                        required: {
                          value: true,
                          message: <span>This field is required.</span>,
                        },
                      })}
                    />

                    {errors.assign_to_id && (
                      <small className="text-red-600">
                        {errors.assign_to_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="leadDescription">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Lead Description"
                    rows={4}
                    id="leadDescription"
                    {...register("description", {
                      required: "This field is required.",
                    })}
                  ></textarea>
                  {errors.description && (
                    <small className="text-red-600">
                      {errors.description.message}
                    </small>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleCreateLeadsClose}>Close</CloseBtn>

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
        )}

        {/* Edit Lead Modal */}
        <ModalComp
          title={"Edit Lead"}
          open={editLeadsOpen}
          onClose={handleEditLeadsClose}
        >
          <form onSubmit={handleSubmit(editLeadsForm)} action="">
          <div className="mt-4 space-y-2">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadName">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      placeholder="Lead Name"
                      type="text"
                      id="leadName"
                      {...register("name", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.name && (
                      <small className="text-red-600">
                        {errors.name.message}
                      </small>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="LeadEmail">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Lead Email"
                      id="leadEmail"
                      {...register("email", {
                        required: "This field is required.",
                        pattern: {
                          value: EMAIL_REGEX,
                          message: "Email is not valid.",
                        },
                      })}
                    />
                    {errors.email && (
                      <small className="text-red-600">
                        {errors.email.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadContact">
                      Contact No. <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Lead Contact No."
                      id="leadContact"
                      {...register("contact", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.contact && (
                      <small className="text-red-600">
                        {errors.contact.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <label htmlFor="leadSource">
                      Lead Source <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Lead Source"
                      id="leadSource"
                      {...register("lead_source", {
                        required: "This field is required.",
                      })}
                    />
                    {errors.lead_source && (
                      <small className="text-red-600">
                        {errors.lead_source.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOthers
                      label={"Status"}
                      options={["New", "Discussion", "Won", "Lost"]}
                      selectOption={"Status"}
                      {...register("status", {
                        required: {
                          value: true,
                          message: <span>This field is required.</span>,
                        },
                      })}
                    />
                    {errors.status && (
                      <small className="text-red-600">
                        {errors.status.message}
                      </small>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                    <SelectOption
                      label={"Assign To"}
                      options={employeeNameData}
                      {...register("assign_to_id", {
                        required: {
                          value: true,
                          message: <span>This field is required.</span>,
                        },
                      })}
                    />

                    {errors.assign_to_id && (
                      <small className="text-red-600">
                        {errors.assign_to_id.message}
                      </small>
                    )}
                  </Grid2>
                </Grid2>

                <div className="inputData">
                  <label htmlFor="leadDescription">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Lead Description"
                    rows={4}
                    id="leadDescription"
                    {...register("description", {
                      required: "This field is required.",
                    })}
                  ></textarea>
                  {errors.description && (
                    <small className="text-red-600">
                      {errors.description.message}
                    </small>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap justify-end">
                  <CloseBtn onClick={handleEditLeadsClose}>Close</CloseBtn>

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

        {/* Delete Lead Modal */}
        <ModalComp open={deleteLeadsOpen} onClose={handleDeleteLeadsClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteLeadsClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteLeadsData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View lead Modal */}
        <ModalComp
          title={"Lead Details"}
          open={viewLeadsOpen}
          onClose={handleViewLeadsClose}
        >
          {leadsDetailsData && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>{leadsDetailsData.name && leadsDetailsData.name}</div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Email</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {leadsDetailsData.email && leadsDetailsData.email}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Contact No.</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {leadsDetailsData.contact && leadsDetailsData.contact}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500  px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Lead Source</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {leadsDetailsData.lead_source &&
                        leadsDetailsData.lead_source}
                    </div>
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
                    <div>
                      {leadsDetailsData.status && leadsDetailsData.status}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Assign To</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {leadsDetailsData.assign_to &&
                        leadsDetailsData.assign_to.name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2 container columnSpacing={2} className=" px-4 py-2">
                  <Grid2 size={4}>
                    <div className="font-bold">Description</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {leadsDetailsData.description &&
                        leadsDetailsData.description}
                    </div>
                  </Grid2>
                </Grid2>
              </div>
            </div>
          )}
        </ModalComp>
      </div>
    </div>
  );
};

export default Leads;
