import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

import { Breadcrumbs, Button, IconButton, Menu, MenuItem, Typography, Grid2 } from "@mui/material";
import { Link } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalComp from "../components/Modal/ModalComp";
import CloseBtn from "../components/Buttons/CloseBtn";
import PrimaryBtn from "../components/Buttons/PrimaryBtn";
import DeleteBtn from "../components/Buttons/DeleteBtn";
import axios from "axios";
import BASE_API_URL from "../data";
import { getToken } from "../Token";
import { useForm } from "react-hook-form";
import ErrorAlert from "../components/Alert/ErrorAlert";
import SuccessAlert from "../components/Alert/SuccessAlert";

// Select Components
const SelectProject = React.forwardRef(
  ({ selectOption, onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} {label.includes("*") ? "" : <span className="text-red-600">*</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Project</option>
        {options && options.length > 0 ? (
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))
        ) : (
          <option value="" disabled>No projects available</option>
        )}
      </select>
    </>
  )
);

const SelectClient = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} {label.includes("*") ? "" : <span className="text-red-600">*</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Client</option>
        {options && options.length > 0 ? (
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))
        ) : (
          <option value="" disabled>No clients available</option>
        )}
      </select>
    </>
  )
);

const SelectStatus = React.forwardRef(
  ({ onChange, onBlur, name, label }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>
    </>
  )
);

