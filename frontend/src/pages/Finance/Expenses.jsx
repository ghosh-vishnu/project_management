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
import { set, useForm } from "react-hook-form";
import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../utils";
import axios from "axios";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import { ClassNames } from "@emotion/react";
import { getToken } from "../../Token";

  const data = Array.from({ length: 50 }, (_, i) => ({
    ExpensesName: `expenses ${i + 1}`,
    Amount: `254364${i + 1}`,
    Date: `23-02-25`,
    Purchasedby: `employee  ${i + 1} `,
    Purchasedfrom: `Linkedin ${i + 1}`,
    Bankaccount: `1254326875${i + 1}`,
    Paymentmode:`UPI`,
    Paymentid:`12564856${i + 1}`,

  }));

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

   // Employee data variable
   const [expensesData, setExpensesData] = useState([]);
  
   // To fetch the employee data list
   const getExpensesData = async (page,rowsPerPage) => {
     try {
       const accessToken = getToken("accessToken");
       if (accessToken) {
         const response = await axios.get(`${BASE_API_URL}/finances/expenses/`, {
           headers: {
             Authorization: `Bearer ${accessToken}`,
           },
           params:{
            page : page + 1,
            page_size : rowsPerPage,
                     }
         });

         if(response.status == 200){
          setExpensesData(response.data.results);
          setcount(response.data.count)
         }
         
         //console.log(response.data.results)

       }
     } catch (error) {}
   };  

   useEffect(()=>{
     getExpensesData(page,rowsPerPage)
   },[page,rowsPerPage])
 
    // Employee Name Data
    const [employeeNameData, setEmployeeNameData] = useState();
    const getEmployeeNameData = async () => {
      try {
        const accessToken = getToken("accessToken");
        const response = await axios.get(`${BASE_API_URL}/peoples/employees-name/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setEmployeeNameData(response.data);
      } 
      catch (error) {}
    };
 
    // bank account Name data
    const [BankAccountNameData, setBankAccountNameData] = useState();
    const getBankAccountNameData = async () => {
      try {
        const accessToken = getToken("accessToken");
        const response = await axios.get(`${BASE_API_URL}/finances/bank-accounts-name/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setBankAccountNameData(response.data);  
      } catch (error) {}
    };


    // Post API Call 
  const createExpensesForm = async (data) => {
    // console.log(data)
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(`${BASE_API_URL}/finances/expenses/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("Expenses created successfully.");
        getExpensesData(page, rowsPerPage)
        reset();
        handleCreateExpensesClose();
      } else {
        setShowError(true);
        setShowMessage("Expenses doesn't created.");
      }
    } catch (error) {
      // console.error(error)
      setShowError(true);
      setShowMessage("Expenses doesn't created.");
    }
  };

  // Update api call
  const editExpensesForm = async (data) => {
    
    try {
      const accessToken = getToken("accessToken");
      const expensesId = localStorage.getItem("expensesId");
      if (accessToken && expensesId){
        const response = await axios.put(`${BASE_API_URL}/finances/expenses/${expensesId}/`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (response.status == 200) {
          setShowSuccess(true);
          setShowMessage("Expenses edited successfully.");
          getExpensesData(page,rowsPerPage)
          handleEditExpensesClose();
        
        } 
      }
      
      
    } catch (error) {
      setShowError(true);
      setShowMessage("Expenses doesn't edited.");
    }
  };

  // Delete api call
  const deleteExpensesData = async ()=>{
    try {
      const accessToken = getToken("accessToken");
      const expensesId = localStorage.getItem("expensesId");
      if (accessToken && expensesId){
        const response = await axios.delete(`${BASE_API_URL}/finances/expenses/${expensesId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (response.status == 204) {
          setShowSuccess(true);
          setShowMessage("Expenses deleted successfully.");
          getExpensesData(page,rowsPerPage)
          handleDeleteExpensesClose();
        } 
      }
      
    } catch (error) {
      setShowError(true);
      setShowMessage("Expenses doesn't deleted.");
    }
  }

 

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
                {expensesData && 
                  expensesData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.amount}</TableCell>
                      <TableCell>{data.date}</TableCell>
                      <TableCell>{data.purchased_by?.name}</TableCell>
                      <TableCell>{data.purchased_from}</TableCell>
                      <TableCell>{data.bank_account?.account_holder_name}</TableCell>
                      <TableCell>{data.payment_mode}</TableCell>
                      <TableCell>{data.payment_id}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewExpensesOpen(data)}
                          aria-label="edit"
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
                <CloseBtn onClick={handleCreateExpensesClose}>Close</CloseBtn>
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
                <CloseBtn onClick={handleEditExpensesClose}>Close</CloseBtn>
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

        {/* Delete Expenses Modal */}
        <ModalComp open={deleteExpensesOpen} onClose={handleDeleteExpensesClose}>
          <div className="w-full ">
            <div>Do you want to delete ?</div>
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
                  <div>26-03-25</div>
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