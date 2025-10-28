import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";

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
import { set, useForm } from "react-hook-form";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import axios from "axios";
import BASE_API_URL from "../../data";
import { PHONE_REGEX } from "../../utils";
import { getToken } from "../../Token";

const SelectOthers = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const SelectStatus = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const Bank = () => {
  

  // Pagination variables
  const [count, setCount]= useState(0)
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

  // Create Bank modal
  const [createBankOpen, setCreateBankOpen] = useState(false);

  const handleCreateBankOpen = () => {
    reset({
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      account_type: '',
      status: '',
      branch: '',
      ifsc_code: '',
      contact_number: '',
    });
    setCreateBankOpen(true);
  };
  const handleCreateBankClose = () => {
    setCreateBankOpen(false);
  };

  // To fetch the Bank data list
  const getBankData = async (pageNumber,pageSize ) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(
          `${BASE_API_URL}/finances/bank-accounts/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params:{
            page: pageNumber + 1, 
            page_size: pageSize,
            }
          }
        );
        setBankData(response.data.results);
        setCount(response.data.count)
      }
    } catch (error) {
      // console.log(error)
    }
  };
  useEffect(()=>{
    getBankData(page, rowsPerPage)
  },[page, rowsPerPage])

  // Edit Bank Modal
  const [editBankOpen, setEditBankOpen] = useState(false);

  // data variable
  const [bankData, setBankData] = useState([]);

  const handleEditBankOpen = (data) => {
    if (localStorage.getItem("bankId")) {
      localStorage.removeItem("bankId");
    }
    localStorage.setItem("bankId", data.id);
    reset({
      bank_name: data.bank_name,
      account_holder_name: data.account_holder_name,
      account_number: data.account_number,
      account_type: data.account_type,
      status: data.status,
      branch: data.branch,
      ifsc_code: data.ifsc_code,
      contact_number: data.contact_number,
    });
    setEditBankOpen(true);
  };
  const handleEditBankClose = () => {
    setEditBankOpen(false);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Update api call
  const editBankForm = async (data) => {
    // console.log(data)
    try {
      const accessToken = getToken("accessToken");
      const bankId = localStorage.getItem("bankId");
      
      if (accessToken && bankId) {
        const response = await axios.put(
          `${BASE_API_URL}/finances/bank-accounts/${bankId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Bank edited successfully.");
          getBankData(page, rowsPerPage)
        }
      } else {
        setShowError(true);
        setShowMessage("Bank doesn't edited.");
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
      // console.log(error);
    }
  };

  // Post API Call
  const createBankForm = async (data) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/finances/bank-accounts/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Bank created successfully.");
        getBankData(page, rowsPerPage)
        reset();
        handleCreateBankClose()
      } else {
        setShowError(true);
        setShowMessage("Bank doesn't created.");
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
      // console.log(error);
    }
  };

  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [bankaccounts, setBankaccounts] = useState([]); // Declare it first

  // Delete Bank Modal
  const [deleteBankOpen, setDeleteBankOpen] = useState(false);
  const handleDeleteBankOpen = (data) => {
    if (localStorage.getItem("bankaccounts")) {
      localStorage.removeItem("bankaccounts");
    }
    localStorage.setItem("bankaccounts", data.id);
    setDeleteBankOpen(true);
  };
  const handleDeleteBankClose = () => {
    setDeleteBankOpen(false);
  };

  // View Bank Modal
  const [viewBankOpen, setViewBankOpen] = useState(false);
  const handleViewBankOpen = async (data) => {
    setViewBankOpen(true);
    setBankDetailsData(data);
  };
  const handleViewBankClose = () => {
    setViewBankOpen(false);
  };
  const [bankDetailsData, setBankDetailsData] = useState({});

 

  // Delete api call
  const deleteBankData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const bankaId = localStorage.getItem("bankaccounts");
      if (accessToken && bankaId) {
        const response = await axios.delete(
          `${BASE_API_URL}/finances/bank-accounts/${bankaId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Bank deleted successfully.");
          getBankData(page, rowsPerPage)
          handleDeleteBankClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Bank doesn't deleted.");
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

            <Typography sx={{ color: "text.primary" }}>
              Bank Accounts
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Bank Accounts</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateBankOpen}>
              <AddIcon /> Add Bank A/C
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
                  <TableCell>A/C Holder Name</TableCell>
                  <TableCell>Bank Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Contact no.</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bankData &&
                  bankData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.account_holder_name}</TableCell>
                      <TableCell>{data.bank_name}</TableCell>
                      <TableCell>{data.branch}</TableCell>
                      <TableCell>{data.contact_number}</TableCell>
                      <TableCell>{data.status}</TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleViewBankOpen(data)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditBankOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteBankOpen(data)}
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

        {/* Create client Modal */}
        <ModalComp
          open={createBankOpen}
          onClose={handleCreateBankClose}
          title={"Add Bank Account"}
        >
          <form onSubmit={handleSubmit(createBankForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="bankName">
                    Bank Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Bank Name"
                    type="text"
                    name="bankName"
                    id="bankName"
                    {...register("bank_name", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.bank_name && (
                    <small className="text-red-600">
                      {errors.bank_name.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="holderName">
                    A/C Holder Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="A/C Holder Name"
                    name="holderName"
                    id="holderName"
                    {...register("account_holder_name", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.account_holder_name && (
                    <small className="text-red-600">
                      {errors.account_holder_name.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="accountNumber">
                    A/C Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="A/C Number"
                    name="accountNumber"
                    id="accountNumber"
                    {...register("account_number", {
                      required: {
                        value: true,
                        message: "This Field is required.",
                      },
                    })}
                  />
                  {errors.account_number && (
                    <small className="text-red-600">
                      {errors.account_number.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("account_type", {
                      required: {
                        value: true,
                        message: "This Field is required.",
                      },
                    })}
                    label="Account Type"
                    options={["Savings", "Current"]}
                    selectOption={"Account Type"}
                  />
                  {errors.account_type && (
                    <small className="text-red-600">
                      {errors.account_type.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="branch">
                    Branch <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Branch"
                    name="branch"
                    id="branch"
                    {...register("branch", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.branch && (
                    <small className="text-red-600">
                      {errors.branch.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectStatus
                    {...register("status", {
                      required: "This field is required.",
                    })}
                    label="Status"
                    options={["Open", "Close"]}
                    selectOption={"Status"}
                  />
                  {errors.status && (
                    <small className="text-red-600">
                      {errors.status.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contactNumber">
                    Contact No. <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contact No."
                    name="contactNumber"
                    id="contactNumber"
                    {...register("contact_number", {
                      required: "This field is required.",
                      pattern:{
                        value: PHONE_REGEX,
                        message: "Contact no. is not valid."
                      }
                    })}
                  />
                  {errors.contact_number && (
                    <small className="text-red-600">
                      {errors.contact_number.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="IFSC Code">
                    IFSC Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    
                    placeholder="IFSC Code"
                    name="IFSC Code"
                    id="IFSC Code"
                    {...register("ifsc_code", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.ifsc_code && (
                    <small className="text-red-600">
                      {errors.ifsc_code.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateBankClose}>Close</CloseBtn>
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

        {/* Edit client Modal */}
        <ModalComp
          open={editBankOpen}
          onClose={handleEditBankClose}
          title={"Edit Bank Account"}
        >
          <form onSubmit={handleSubmit(editBankForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="bankName">
                    Bank Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Bank Name"
                    type="text"
                    name="bankName"
                    id="bankName"
                    {...register("bank_name", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.bank_name && (
                    <small className="text-red-600">
                      {errors.bank_name.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="holderName">
                    A/C Holder Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="A/C Holder Name"
                    name="holderName"
                    id="holderName"
                    {...register("account_holder_name", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.account_holder_name && (
                    <small className="text-red-600">
                      {errors.account_holder_name.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="accountNumber">
                    A/C Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="A/C Number"
                    name="accountNumber"
                    id="accountNumber"
                    {...register("account_number", {
                      required: {
                        value: true,
                        message: "This Field is required.",
                      },
                    })}
                  />
                  {errors.account_number && (
                    <small className="text-red-600">
                      {errors.account_number.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectOthers
                    {...register("account_type", {
                      required: {
                        value: true,
                        message: "This Field is required.",
                      },
                    })}
                    label="Account Type"
                    options={["Savings", "Current"]}
                    selectOption={"Account Type"}
                  />
                  {errors.account_type && (
                    <small className="text-red-600">
                      {errors.account_type.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="branch">
                    Branch <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Branch"
                    name="branch"
                    id="branch"
                    {...register("branch", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.branch && (
                    <small className="text-red-600">
                      {errors.branch.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <SelectStatus
                    {...register("status", {
                      required: "This field is required.",
                    })}
                    label="Status"
                    options={["Open", "Close"]}
                    selectOption={"Status"}
                  />
                  {errors.status && (
                    <small className="text-red-600">
                      {errors.status.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contactNumber">
                    Contact No. <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contact No."
                    name="contactNumber"
                    id="contactNumber"
                    {...register("contact_number", {
                      required: "This field is required.",
                      pattern:{
                        value: PHONE_REGEX,
                        message: "Contact no. is not valid."
                      }
                    })}
                  />
                  {errors.contact_number && (
                    <small className="text-red-600">
                      {errors.contact_number.message}
                    </small>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="IFSC Code">
                    IFSC Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    
                    placeholder="IFSC Code"
                    name="IFSC Code"
                    id="IFSC Code"
                    {...register("ifsc_code", {
                      required: "This field is required.",
                    })}
                  />
                  {errors.ifsc_code && (
                    <small className="text-red-600">
                      {errors.ifsc_code.message}
                    </small>
                  )}
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditBankClose}>Close</CloseBtn>
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

        {/* Delete client Modal */}
        <ModalComp open={deleteBankOpen} onClose={handleDeleteBankClose}>
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteBankClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteBankData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View client Modal */}
        <ModalComp
          title={"Bank Details"}
          open={viewBankOpen}
          onClose={handleViewBankClose}
        >
          {bankDetailsData && (
            <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
              <div className=" border    border-gray-500  rounded-[.5rem]">
                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Bank Name</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.bank_name && bankDetailsData.bank_name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">A/C Holder Name </div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.account_holder_name &&
                        bankDetailsData.account_holder_name}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b px-4 py-2 border-gray-500"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">A/C Number</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.account_number &&
                        bankDetailsData.account_number}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500  px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">A/C Type</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.account_type &&
                        bankDetailsData.account_type}
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
                      {bankDetailsData.status && bankDetailsData.status}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  spacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Branch</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.branch && bankDetailsData.branch}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  columnSpacing={2}
                  className="border-b border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">IFSC Code</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.ifsc_code && bankDetailsData.ifsc_code}
                    </div>
                  </Grid2>
                </Grid2>

                <Grid2
                  container
                  columnSpacing={2}
                  className="border-0 border-gray-500 px-4 py-2"
                >
                  <Grid2 size={4}>
                    <div className="font-bold">Contact No.</div>
                  </Grid2>
                  <Grid2 size={8}>
                    <div>
                      {bankDetailsData.contact_number &&
                        bankDetailsData.contact_number}
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

export default Bank;
