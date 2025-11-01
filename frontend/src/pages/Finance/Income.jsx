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
  Modal,
  Box,
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
import BASE_API_URL from "../../data";
import { useForm } from "react-hook-form";

import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../utils";
import axios from "axios";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import { getToken } from "../../Token";

// Select for status
const SelectProject = React.forwardRef(
  ({ selectOption, onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Project Name {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
    </>
  )
);

const SelectPaymentMode = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
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

const SelectClientName = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  )
);
const SelectBankAccount = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options && options.length > 0 ? (
          options.map((option, index) => (
            <option key={option.id || index} value={option.id}>
              {option.account_holder_name || option.name || 'N/A'}
            </option>
          ))
        ) : (
          <option value="" disabled>No bank accounts available</option>
        )}
      </select>
    </>
  )
);
const Income = () => {

  // pagination variables
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle page change
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Create income modal
  const [createIncomeOpen, setCreateIncomeOpen] = useState(false);

  const handleCreateIncomeOpen = () => {
    setCreateIncomeOpen(true);
  };
  const handleCreateIncomeClose = () => {
    setCreateIncomeOpen(false);
  };

  // Delete Income Modal
  const [deleteIncomeOpen, setDeleteIncomeOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const handleDeleteIncomeOpen = (data) => {
    setSelectedIncome(data);
    if (localStorage.getItem("incomeId")) {
      localStorage.removeItem("incomeId");
    }
    localStorage.setItem("incomeId", data.id);
    setDeleteIncomeOpen(true);
  };
  const handleDeleteIncomeClose = () => {
    setDeleteIncomeOpen(false);
    setSelectedIncome(null);
  };

  // Employee data variable
  const [incomeData, setIncomeData] = useState([]);

  // Edit Income Modal
  const [editIncomeOpen, setEditIncomeOpen] = useState(false);

  const handleEditIncomeOpen = (data) => {
    // console.log(data)
    if (localStorage.getItem("incomeId")) {
      localStorage.removeItem("incomeId");
    }
    localStorage.setItem("incomeId", data.id);
    reset({
      client_name_id: data.client_name?.id,
      project_name_id: data.project_name?.id,
      amount: data.amount,
      payment_mode: data.payment_mode,
      payment_id: data.payment_id,
      income_date: data.income_date,
      bank_account_id: data.bank_account?.id,
    });
    setEditIncomeOpen(true);
  };
  const handleEditIncomeClose = () => {
    setEditIncomeOpen(false);
  };

  //view modal
  const [viewIncomeOpen, setViewIncomeOpen] = useState(false);

  // Employee details vars
  const [incomeDetailsData, setIncomeDetailsData] = useState({});
  // get income;s detail dat
  const handleViewIncomeOpen = async (data) => {
    setViewIncomeOpen(true);
    setIncomeDetailsData(data);
  };
  const handleViewIncomeClose = () => {
    setViewIncomeOpen(false);
  };

  // To fetch the income data list
  const getIncomeData = async (pageNumber, pageSize) => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(`${BASE_API_URL}/finances/incomes/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: pageNumber + 1,
            page_size: pageSize,
          },
        });
        if (response.status === 200) {
          setIncomeData(response.data.results || []);
          setCount(response.data.count || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setShowError(true);
      setShowMessage("Failed to fetch income data.");
      setIncomeData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIncomeData(page, rowsPerPage);
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

  // Project Name data
  const [projectNameData, setProjectNameData] = useState();
  const getProjectNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/projects-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProjectNameData(response.data);
      // console.log(response.data)
    } catch (error) {}
  };
  // get client name data
  const [clientNameData, setClientNameData] = useState();
  const getClientNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(
        `${BASE_API_URL}/peoples/clients-name/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setClientNameData(response.data);
    } catch (error) {}
  };

  // get bankaccount name data
  const [BankaccountNameData, setBankaccountNameData] = useState([]);
  const getBankaccountNameData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found for bank accounts");
        return;
      }
      const response = await axios.get(
        `${BASE_API_URL}/finances/bank-accounts-name/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setBankaccountNameData(response.data || []);
    } catch (error) {
      console.error("Error fetching bank account names:", error);
      setBankaccountNameData([]);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Post API Call
  const createIncomeForm = async (data) => {
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowError(true);
        setShowMessage("Authentication required. Please login again.");
        setSubmitting(false);
        return;
      }
      
      const response = await axios.post(
        `${BASE_API_URL}/finances/incomes/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        setShowSuccess(true);
        setShowMessage("Income created successfully.");
        setPage(0); // Go back to first page to see new income
        getIncomeData(0, rowsPerPage);
        reset();
        handleCreateIncomeClose();
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(true);
        setShowMessage("Income doesn't created.");
      }
    } catch (error) {
      if (error.response) {
        const data = error.response?.data;

        // single string error
        if (data.detail) {
          setShowMessage(data.detail);
        }
        // single error message
        else if (data.error) {
          setShowMessage(data.error);
        }
        // serializer field errors (dict of arrays)
        else if (typeof data === "object") {
          let messages = [];

          for (const field in data) {
            if (Array.isArray(data[field])) {
              messages.push(`${data[field][0]}`);
            }
          }
          setShowMessage(messages.join(', '));
        } else {
          setShowMessage("Something went wrong. Please try again.");
        }
      } else {
        setShowMessage("Failed to create income. Please try again.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Update api call
  const editIncomeForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const incomeId = localStorage.getItem("incomeId");
      if (accessToken && incomeId) {
        const response = await axios.put(
          `${BASE_API_URL}/finances/incomes/${incomeId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 200) {
          getIncomeData(page, rowsPerPage);
          setShowSuccess(true);
          setShowMessage("Income edited successfully.");
          handleEditIncomeClose();
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    } catch (error) {
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

  // Use Effect
  useEffect(() => {
    getEmployeeNameData();
    getProjectNameData();
    getClientNameData();
    getBankaccountNameData();
  }, []);

  // Delete api call
  const deleteIncomeData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const incomeId = localStorage.getItem("incomeId");
      if (accessToken && incomeId) {
        const response = await axios.delete(
          `${BASE_API_URL}/finances/incomes/${incomeId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 204) {
          getIncomeData(page, rowsPerPage);
          setShowSuccess(true);
          setShowMessage("Income deleted successfully.");
          handleDeleteIncomeClose();
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage(error.response?.data?.error || error.response?.data?.detail || "Failed to delete income.");
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
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

            <Typography sx={{ color: "text.primary" }}>Income</Typography>
          </Breadcrumbs>
        </div>

        {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Income</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateIncomeOpen}>
              <AddIcon /> Create Income
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
                  <TableCell>Client Name</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment mode</TableCell>
                  <TableCell>Income Date</TableCell>
                  <TableCell>Bank account</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !incomeData || incomeData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No income records found
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.client_name?.name || "N/A"}</TableCell>
                      <TableCell>{data.project_name?.title || "N/A"}</TableCell>
                      <TableCell>{data.amount || "N/A"}</TableCell>
                      <TableCell>{data.payment_mode || "N/A"}</TableCell>
                      <TableCell>{data.income_date || "N/A"}</TableCell>
                      <TableCell>
                        {data.bank_account?.account_holder_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewIncomeOpen(data)}
                          aria-label="view"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditIncomeOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteIncomeOpen(data)}
                          aria-label="delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

        {/* Create Income Modal */}
        <ModalComp
          open={createIncomeOpen}
          onClose={handleCreateIncomeClose}
          title={"Create Income"}
        >
          <form onSubmit={handleSubmit(createIncomeForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectClientName
                    {...register("client_name_id", {
                      required: "This field is required.",
                    })}
                    label="Client Name"
                    options={clientNameData}
                    selectOption={"Client Name"}
                  />

                  {errors.client_name_id && (
                    <small className="text-red-600">
                      {errors.client_name_id.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectProject
                    {...register("project_name_id", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                    label="Project Name"
                    options={projectNameData}
                  />
                  {errors.project_name_id && (
                    <small className="text-red-600">
                      {errors.project_name_id.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="incomeAmount">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Amount"
                    type="number"
                    name="amount"
                    id="amount"
                    {...register("amount", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />

                  {errors.amount && (
                    <small className="text-red-600">
                      {errors.amount.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectPaymentMode
                    {...register("payment_mode", {
                      required: "This field is required.",
                    })}
                    label="Payment mode"
                    options={[
                      "upi",
                      "Credit Card",
                      "Debit Card",
                      "Cash",
                      "Others",
                    ]}
                    selectOption={"Payment Mode"}
                  />
                  {errors.payment_mode && (
                    <small className="text-red-600">
                      {errors.payment_mode.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="paymentId">
                    Payment Id <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Payment Id"
                    name="paymentId"
                    id="paymentId"
                    {...register("payment_id", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.payment_id && (
                    <small className="text-red-600">
                      {errors.payment_id.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="income_date">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    placeholder="Date"
                    name="incomedate"
                    id="incomedate"
                    {...register("income_date", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.income_date && (
                    <small className="text-red-600">
                      {errors.income_date.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                  {...register("bank_account_id", {
                    required: "This field is required.",
                  })}
                  label="Bank Account Name"
                  options={BankaccountNameData}
                  selectOption={"Bank Account Name"}
                />

                {errors.bank_account_id && (
                  <small className="text-red-600">
                    {errors.bank_account_id.message}
                  </small>
                )}
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateIncomeClose} disabled={submitting}>Close</CloseBtn>
                <PrimaryBtn
                  type={"Submit"}
                  disabled={submitting || isSubmitting}
                  className={`${(submitting || isSubmitting) ? " cursor-wait  " : ""}`}
                >
                  {(submitting || isSubmitting) ? "Submitting..." : "Submit"}
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </ModalComp>

        {/* Edit Income Modal */}
        <ModalComp
          open={editIncomeOpen}
          onClose={handleEditIncomeClose}
          title={"Edit Income"}
        >
          <form onSubmit={handleSubmit(editIncomeForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectClientName
                    {...register("client_name_id", {
                      required: "This field is required.",
                    })}
                    label="Client Name"
                    options={clientNameData}
                    selectOption={"Client Name"}
                  />

                  {errors.client_name_id && (
                    <small className="text-red-600">
                      {errors.client_name_id.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectProject
                    {...register("project_name_id", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                    label="Project Name"
                    options={projectNameData}
                  />
                  {errors.project_name_id && (
                    <small className="text-red-600">
                      {errors.project_name_id.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="incomeAmount">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    placeholder="Amount"
                    type="number"
                    name="amount"
                    id="amount"
                    {...register("amount", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />

                  {errors.amount && (
                    <small className="text-red-600">
                      {errors.amount.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectPaymentMode
                    {...register("payment_mode", {
                      required: "This field is required.",
                    })}
                    label="Payment mode"
                    options={[
                      "upi",
                      "Credit Card",
                      "Debit Card",
                      "Cash",
                      "Others",
                    ]}
                    selectOption={"Payment Mode"}
                  />
                  {errors.payment_mode && (
                    <small className="text-red-600">
                      {errors.payment_mode.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="paymentId">
                    Payment Id <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Payment Id"
                    name="paymentId"
                    id="paymentId"
                    {...register("payment_id", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.payment_id && (
                    <small className="text-red-600">
                      {errors.payment_id.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="income_date">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    placeholder="Date"
                    name="incomedate"
                    id="incomedate"
                    {...register("income_date", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.income_date && (
                    <small className="text-red-600">
                      {errors.income_date.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                  {...register("bank_account_id", {
                    required: "This field is required.",
                  })}
                  label="Bank Account Name"
                  options={BankaccountNameData}
                  selectOption={"Bank Account Name"}
                />

                {errors.bank_account_id && (
                  <small className="text-red-600">
                    {errors.bank_account_id.message}
                  </small>
                )}
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditIncomeClose}>Close</CloseBtn>
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

        {/* Delete Income Modal */}
        <ModalComp open={deleteIncomeOpen} onClose={handleDeleteIncomeClose}>
          <div className="w-full ">
            <div>Do you want to delete this income record?</div>
            {selectedIncome && (
              <div className="mt-2 text-gray-600">
                Income: <strong>₹{selectedIncome.amount} - {selectedIncome.income_date}</strong>
              </div>
            )}
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteIncomeClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteIncomeData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View Income Modal */}

        <ModalComp
          title={"Income Details"}
          open={viewIncomeOpen}
          onClose={handleViewIncomeClose}
        >
          {incomeDetailsData && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Client Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {" "}
                      {incomeDetailsData.client_name &&
                        incomeDetailsData.client_name.name}
                    </div>
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
                    <div>
                      {incomeDetailsData.project_name &&
                        incomeDetailsData.project_name.title}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Amount</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {incomeDetailsData.amount && incomeDetailsData.amount}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500  px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Payment mode</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {incomeDetailsData.payment_mode &&
                        incomeDetailsData.payment_mode}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Payment Id</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {incomeDetailsData.payment_id &&
                        incomeDetailsData.payment_id}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Income Date</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {incomeDetailsData.income_date &&
                        incomeDetailsData.income_date}
                    </div>
                  </Grid2>
                </Grid2>
                <Grid2
                  container
                  columnSpacing={2}
                  className=" border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Bank Account</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {incomeDetailsData.bank_account &&
                        incomeDetailsData.bank_account.account_holder_name}
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

export default Income;