const SelectPaymentMethod = React.forwardRef(
  ({ onChange, onBlur, name, label }, ref) => (
    <>
      <label>
        {label} {label.includes("*") ? "" : <span className="text-red-600">*</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Payment Method</option>
        <option value="online">Online</option>
        <option value="bank_transaction">Bank Transaction</option>
        <option value="other">Other</option>
      </select>
    </>
  )
);

const SelectBankAccount = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [] }, ref) => (
    <>
      <label>
        {label} {label.includes("*") ? "" : <span className="text-red-600">*</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Bank Account</option>
        {options && options.length > 0 ? (
          options.map((option) => (
            <option key={option.id} value={option.id}>
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

// Select Dropdown for Country
const SelectCountry = React.forwardRef(
  ({ onChange, onBlur, name, label, countries = [] }, ref) => (
    <>
      <label>
        {label} {label.includes("*") ? "" : <span className="text-red-600">*</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select Country</option>
        {countries &&
          countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
      </select>
    </>
  )
);

// Currency mapping function
const getCurrencySymbol = (country) => {
  if (!country) return '$'; // Default to USD
  
  const countryLower = country.toLowerCase();
  
  // Major currencies mapping
  const currencyMap = {
    'united states': '$',
    'usa': '$',
    'us': '$',
    'united kingdom': '£',
    'uk': '£',
    'european union': '€',
    'germany': '€',
    'france': '€',
    'italy': '€',
    'spain': '€',
    'netherlands': '€',
    'belgium': '€',
    'austria': '€',
    'portugal': '€',
    'ireland': '€',
    'finland': '€',
    'greece': '€',
    'india': '₹',
    'japan': '¥',
    'china': '¥',
    'australia': 'A$',
    'canada': 'C$',
    'south korea': '₩',
    'russia': '₽',
    'brazil': 'R$',
    'mexico': '$',
    'turkey': '₺',
    'south africa': 'R',
    'singapore': 'S$',
    'hong kong': 'HK$',
    'new zealand': 'NZ$',
    'switzerland': 'CHF',
    'norway': 'kr',
    'sweden': 'kr',
    'denmark': 'kr',
    'poland': 'zł',
    'thailand': '฿',
    'malaysia': 'RM',
    'indonesia': 'Rp',
    'philippines': '₱',
    'vietnam': '₫',
    'pakistan': '₨',
    'bangladesh': '৳',
    'sri lanka': 'Rs',
    'nepal': 'Rs',
    'uae': 'د.إ',
    'united arab emirates': 'د.إ',
    'saudi arabia': 'ر.س',
    'israel': '₪',
    'egypt': 'E£',
    'argentina': '$',
    'chile': '$',
    'colombia': '$',
    'peru': 'S/',
    'ukraine': '₴',
  };
  
  // Direct match
  if (currencyMap[countryLower]) {
    return currencyMap[countryLower];
  }
  
  // Partial match for country names with variations
  for (const [key, symbol] of Object.entries(currencyMap)) {
    if (countryLower.includes(key) || key.includes(countryLower)) {
      return symbol;
    }
  }
  
  // Default
  return '$';
};

const Invoices = () => {
  // Invoice data states
  const [invoicesData, setInvoicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Alert states
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Dropdown data
  const [projectData, setProjectData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [bankAccountData, setBankAccountData] = useState([]);
  const [countries, setCountries] = useState([]);

  // Menu state - now per invoice
  const [anchorElMap, setAnchorElMap] = useState({});
  
  const handleMenuClick = (event, invoiceId) => {
    setAnchorElMap({ [invoiceId]: event.currentTarget });
  };
  
  const handleMenuClose = (invoiceId) => {
    setAnchorElMap(prev => {
      const newMap = { ...prev };
      delete newMap[invoiceId];
      return newMap;
    });
  };
  
  const isMenuOpen = (invoiceId) => Boolean(anchorElMap[invoiceId]);

  // View Modal open and close
  const [viewOpen, setViewOpen] = useState(false);
  const [viewInvoiceData, setViewInvoiceData] = useState(null);
  
  const handleViewOpen = (invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceData(invoice);
    setViewOpen(true);
    handleMenuClose(invoice.id);
  };
  
  const handleViewClose = () => {
    setViewOpen(false);
    setViewInvoiceData(null);
    setSelectedInvoice(null);
  };
  
  // Delete modal open and close
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const handleDeleteOpen = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteOpen(true);
    handleMenuClose(invoice.id);
  };
  
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedInvoice(null);
  };

  // Edit Invoice Modal
  const [editInvoiceOpen, setEditInvoiceOpen] = useState(false);
  
  const handleEditInvoiceOpen = (invoice) => {
    setSelectedInvoice(invoice);
    // Set form values
    if (invoice) {
      setValueEdit("project_id", invoice.project?.id?.toString() || "");
      setValueEdit("client_id", invoice.client?.id?.toString() || "");
      setValueEdit("amount", invoice.amount || "");
      setValueEdit("status", invoice.status?.toLowerCase() || "pending");
      setValueEdit("due_date", invoice.due_date || "");
      setValueEdit("address", invoice.address || "");
      setValueEdit("country", invoice.country || "");
      setValueEdit("phone_number", invoice.phone_number || "");
      setValueEdit("payment_method", invoice.payment_method?.toLowerCase() || "");
      setValueEdit("bank_account_id", invoice.bank_account?.id?.toString() || "");
      setValueEdit("note", invoice.note || "");
    }
    setEditInvoiceOpen(true);
    handleMenuClose(invoice.id);
  };
  
  const handleEditInvoiceClose = () => {
    setEditInvoiceOpen(false);
    setSelectedInvoice(null);
    resetEdit();
  };

  // Create invoice modal
  const [CreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  
  const handleCreateInvoiceOpen = () => {
    resetCreate();
    setCreateInvoiceOpen(true);
  };
  
  const handleCreateInvoiceClose = () => {
    setCreateInvoiceOpen(false);
    resetCreate();
  };

  // Download invoice modal
  const [DownloadInvoiceOpen, setDownloadInvoiceOpen] = useState(false);
  
  const handleDownloadInvoiceOpen = () => {
    setDownloadInvoiceOpen(true);
    setSelectedInvoice(null); // Reset selection when opening modal
  };
  const handleDownloadInvoiceClose = () => {
    setDownloadInvoiceOpen(false);
    setSelectedInvoice(null); // Reset selection when closing
  };
  
  // Form handling
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
  } = useForm();
  
  // Fetch invoices data
  const getInvoicesData = async () => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }
      
      const response = await axios.get(`${BASE_API_URL}/invoices/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setInvoicesData(response.data.results || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setShowError(true);
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
      } else {
        setShowMessage("Failed to fetch invoices data.");
      }
      setInvoicesData([]);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch projects for dropdown
  const getProjectData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const response = await axios.get(`${BASE_API_URL}/projects-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setProjectData(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  
  // Fetch clients for dropdown
  const getClientData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const response = await axios.get(`${BASE_API_URL}/peoples/clients-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setClientData(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  
  // Fetch bank accounts for dropdown
  const getBankAccountData = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const response = await axios.get(`${BASE_API_URL}/finances/bank-accounts-name/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setBankAccountData(response.data || []);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };
  
  // Create invoice
  const createInvoiceForm = async (data) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowError(true);
        setShowMessage("Authentication required. Please login again.");
        setSubmitting(false);
        return;
      }
      
      const invoiceData = {
        // Don't send invoice_number - backend will auto-generate it
        project_id: data.project_id ? parseInt(data.project_id) : null,
        client_id: data.client_id ? parseInt(data.client_id) : null,
        amount: parseFloat(data.amount),
        status: data.status || "pending",
        due_date: data.due_date,
        address: data.address || "",
        country: data.country || "",
        phone_number: data.phone_number || "",
        payment_method: data.payment_method || "",
        bank_account_id: data.bank_account_id ? parseInt(data.bank_account_id) : null,
        note: data.note || "",
      };
      
      const response = await axios.post(`${BASE_API_URL}/invoices/`, invoiceData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 201) {
        setShowSuccess(true);
        setShowMessage("Invoice created successfully.");
        getInvoicesData();
        resetCreate();
        handleCreateInvoiceClose();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
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
          setShowMessage(errors || "Failed to create invoice. Please check your input.");
        } else {
          setShowMessage("Failed to create invoice. Please try again.");
        }
      } else {
        setShowMessage("Failed to create invoice. Please try again.");
      }
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update invoice
  const editInvoiceForm = async (data) => {
    if (submitting || !selectedInvoice) return;
    
    try {
      setSubmitting(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowError(true);
        setShowMessage("Authentication required. Please login again.");
        setSubmitting(false);
        return;
      }
      
      const invoiceData = {
        project_id: data.project_id ? parseInt(data.project_id) : null,
        client_id: data.client_id ? parseInt(data.client_id) : null,
        amount: parseFloat(data.amount),
        status: data.status || "pending",
        due_date: data.due_date,
        address: data.address || "",
        country: data.country || "",
        phone_number: data.phone_number || "",
        payment_method: data.payment_method || "",
        bank_account_id: data.bank_account_id ? parseInt(data.bank_account_id) : null,
        note: data.note || "",
      };
      
      const response = await axios.put(`${BASE_API_URL}/invoices/${selectedInvoice.id}/`, invoiceData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        setShowSuccess(true);
        setShowMessage("Invoice updated successfully.");
        getInvoicesData();
        handleEditInvoiceClose();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
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
          setShowMessage(errors || "Failed to update invoice. Please check your input.");
        } else {
          setShowMessage("Failed to update invoice. Please try again.");
        }
      } else {
        setShowMessage("Failed to update invoice. Please try again.");
      }
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete invoice
  const deleteInvoiceData = async () => {
    if (!selectedInvoice) return;
    
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowError(true);
        setShowMessage("Authentication required. Please login again.");
        return;
      }
      
      const response = await axios.delete(`${BASE_API_URL}/invoices/${selectedInvoice.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.status === 204) {
        setShowSuccess(true);
        setShowMessage("Invoice deleted successfully.");
        getInvoicesData();
        handleDeleteClose();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setShowError(true);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setShowMessage("Cannot connect to server. Please make sure the backend server is running.");
      } else {
        setShowMessage(error.response?.data?.error || error.response?.data?.detail || "Failed to delete invoice.");
      }
      setTimeout(() => setShowError(false), 5000);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "paid") return "bg-green-500";
    if (statusLower === "overdue") return "bg-red-500";
    return "bg-orange-500";
  };
  
  // Fetch countries
  const getCountriesData = async () => {
    try {
      const res = await axios.get(
        "https://countriesnow.space/api/v0.1/countries"
      );
      const countryList = res.data.data.map((c) => c.country).sort();
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching countries", error);
    }
  };

  useEffect(() => {
    getInvoicesData();
    getProjectData();
    getClientData();
    getBankAccountData();
    getCountriesData();
  }, []);
     
  
  return (
    <div>
      {showSuccess && (
        <SuccessAlert message={showMessage} show={showSuccess} onClose={() => setShowSuccess(false)} />
      )}
      {showError && (
        <ErrorAlert message={showMessage} show={showError} onClose={() => setShowError(false)} />
      )}
      <div>
        <div className="m-6">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Invoices</Typography>
          </Breadcrumbs>
        </div>

        <div className="flex flex-row flex-wrap place-content-between px-6 gap-x-2 gap-y-4">
          <div>
            <h5 className="text-2xl font-bold">Invoices</h5>
          </div>
          <div>
            <Button variant="contained"  startIcon={<AddIcon />} color="info" onClick={handleCreateInvoiceOpen}  style={{marginRight:"16px",backgroundColor:"#1a1b5b",color:"white",padding:"10px 20px",borderRadius:"5px"}}>
              Create Invoices
            </Button>

            <Button variant="contained" startIcon={<DownloadIcon />} color="info" onClick={handleDownloadInvoiceOpen} style={{backgroundColor:"#1a1b5b",color:"white",padding:"10px 20px",borderRadius:"5px"}}>
              Download Invoices
            </Button>
            
        
        

          </div>
        </div>

           {/* Card Container */}
           <div className="px-6 mt-8 flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : invoicesData.length === 0 ? (
            <div className="text-center py-8">No invoices found</div>
          ) : (
            invoicesData.map((invoice) => (
              <div key={invoice.id} className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
                <div>
                  <h5 className="text-[1.2rem] font-bold">
                    {invoice.project?.title || 'N/A'} ({invoice.invoice_number})
                  </h5>
                  <div className="mt-2 text-gray-500">Amount: {getCurrencySymbol(invoice.country)}{invoice.amount || 0}</div>
                  <div className={`${getStatusColor(invoice.status)} rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]`}>
                    {invoice.status || 'Pending'}
                  </div>
                </div>
                <div>
                  <div className="leading-[.5rem] text-right cursor-pointer">
                    <IconButton 
                      id={`basic-button-${invoice.id}`} 
                      onClick={(e) => handleMenuClick(e, invoice.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu 
                      id={`basic-menu-${invoice.id}`} 
                      anchorEl={anchorElMap[invoice.id]} 
                      open={isMenuOpen(invoice.id)} 
                      onClose={() => handleMenuClose(invoice.id)}
                    >
                      <MenuItem onClick={() => handleViewOpen(invoice)}>
                        <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                      </MenuItem>
                      <MenuItem onClick={() => handleEditInvoiceOpen(invoice)}>
                        <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteOpen(invoice)}>
                        <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                      </MenuItem>
                    </Menu>
                  </div>
                  <div className="mt-6">Due Date: {formatDate(invoice.due_date)}</div>
                </div>
              </div>
            ))
          )}
          
          </div>

        </div>
          
          {/* Delete Invoice Modal */}
      <ModalComp open={deleteOpen} onClose={handleDeleteClose}>
        <div className="w-full ">
          <div>Do you want to delete this invoice?</div>
          {selectedInvoice && (
            <div className="mt-2 text-gray-600">
              Invoice: <strong>{selectedInvoice.invoice_number} - {selectedInvoice.project?.title || 'N/A'}</strong>
            </div>
          )}
          <div className="flex mt-8 justify-end gap-4">
            <CloseBtn
              onClick={handleDeleteClose}
              className={"border border-gray"}
            >
              Close
            </CloseBtn>
            <DeleteBtn onClick={deleteInvoiceData}>Delete</DeleteBtn>
          </div>
        </div>
      </ModalComp>


          {/* View Modal */}
      <ModalComp
        title={"Invoice Details"}
        open={viewOpen}
        onClose={handleViewClose}
      >
        {viewInvoiceData ? (
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            <div className="border border-gray-500 rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Invoice Number</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.invoice_number || "N/A"}</div>
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
                  <div>{viewInvoiceData.project?.title || "N/A"}</div>
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
                  <div>{viewInvoiceData.client?.name || "N/A"}</div>
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
                  <div>{getCurrencySymbol(viewInvoiceData.country)}{viewInvoiceData.amount || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Status</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.status || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Due Date</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{formatDate(viewInvoiceData.due_date)}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Address</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.address || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Country</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.country || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Phone Number</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.phone_number || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Payment Method</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.payment_method || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Bank Account</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.bank_account?.account_holder_name || "N/A"}</div>
                </Grid2>
              </Grid2>
              <Grid2
                container
                spacing={2}
                className="px-4 py-2"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Note</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{viewInvoiceData.note || "No notes"}</div>
                </Grid2>
              </Grid2>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading invoice details...</div>
        )}
      </ModalComp>

      {/* Edit Invoice modal */}
      <ModalComp
        open={editInvoiceOpen}
        onClose={handleEditInvoiceClose}
        title={"Edit Invoice Details"}
      >
        <form onSubmit={handleSubmitEdit(editInvoiceForm)}>
          <div className="mt-4 space-y-2">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectProject
                  {...registerEdit("project_id")}
                  label="Project Name"
                  options={projectData}
                />
                {errorsEdit.project_id && (
                  <small className="text-red-600">{errorsEdit.project_id.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectClient
                  {...registerEdit("client_id")}
                  label="Client Name"
                  options={clientData}
                />
                {errorsEdit.client_id && (
                  <small className="text-red-600">{errorsEdit.client_id.message}</small>
                )}
              </Grid2>
            </Grid2>
            
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="edit_amount">
                  Amount <span className="text-red-600">*</span>
                </label>
                <input
                  {...registerEdit("amount", { required: "Amount is required" })}
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  name="amount"
                  id="edit_amount"
                />
                {errorsEdit.amount && (
                  <small className="text-red-600">{errorsEdit.amount.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="edit_due_date">
                  Due Date <span className="text-red-600">*</span>
                </label>
                <input
                  {...registerEdit("due_date", { required: "Due date is required" })}
                  type="date"
                  name="due_date"
                  id="edit_due_date"
                />
                {errorsEdit.due_date && (
                  <small className="text-red-600">{errorsEdit.due_date.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="edit_address">
                  Address
                </label>
                <input
                  {...registerEdit("address")}
                  type="text"
                  placeholder="Address"
                  name="address"
                  id="edit_address"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectCountry
                  {...registerEdit("country")}
                  label="Country"
                  countries={countries}
                />
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="edit_phone_number">
                  Phone Number
                </label>
                <input
                  {...registerEdit("phone_number")}
                  type="text"
                  placeholder="Phone Number"
                  name="phone_number"
                  id="edit_phone_number"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPaymentMethod
                  {...registerEdit("payment_method")}
                  label="Payment Method"
                />
                {errorsEdit.payment_method && (
                  <small className="text-red-600">{errorsEdit.payment_method.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectStatus
                  {...registerEdit("status", { required: "Status is required" })}
                  label="Status"
                />
                {errorsEdit.status && (
                  <small className="text-red-600">{errorsEdit.status.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                  {...registerEdit("bank_account_id")}
                  label="Bank Account"
                  options={bankAccountData}
                />
                {errorsEdit.bank_account_id && (
                  <small className="text-red-600">{errorsEdit.bank_account_id.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }} className="inputData">
                <label htmlFor="edit_note">
                  Note
                </label>
                <textarea
                  {...registerEdit("note")}
                  rows={2}
                  placeholder="Note"
                  name="note"
                  id="edit_note"
                ></textarea>
              </Grid2>
            </Grid2>

            <div className="flex gap-3 flex-wrap justify-end">
              <CloseBtn onClick={handleEditInvoiceClose} disabled={submitting}>Close</CloseBtn>
              <PrimaryBtn type={"submit"} disabled={submitting || errorsEdit.isSubmitting}>
                {(submitting || errorsEdit.isSubmitting) ? "Submitting..." : "Submit"}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </ModalComp>

       {/* create invoice */}
       <ModalComp
        open={CreateInvoiceOpen}
        onClose={handleCreateInvoiceClose}
        title={"Create Invoice"}
      >
        <form onSubmit={handleSubmitCreate(createInvoiceForm)}>
          <div className="mt-4 space-y-2">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectProject
                  {...registerCreate("project_id")}
                  label="Project Name"
                  options={projectData}
                />
                {errorsCreate.project_id && (
                  <small className="text-red-600">{errorsCreate.project_id.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectClient
                  {...registerCreate("client_id")}
                  label="Client Name"
                  options={clientData}
                />
                {errorsCreate.client_id && (
                  <small className="text-red-600">{errorsCreate.client_id.message}</small>
                )}
              </Grid2>
            </Grid2>
            
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="amount">
                  Amount <span className="text-red-600">*</span>
                </label>
                <input
                  {...registerCreate("amount", { required: "Amount is required" })}
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  name="amount"
                  id="amount"
                />
                {errorsCreate.amount && (
                  <small className="text-red-600">{errorsCreate.amount.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="due_date">
                  Due Date <span className="text-red-600">*</span>
                </label>
                <input
                  {...registerCreate("due_date", { required: "Due date is required" })}
                  type="date"
                  name="due_date"
                  id="due_date"
                />
                {errorsCreate.due_date && (
                  <small className="text-red-600">{errorsCreate.due_date.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="address">
                  Address
                </label>
                <input
                  {...registerCreate("address")}
                  type="text"
                  placeholder="Address"
                  name="address"
                  id="address"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectCountry
                  {...registerCreate("country")}
                  label="Country"
                  countries={countries}
                />
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="phone_number">
                  Phone Number
                </label>
                <input
                  {...registerCreate("phone_number")}
                  type="text"
                  placeholder="Phone Number"
                  name="phone_number"
                  id="phone_number"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectPaymentMethod
                  {...registerCreate("payment_method")}
                  label="Payment Method"
                />
                {errorsCreate.payment_method && (
                  <small className="text-red-600">{errorsCreate.payment_method.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectStatus
                  {...registerCreate("status", { required: "Status is required" })}
                  label="Status"
                />
                {errorsCreate.status && (
                  <small className="text-red-600">{errorsCreate.status.message}</small>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <SelectBankAccount
                  {...registerCreate("bank_account_id")}
                  label="Bank Account"
                  options={bankAccountData}
                />
                {errorsCreate.bank_account_id && (
                  <small className="text-red-600">{errorsCreate.bank_account_id.message}</small>
                )}
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }} className="inputData">
                <label htmlFor="note">
                  Note
                </label>
                <textarea
                  {...registerCreate("note")}
                  rows={2}
                  placeholder="Note"
                  name="note"
                  id="note"
                ></textarea>
              </Grid2>
            </Grid2>

            <div className="flex gap-3 flex-wrap justify-end">
              <CloseBtn onClick={handleCreateInvoiceClose} disabled={submitting}>Close</CloseBtn>
              <PrimaryBtn type={"submit"} disabled={submitting || errorsCreate.isSubmitting}>
                {(submitting || errorsCreate.isSubmitting) ? "Submitting..." : "Submit"}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </ModalComp>

      {/* Download Invoice Modal */}
      <ModalComp
        open={DownloadInvoiceOpen}
        onClose={handleDownloadInvoiceClose}
        title={"Download Invoice"}
      >
        <div className="mt-4">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Invoice to Download:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => {
                const invoiceId = parseInt(e.target.value);
                const invoice = invoicesData.find(inv => inv.id === invoiceId);
                if (invoice) {
                  setSelectedInvoice(invoice);
                }
              }}
              value={selectedInvoice?.id || ""}
            >
              <option value="">Select an invoice</option>
              {invoicesData.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - {invoice.project?.title || 'N/A'} ({getCurrencySymbol(invoice.country)}{invoice.amount || 0})
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="mb-4 p-4 bg-gray-50 rounded border">
              <h4 className="font-bold mb-2">Invoice Preview:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Invoice Number:</strong> {selectedInvoice.invoice_number}</div>
                <div><strong>Project:</strong> {selectedInvoice.project?.title || 'N/A'}</div>
                <div><strong>Client:</strong> {selectedInvoice.client?.name || 'N/A'}</div>
                <div><strong>Amount:</strong> {getCurrencySymbol(selectedInvoice.country)}{selectedInvoice.amount || 0}</div>
                <div><strong>Status:</strong> {selectedInvoice.status || 'N/A'}</div>
                <div><strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap justify-end mt-4">
            <CloseBtn onClick={handleDownloadInvoiceClose}>Close</CloseBtn>
            <PrimaryBtn
              onClick={() => {
                if (!selectedInvoice) {
                  setShowError(true);
                  setShowMessage("Please select an invoice to download.");
                  setTimeout(() => setShowError(false), 3000);
                  return;
                }

                // Generate PDF using jsPDF
                const doc = new jsPDF();
                
                // Set title
                doc.setFontSize(20);
                doc.setTextColor(26, 27, 91); // Dark blue color
                doc.text('INVOICE', 105, 20, { align: 'center' });
                
                // Invoice details
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                
                let yPos = 35;
                doc.setFontSize(14);
                doc.text('Invoice Details', 14, yPos);
                yPos += 10;
                
                doc.setFontSize(11);
                doc.text(`Invoice Number: ${selectedInvoice.invoice_number || 'N/A'}`, 14, yPos);
                yPos += 7;
                doc.text(`Project: ${selectedInvoice.project?.title || 'N/A'}`, 14, yPos);
                yPos += 7;
                doc.text(`Client: ${selectedInvoice.client?.name || 'N/A'}`, 14, yPos);
                yPos += 7;
                doc.text(`Amount: ${getCurrencySymbol(selectedInvoice.country)}${selectedInvoice.amount || '0'}`, 14, yPos);
                yPos += 7;
                doc.text(`Status: ${selectedInvoice.status || 'N/A'}`, 14, yPos);
                yPos += 7;
                doc.text(`Due Date: ${formatDate(selectedInvoice.due_date)}`, 14, yPos);
                yPos += 10;

                // Address and contact
                if (selectedInvoice.address || selectedInvoice.country || selectedInvoice.phone_number) {
                  doc.setFontSize(14);
                  doc.text('Billing Information', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  
                  if (selectedInvoice.address) {
                    doc.text(`Address: ${selectedInvoice.address}`, 14, yPos);
                    yPos += 7;
                  }
                  if (selectedInvoice.country) {
                    doc.text(`Country: ${selectedInvoice.country}`, 14, yPos);
                    yPos += 7;
                  }
                  if (selectedInvoice.phone_number) {
                    doc.text(`Phone: ${selectedInvoice.phone_number}`, 14, yPos);
                    yPos += 7;
                  }
                  yPos += 5;
                }

                // Payment details
                if (selectedInvoice.payment_method || selectedInvoice.bank_account) {
                  doc.setFontSize(14);
                  doc.text('Payment Details', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  
                  if (selectedInvoice.payment_method) {
                    doc.text(`Payment Method: ${selectedInvoice.payment_method}`, 14, yPos);
                    yPos += 7;
                  }
                  if (selectedInvoice.bank_account?.account_holder_name) {
                    doc.text(`Bank Account: ${selectedInvoice.bank_account.account_holder_name}`, 14, yPos);
                    yPos += 7;
                  }
                  yPos += 5;
                }

                // Notes
                if (selectedInvoice.note) {
                  doc.setFontSize(14);
                  doc.text('Notes', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  const splitNote = doc.splitTextToSize(selectedInvoice.note, 180);
                  doc.text(splitNote, 14, yPos);
                  yPos += (splitNote.length * 7);
                }

                // Footer
                const pageHeight = doc.internal.pageSize.height;
                doc.setFontSize(10);
                doc.setTextColor(128, 128, 128);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, pageHeight - 20);
                doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });

                // Save PDF
                const fileName = `Invoice-${selectedInvoice.invoice_number || selectedInvoice.id}-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
                
                setShowSuccess(true);
                setShowMessage(`Invoice ${selectedInvoice.invoice_number} downloaded successfully.`);
                setTimeout(() => {
                  setShowSuccess(false);
                  handleDownloadInvoiceClose();
                }, 2000);
              }}
              disabled={!selectedInvoice}
            >
              Download PDF
            </PrimaryBtn>
          </div>
        </div>
      </ModalComp>

    </div>
  );
};

export default Invoices;

