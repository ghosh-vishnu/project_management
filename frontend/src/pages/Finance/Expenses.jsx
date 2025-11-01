import React, { useState,useEffect} from "react";

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
import BASE_API_URL from "../../data";
import { useForm } from "react-hook-form";
import axios from "axios";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import { getToken } from "../../Token";

   // Select for status
   const SelectPurchasedby = React.forwardRef(
    ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
      <>
        <label>{label} <span className="text-red-600">*</span> </label>
        <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
          <option value="">Select Employee {selectOption}</option>
          {options && options.map((option, index) => (
            <option key={index} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </>
    )
  );

const SelectPaymentmode = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>{label} <span className="text-red-600">*</span> </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Payment Mode</option>
        {options && options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const SelectBankAccount = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>{label} <span className="text-red-600">*</span> </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options && options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.account_holder_name}
          </option>
        ))}
      </select>
    </>
  )
); 

const Expenses = () => {

  const [count,setcount] =useState(0)
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();


// Variables to show alerts
const [showError, setShowError] = useState(false);
const [showMessage, setShowMessage] = useState("");
const [showSuccess, setShowSuccess] = useState(false);


  // Create Expenses modal
  const [createExpensesOpen, setCreateExpensesOpen] = useState(false);

  const handleCreateExpensesOpen = () => {
    setCreateExpensesOpen(true);
  };
  const handleCreateExpensesClose = () => {
    setCreateExpensesOpen(false);
  };

  // Edit Expenses Modal
  const [editExpensesOpen, setEditExpensesOpen] = useState(false);

  const handleEditExpensesOpen = (data) => {
    if(localStorage.getItem('expensesId')){
      localStorage.removeItem('expensesId')
    }
    localStorage.setItem('expensesId',data.id)
    reset(
      {
        name: data.name,
       amount: data.amount,
       date: data.date,

       purchased_by_id: data.purchased_by?.id,
       purchased_from: data.purchased_from,
       bank_account_id: data.bank_account?.id,

       payment_mode: data.payment_mode,
       payment_id: data.payment_id,
      }
    )
    setEditExpensesOpen(true);
  };
  const handleEditExpensesClose = () => {
    setEditExpensesOpen(false);
  };

  // Delete Expenses Modal
  const [deleteExpensesOpen, setDeleteExpensesOpen] = useState(false);
  const handleDeleteExpensesOpen = (data) => {
    if (localStorage.getItem('expensesId')){
      localStorage.removeItem('expensesId')
    }
    localStorage.setItem('expensesId', data.id)
    setDeleteExpensesOpen(true);
  };
  const handleDeleteExpensesClose = () => {
    setDeleteExpensesOpen(false);
  };

  // View Expenses Modal
  const [viewExpensesOpen, setViewExpensesOpen] = useState(false);
  //get expenses details view
  const [expensesDetailsData, setExpensesDetailsData] = useState({});
  //get ticket details data
  const handleViewExpensesOpen = async(data) => {
    setViewExpensesOpen(true);
    setExpensesDetailsData(data);
  };
  const handleViewExpensesClose = () => {
    setViewExpensesOpen(false);
  };

   // Expenses data variable
   const [expensesData, setExpensesData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
  
   // To fetch the expenses data list
   const getExpensesData = async (pageNumber, pageSize) => {
     try {
       setLoading(true);
       const accessToken = getToken("accessToken");
       if (accessToken) {
         const response = await axios.get(`${BASE_API_URL}/finances/expenses/`, {
           headers: {
             Authorization: `Bearer ${accessToken}`,
           },
           params:{
            page: pageNumber + 1,
            page_size: pageSize,
           }
         });

         if(response.status == 200){
          setExpensesData(response.data.results || []);
          setcount(response.data.count || 0);
         }
       }
     } catch (error) {
       console.error("Error fetching expenses:", error);
       setShowError(true);
       if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
         setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
       } else {
         setShowMessage("Failed to fetch expenses data.");
       }
       setExpensesData([]);
       setcount(0);
       setTimeout(() => setShowError(false), 5000);
     } finally {
       setLoading(false);
     }
   };  

   useEffect(()=>{
     getExpensesData(page,rowsPerPage)
   },[page,rowsPerPage])
 
    // Employee Name Data
    const [employeeNameData, setEmployeeNameData] = useState([]);
    const getEmployeeNameData = async () => {
      try {
        const accessToken = getToken("accessToken");
        if (!accessToken) return;
        const response = await axios.get(`${BASE_API_URL}/peoples/employees-name/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setEmployeeNameData(response.data || []);
      } 
      catch (error) {
        console.error("Error fetching employees:", error);
        setEmployeeNameData([]);
      }
    };
 
    // bank account Name data
    const [BankAccountNameData, setBankAccountNameData] = useState([]);
    const getBankAccountNameData = async () => {
      try {
        const accessToken = getToken("accessToken");
        if (!accessToken) return;
        const response = await axios.get(`${BASE_API_URL}/finances/bank-accounts-name/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setBankAccountNameData(response.data || []);  
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        setBankAccountNameData([]);
      }
    };


    // Post API Call 
  const createExpensesForm = async (data) => {
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

      const response = await axios.post(`${BASE_API_URL}/finances/expenses/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Expenses created successfully.");
        setPage(0);
        getExpensesData(0, rowsPerPage);
        reset();
        handleCreateExpensesClose();
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(true);
        setShowMessage("Expenses doesn't created.");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      setShowError(true);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          setShowMessage(errorData.error);
        } else if (errorData.detail) {
          setShowMessage(errorData.detail);
        } else if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([key, value]) => {
              const errorText = Array.isArray(value) ? value.join(', ') : String(value);
              return `${key}: ${errorText}`;
            })
            .join('; ');
          setShowMessage(errors || "Failed to create expense. Please check your input.");
        } else {
          setShowMessage("Failed to create expense. Please try again.");
        }
      } else {
        setShowMessage("Failed to create expense. Please try again.");
      }
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Update api call
  const editExpensesForm = async (data) => {
    if (submitting) {
      return;
    }
    
    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      const expensesId = localStorage.getItem("expensesId");
      if (!accessToken || !expensesId) {
        setShowError(true);
        setShowMessage("Authentication required or expense not selected.");
        setSubmitting(false);
        return;
      }
      
      const response = await axios.put(`${BASE_API_URL}/finances/expenses/${expensesId}/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status == 200) {
        setShowSuccess(true);
        setShowMessage("Expenses edited successfully.");
        getExpensesData(page, rowsPerPage);
        handleEditExpensesClose();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      setShowError(true);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          setShowMessage(errorData.error);
        } else if (errorData.detail) {
          setShowMessage(errorData.detail);
        } else if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([key, value]) => {
              const errorText = Array.isArray(value) ? value.join(', ') : String(value);
              return `${key}: ${errorText}`;
            })
            .join('; ');
          setShowMessage(errors || "Failed to update expense. Please check your input.");
        } else {
          setShowMessage("Failed to update expense. Please try again.");
        }
      } else {
        setShowMessage("Failed to update expense. Please try again.");
      }
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete api call
  const deleteExpensesData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const expensesId = localStorage.getItem("expensesId");
      if (!accessToken || !expensesId) {
        setShowError(true);
        setShowMessage("Authentication required or expense not selected.");
        return;
      }
      
      const response = await axios.delete(`${BASE_API_URL}/finances/expenses/${expensesId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.status == 204) {
        setShowSuccess(true);
        setShowMessage("Expenses deleted successfully.");
        getExpensesData(page, rowsPerPage);
        handleDeleteExpensesClose();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      setShowError(true);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
      } else {
        setShowMessage(error.response?.data?.error || error.response?.data?.detail || "Failed to delete expense.");
      }
      setTimeout(() => setShowError(false), 5000);
    }
  };

 

      // Use Effect
  useEffect(() => {
    getEmployeeNameData();
    getBankAccountNameData();
  }, []);

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
           {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>
            <Typography sx={{ color: "text.primary" }}>Expenses</Typography>
          </Breadcrumbs>
           {/* Header */}
        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
          <div>
            <h4 className="text-2xl font-bold">Expenses</h4>
          </div>
          <div>
            <PrimaryBtn onClick={handleCreateExpensesOpen}>
              <AddIcon /> Create Expenses
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
                  <TableCell>Expenses Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Purchased by</TableCell>
                  <TableCell>Purchased from</TableCell>
                  <TableCell>Bank Account</TableCell>
                  <TableCell>Payment mode</TableCell>
                  <TableCell>Payment Id</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !expensesData || expensesData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  expensesData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.name || "N/A"}</TableCell>
                      <TableCell>{data.amount || "N/A"}</TableCell>
                      <TableCell>{data.date ? new Date(data.date).toLocaleDateString("en-GB") : "N/A"}</TableCell>
                      <TableCell>{data.purchased_by?.name || "N/A"}</TableCell>
                      <TableCell>{data.purchased_from || "N/A"}</TableCell>
                      <TableCell>{data.bank_account?.account_holder_name || "N/A"}</TableCell>
                      <TableCell>{data.payment_mode || "N/A"}</TableCell>
                      <TableCell>{data.payment_id || "N/A"}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewExpensesOpen(data)}
                          aria-label="view"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditExpensesOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDeleteExpensesOpen(data)}
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

        {/* Create Expenses Modal */}
        <ModalComp
          open={createExpensesOpen}
          onClose={handleCreateExpensesClose}
          title={"Create Expenses"}
        >
          <form onSubmit={handleSubmit(createExpensesForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="expensesName">
                  Expenses Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Expenses Name"
                    type="text"
                    name="expensesName"
                    id="expensesName"
                    {...register("name", {
                      required:"This field is required."
                    })}
                  />
                  {errors.name && <small className="text-red-600">{errors.name.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="amount">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Expenses Amount"
                    name="amount"
                    id="amount"
                    {...register("amount", {
                      required:"This field is required."
                    })}
                  />
                  {errors.amount && <small className="text-red-600">{errors.amount.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="expensedate">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                     type="date"
                     
                     placeholder="Date"
                     name="expensesDate"
                     id="expensesDate"
                     {...register("date", {
                      required:"This field is required."
                    })}
                  />
                  {errors.date && <small className="text-red-600">{errors.date.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPurchasedby
                    {...register("purchased_by_id",{
                     required:"This field is required."
                      
                    })}
                    label="Purchased By"
                    options={employeeNameData}
                  />
                  {errors.purchased_by_id && (
                    <small className="text-red-600">{errors.purchased_by_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="purchasedfrom">
                    Purchased From <span className="text-red-600">*</span>
                  </label>
                  <input
                     type="text"
                     
                     placeholder="Purchased From"
                     name="purchasedfrom"
                     id="purchasedfrom"
                     {...register("purchased_from", {
                      required:"This field is required."
                    })}
                  />
                  {errors.purchased_from && <small className="text-red-600">{errors.purchased_from.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                    {...register("bank_account_id",{
                     required:"This field is required."
                      
                    })}
                    label="Bank Account"
                    options={BankAccountNameData}
                    selectOption = {"Bank Account"}
                  />
                  {errors.bank_account_id && (
                    <small className="text-red-600">{errors.bank_account_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPaymentmode
                    {...register("payment_mode",{
                      required:"This field is required."
                    })}
                    label="Payment Mode"
                    options={["upi","Credit Card","Debit Card","Cash","Others"]}
                    selectOption={"Payment Mode"}
                  />
                  {errors.payment_mode && (
                    <small className="text-red-600">{errors.payment_mode.message}</small>
                  )}
                </Grid2>
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
                      required:"This field is required."
                    })}
                  />
                  {errors.payment_id && (
                    <small className="text-red-600">{errors.payment_id.message}</small>
                  )}
                </Grid2>
              </Grid2>
              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreateExpensesClose} disabled={submitting}>Close</CloseBtn>
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

        {/* Edit Expenses Modal */}
        <ModalComp
          open={editExpensesOpen}
          onClose={handleEditExpensesClose}
          title={"Edit Expenses"}
        >
          <form onSubmit={handleSubmit(editExpensesForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="expensesName">
                  Expenses Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Expenses Name"
                    type="text"
                    name="expensesName"
                    id="expensesName"
                    {...register("name", {
                      required:"This field is required."
                    })}
                  />
                  {errors.name && <small className="text-red-600">{errors.name.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="amount">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Expenses Amount"
                    name="amount"
                    id="amount"
                    {...register("amount", {
                      required:"This field is required."
                    })}
                  />
                  {errors.amount && <small className="text-red-600">{errors.amount.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="expensedate">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                     type="date"
                     
                     placeholder="Date"
                     name="expensesDate"
                     id="expensesDate"
                     {...register("date", {
                      required:"This field is required."
                    })}
                  />
                  {errors.date && <small className="text-red-600">{errors.date.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPurchasedby
                    {...register("purchased_by_id",{
                     required:"This field is required."
                      
                    })}
                    label="Purchased By"
                    options={employeeNameData}
                    
                  />
                  {errors.purchased_by_id && (
                    <small className="text-red-600">{errors.purchased_by_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="purchasedfrom">
                    Purchased From <span className="text-red-600">*</span>
                  </label>
                  <input
                     type="text"
                     
                     placeholder="Purchased From"
                     name="purchasedfrom"
                     id="purchasedfrom"
                     {...register("purchased_from", {
                      required:"This field is required."
                    })}
                  />
                  {errors.purchased_from && <small className="text-red-600">{errors.purchased_from.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                    {...register("bank_account_id",{
                     required:"This field is required."
                      
                    })}
                    label="Bank Account"
                    options={BankAccountNameData}
                    selectOption = {"Bank Account"}
                  />
                  {errors.bank_account_id && (
                    <small className="text-red-600">{errors.bank_account_id.message}</small>
                  )}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPaymentmode
                    {...register("payment_mode",{
                      required:"This field is required."
                    })}
                    label="Payment Mode"
                    options={["upi","Credit Card","Debit Card","Cash","Others"]}
                    selectOption={"Payment Mode"}
                  />
                  {errors.payment_mode && (
                    <small className="text-red-600">{errors.payment_mode.message}</small>
                  )}
                </Grid2>
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
                      required:"This field is required."
                    })}
                  />
                  {errors.payment_id && (
                    <small className="text-red-600">{errors.payment_id.message}</small>
                  )}
                </Grid2>
              </Grid2>
              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditExpensesClose} disabled={submitting}>Close</CloseBtn>
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

        {/* Delete Expenses Modal */}
        <ModalComp open={deleteExpensesOpen} onClose={handleDeleteExpensesClose}>
          <div className="w-full ">
            <div>Do you want to delete this expense?</div>
            {expensesData.find(e => e.id === parseInt(localStorage.getItem("expensesId"))) && (
              <div className="mt-2 text-gray-600">
                Expense: <strong>{expensesData.find(e => e.id === parseInt(localStorage.getItem("expensesId")))?.name}</strong>
              </div>
            )}
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteExpensesClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteExpensesData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View Expenses Modal */}
        <ModalComp
          title={"Expenses Details"}
          open={viewExpensesOpen}
          onClose={handleViewExpensesClose}
        >
          {expensesDetailsData &&
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            <div className=" border    border-gray-500  rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Expenses Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.name && expensesDetailsData.name}</div>
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
                  <div>{expensesDetailsData.amount && expensesDetailsData.amount}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Date</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.date ? new Date(expensesDetailsData.date).toLocaleDateString("en-GB") : "N/A"}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b border-gray-500  px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Purchased by</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.purchased_by && expensesDetailsData.purchased_by.name}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b border-gray-500 px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Purchased From</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.purchased_from && expensesDetailsData.purchased_from}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b border-gray-500 px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Bank Account</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.bank_account && expensesDetailsData.bank_account.account_holder_name}</div>
                </Grid2>
              </Grid2>

              <Grid2 container columnSpacing={2} className="border-b border-gray-500 px-4 py-2">
                <Grid2 size={4}>
                  <div className="font-bold">Payment Mode</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.payment_mode && expensesDetailsData.payment_mode}</div>
                </Grid2>
              </Grid2>

              <Grid2 container columnSpacing={2} className=" border-gray-500 px-4 py-2">
                <Grid2 size={4}>
                  <div className="font-bold">Payment Id</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{expensesDetailsData.payment_id && expensesDetailsData.payment_id}</div>
                </Grid2>
              </Grid2>
            </div>
          </div>
        }
        </ModalComp>
      </div>
    </div>
  );
};
export default Expenses;