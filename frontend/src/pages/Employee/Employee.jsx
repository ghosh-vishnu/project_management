import React, { useEffect, useState } from "react";

import {
  Breadcrumbs,
  Button,
  Typography,
  Modal,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Grid2,
  Grid,
  TablePagination,
  InputAdornment,
  Select,
  FormControl,
  Chip,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import DownloadIcon from "@mui/icons-material/Download";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ReactMarkdown from "react-markdown";
import * as XLSX from 'xlsx';
import { data, Link, useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import { Edit, Delete, Add, Height, RemoveRedEye } from "@mui/icons-material";
import DeleteBtn from "../../components/Buttons/DeleteBtn";
import CloseBtn from "../../components/Buttons/CloseBtn";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ModalComp from "../../components/Modal/ModalComp";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import axios from "axios";
import BASE_API_URL from "../../data";
import { useForm } from "react-hook-form";

import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../utils";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import { getToken } from "../../Token";
import jsPDF from "jspdf";

const Employee = () => {
  // Helper function to mask account number
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return '****';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  };
  
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState([]);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // To show error and success alert
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Delete modal open and close
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteOpen = (data) => {
    if (localStorage.getItem("employeeId")) {
      localStorage.removeItem("employeeId");
    }
    // console.log(data.id)
    localStorage.setItem("employeeId", data.id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const [employeeDetailsData, setEmployeeDetailsData] = useState({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  
  // Collapsible sections state
  const [showDocuments, setShowDocuments] = useState(false);
  const [showCurrentAddress, setShowCurrentAddress] = useState(false);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  
  // View Modal open and close
  const [viewOpen, setViewOpen] = useState(false);
  const handleViewOpen = async (data) => {
    // Fetch full details from API
    const fullDetails = await fetchEmployeeDetails(data.id);
    if (fullDetails) {
      setEmployeeDetailsData(fullDetails);
    } else {
    setEmployeeDetailsData(data);
    }
    
    setShowAccountNumber(false); // Reset mask when opening new employee
    // Reset all collapsible sections
    setShowDocuments(false);
    setShowCurrentAddress(false);
    setShowPermanentAddress(false);
    setShowBankDetails(false);
    // console.log(data);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
  };

  const navigate = useNavigate();
  // Edit Employee Modal
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);

  const handleEditEmployeeOpen = (data) => {
    navigate(`/employee/edit/${data.id}`);

    // setEditEmployeeOpen(true);
  };
  const handleEditEmployeeClose = () => setEditEmployeeOpen(false);

  // Pagination variables
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showInactive, setShowInactive] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // Employee data variable
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployeeData, setFilteredEmployeeData] = useState([]);
  
  // Advanced features
  const [sortBy, setSortBy] = useState('name'); // name, date, department
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, grid
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [quickFilter, setQuickFilter] = useState('all'); // all, active, inactive, recent
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
  
  // AI Features State
  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [atRiskEmployees, setAtRiskEmployees] = useState([]);
  const [showNaturalLanguageSearch, setShowNaturalLanguageSearch] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: {}
  });

  // To fetch the employee data list
  const getEmployeeData = async (pageNumber, pageSize, showInactiveEmployees = false) => {
    try {
      setIsLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        console.error("No access token found. Please login again.");
        return;
      }
      
      console.log("Fetching employees with params:", { page: pageNumber + 1, page_size: pageSize, show_inactive: showInactiveEmployees });
      
      const response = await axios.get(`${BASE_API_URL}/peoples/employees/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1, // API might be 1-indexed, but TablePagination is 0-indexed
          page_size: pageSize,
          show_inactive: showInactiveEmployees,
        },
      });
      
      console.log("Employee API response:", response.data);
      setEmployeeData(response.data.results || []);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response?.status === 401) {
        console.error("Authentication failed. Please login again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch detailed employee data for view modal
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/employees/${employeeId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee details:", error);
      return null;
    }
  };

  // Calculate statistics
  useEffect(() => {
    if (employeeData.length > 0) {
      const activeCount = employeeData.filter(emp => emp.is_active).length;
      const inactiveCount = employeeData.length - activeCount;
      
      // Department stats
      const deptStats = {};
      employeeData.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        deptStats[dept] = (deptStats[dept] || 0) + 1;
      });
      
      setStats({
        total: employeeData.length,
        active: activeCount,
        inactive: inactiveCount,
        departments: deptStats
      });
    }
  }, [employeeData]);

  // Filter and sort employees
  useEffect(() => {
    let filtered = [...employeeData];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((employee) => {
        const name = (employee.name || '').toLowerCase();
        const email = (employee.email || employee.user?.email || '').toLowerCase();
        const designation = (employee.designation || '').toLowerCase();
        const contactNo = (employee.contact_no || '').toLowerCase();
        const employeeId = (employee.employee_id || '').toLowerCase();
        const department = (employee.department || '').toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          designation.includes(query) ||
          contactNo.includes(query) ||
          employeeId.includes(query) ||
          department.includes(query)
        );
      });
    }

    // Apply department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => (emp.department || 'Unassigned') === filterDepartment);
    }

    // Apply designation filter
    if (filterDesignation !== 'all') {
      filtered = filtered.filter(emp => (emp.designation || 'Unassigned') === filterDesignation);
    }

    // Apply quick filter
    if (quickFilter === 'active') {
      filtered = filtered.filter(emp => emp.is_active);
    } else if (quickFilter === 'inactive') {
      filtered = filtered.filter(emp => !emp.is_active);
    } else if (quickFilter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(emp => {
        const joiningDate = new Date(emp.joining_date);
        return joiningDate >= thirtyDaysAgo;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.joining_date || 0);
          bVal = new Date(b.joining_date || 0);
          break;
        case 'department':
          aVal = (a.department || 'Unassigned').toLowerCase();
          bVal = (b.department || 'Unassigned').toLowerCase();
          break;
        default:
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEmployeeData(filtered);
  }, [searchQuery, employeeData, sortBy, sortOrder, filterDepartment, filterDesignation, quickFilter]);

  // Use Effect
  useEffect(() => {
    getEmployeeData(page, rowsPerPage, showInactive);
  }, [page, rowsPerPage, showInactive]);
  
  // Get unique departments and designations for filters
  const uniqueDepartments = React.useMemo(() => {
    const depts = new Set();
    employeeData.forEach(emp => {
      if (emp.department) depts.add(emp.department);
    });
    return ['all', ...Array.from(depts).sort()];
  }, [employeeData]);

  const uniqueDesignations = React.useMemo(() => {
    const designations = new Set();
    employeeData.forEach(emp => {
      if (emp.designation) designations.add(emp.designation);
    });
    return ['all', ...Array.from(designations).sort()];
  }, [employeeData]);

  // Export to CSV function
  const exportToCSV = () => {
    const dataToExport = selectedEmployees.length > 0 
      ? filteredEmployeeData.filter(emp => selectedEmployees.includes(emp.id))
      : filteredEmployeeData;
    
    const headers = ['Name', 'Email', 'Contact', 'Department', 'Designation', 'Joining Date', 'Status'];
    const rows = dataToExport.map(emp => [
      emp.name || '',
      emp.email || emp.user?.email || '',
      emp.contact_no || '',
      emp.department || 'N/A',
      emp.designation || 'N/A',
      emp.joining_date || '',
      emp.is_active ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export to Excel function
  const exportToExcel = () => {
    const dataToExport = selectedEmployees.length > 0 
      ? filteredEmployeeData.filter(emp => selectedEmployees.includes(emp.id))
      : filteredEmployeeData;
    
    const worksheetData = [
      ['Name', 'Email', 'Contact', 'Department', 'Designation', 'Joining Date', 'Status'],
      ...dataToExport.map(emp => [
        emp.name || '',
        emp.email || emp.user?.email || '',
        emp.contact_no || '',
        emp.department || 'N/A',
        emp.designation || 'N/A',
        emp.joining_date || '',
        emp.is_active ? 'Active' : 'Inactive'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `employees-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF function
  const exportToPDF = () => {
    const dataToExport = selectedEmployees.length > 0 
      ? filteredEmployeeData.filter(emp => selectedEmployees.includes(emp.id))
      : filteredEmployeeData;
    
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255);
    doc.text('Employee List', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    dataToExport.forEach((emp, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${emp.name || 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.text(`Email: ${emp.email || emp.user?.email || 'N/A'}`, 20, yPos);
      yPos += 5;
      doc.text(`Contact: ${emp.contact_no || 'N/A'}`, 20, yPos);
      yPos += 5;
      doc.text(`Dept: ${emp.department || 'N/A'} | Designation: ${emp.designation || 'N/A'}`, 20, yPos);
      yPos += 5;
      doc.text(`Status: ${emp.is_active ? 'Active' : 'Inactive'}`, 20, yPos);
      yPos += 8;
    });
    
    doc.save(`employees-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Print function
  const printEmployees = () => {
    const printWindow = window.open('', '_blank');
    const dataToExport = selectedEmployees.length > 0 
      ? filteredEmployeeData.filter(emp => selectedEmployees.includes(emp.id))
      : filteredEmployeeData;
    
    const htmlContent = `
      <html>
        <head>
          <title>Employee List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Employee List</h1>
          <table>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
            </tr>
            ${dataToExport.map(emp => `
              <tr>
                <td>${emp.name || 'N/A'}</td>
                <td>${emp.email || emp.user?.email || 'N/A'}</td>
                <td>${emp.contact_no || 'N/A'}</td>
                <td>${emp.department || 'N/A'}</td>
                <td>${emp.designation || 'N/A'}</td>
                <td>${emp.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Bulk activate/deactivate
  const bulkActivate = async () => {
    try {
      const accessToken = getToken("accessToken");
      // Implementation for bulk activate
      setShowSuccess(true);
      setShowMessage(`Activated ${selectedEmployees.length} employees`);
      setSelectedEmployees([]);
      getEmployeeData(page, rowsPerPage, showInactive);
      setBulkActionAnchor(null);
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to activate employees");
    }
  };

  const bulkDeactivate = async () => {
    try {
      const accessToken = getToken("accessToken");
      // Implementation for bulk deactivate
      setShowSuccess(true);
      setShowMessage(`Deactivated ${selectedEmployees.length} employees`);
      setSelectedEmployees([]);
      getEmployeeData(page, rowsPerPage, showInactive);
      setBulkActionAnchor(null);
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to deactivate employees");
    }
  };

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployeeData.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployeeData.map(emp => emp.id));
    }
  };

  // AI-Powered Features
  const fetchAIInsights = async () => {
    try {
      setLoadingInsights(true);
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/ai/insights/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAiInsights(response.data.insights || 'No insights available');
      setShowAiInsights(true);
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to fetch AI insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchChurnPrediction = async () => {
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.get(`${BASE_API_URL}/peoples/ai/churn-prediction/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAtRiskEmployees(response.data.at_risk_employees || []);
    } catch (error) {
      console.error("Error fetching churn prediction:", error);
    }
  };

  const handleNaturalLanguageSearch = async () => {
    if (!nlQuery.trim()) return;
    
    try {
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/peoples/ai/natural-language-search/`,
        { query: nlQuery },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      // Apply filters from AI response
      if (response.data.filters?.department) {
        setFilterDepartment(response.data.filters.department);
      }
      if (response.data.filters?.status) {
        setQuickFilter(response.data.filters.status);
      }
      
      // Show results message
      setShowSuccess(true);
      setShowMessage(`Found ${response.data.results?.length || 0} employees matching your query`);
      setShowNaturalLanguageSearch(false);
      setNlQuery('');
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to process natural language query");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleEditFormSubmit = (data) => {
    const formData = { user: {} };
    formData["user"]["email"] = data.email;
    formData["user"]["is_active"] = data.is_active;
    formData["user"]["user_type"] = data.user_type;
    formData["phone"] = data.phone;
    formData["name"] = data.name;
    formData["email"] = data.email;
    formData["country"] = data.country;
    formData["state"] = data.state;
    formData["pincode"] = data.pincode;
    formData["address"] = data.address;
    formData["joining_date"] = data.joining_date;
    formData["gender"] = data.gender;
    formData["profile_image"] = data.profile_image;
    // console.log(formData)
  };
  // Delete api call
  const deleteData = async () => {
    try {
      const accessToken = getToken("accessToken");
      const employeeId = localStorage.getItem("employeeId");

      if (accessToken && employeeId) {
        const response = await axios.delete(
          `${BASE_API_URL}/peoples/employees/${employeeId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status == 200 || response.status == 204) {
          getEmployeeData(page, rowsPerPage, showInactive);
          setShowSuccess(true);
          setShowMessage("Employee deactivated successfully.");
          handleDeleteClose();
        }
      }
    } catch (error) {
      setShowError(true);
      setShowMessage("Failed to deactivate employee.");
    }
  };
  return (
    <div>
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
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>

          <Typography sx={{ color: "text.primary" }}>Employees</Typography>
        </Breadcrumbs>
      </div>

      {/* Statistics Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Employees</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.total}</Typography>
              </div>
              <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </div>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Active</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.active}</Typography>
              </div>
              <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </div>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Inactive</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.inactive}</Typography>
              </div>
              <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </div>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Departments</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{Object.keys(stats.departments).length}</Typography>
              </div>
              <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-row flex-wrap place-content-between  gap-x-2 gap-y-4">
        <div>
          <h4 className="text-2xl font-bold">Employee Management</h4>
        </div>
        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0,0,0,0.54)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: 'rgba(0,0,0,0.54)' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: '280px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '8px',
              },
            }}
          />
          
          {/* Sort By */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ backgroundColor: 'white' }}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.54)', mr: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="date">Joining Date</MenuItem>
              <MenuItem value="department">Department</MenuItem>
            </Select>
          </FormControl>

          {/* Sort Order */}
          <Tooltip title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}>
            <IconButton
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{ 
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.23)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </IconButton>
          </Tooltip>

          {/* Export Menu */}
          <Tooltip title="Export Options">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              disabled={filteredEmployeeData.length === 0}
              sx={{ 
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.23)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { exportToCSV(); setAnchorEl(null); }}>
              <FileDownloadIcon sx={{ mr: 1, fontSize: 18 }} /> Export to CSV
            </MenuItem>
            <MenuItem onClick={() => { exportToExcel(); setAnchorEl(null); }}>
              <FileDownloadIcon sx={{ mr: 1, fontSize: 18 }} /> Export to Excel
            </MenuItem>
            <MenuItem onClick={() => { exportToPDF(); setAnchorEl(null); }}>
              <PictureAsPdfIcon sx={{ mr: 1, fontSize: 18 }} /> Export to PDF
            </MenuItem>
            <MenuItem onClick={() => { printEmployees(); setAnchorEl(null); }}>
              <PrintIcon sx={{ mr: 1, fontSize: 18 }} /> Print
            </MenuItem>
          </Menu>
          
          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <>
              <Tooltip title="Bulk Actions">
                <IconButton
                  onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                  sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: '1px solid #1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={bulkActionAnchor}
                open={Boolean(bulkActionAnchor)}
                onClose={() => setBulkActionAnchor(null)}
              >
                <MenuItem onClick={bulkActivate}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'green' }} /> Activate Selected ({selectedEmployees.length})
                </MenuItem>
                <MenuItem onClick={bulkDeactivate}>
                  <CancelIcon sx={{ mr: 1, color: 'red' }} /> Deactivate Selected ({selectedEmployees.length})
                </MenuItem>
                <MenuItem onClick={() => { exportToCSV(); setBulkActionAnchor(null); }}>
                  <FileDownloadIcon sx={{ mr: 1 }} /> Export Selected
                </MenuItem>
              </Menu>
            </>
          )}

          {/* View Toggle */}
          <Tooltip title={viewMode === 'list' ? 'Grid View' : 'List View'}>
            <IconButton
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              sx={{ 
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.23)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>

          <button
            onClick={() => getEmployeeData(page, rowsPerPage, showInactive)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showInactive
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showInactive ? '👁️ Hide Inactive' : '👁️ Show Inactive'}
          </button>
          <Link to={"/employee/add"}>
            <PrimaryBtn onClick={handleOpen}>
              <AddIcon /> Add Employee
            </PrimaryBtn>
          </Link>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white mt-4 px-4 py-3 rounded-lg shadow-md flex gap-2 items-center flex-wrap">
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>Quick Filters:</Typography>
        <Chip
          label="All"
          onClick={() => setQuickFilter('all')}
          color={quickFilter === 'all' ? 'primary' : 'default'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label="Active"
          onClick={() => setQuickFilter('active')}
          color={quickFilter === 'active' ? 'primary' : 'default'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label="Inactive"
          onClick={() => setQuickFilter('inactive')}
          color={quickFilter === 'inactive' ? 'primary' : 'default'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          icon={<AccessTimeIcon />}
          label="Recent (30 days)"
          onClick={() => setQuickFilter('recent')}
          color={quickFilter === 'recent' ? 'primary' : 'default'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      </div>

      {/* Advanced Filters */}
      <div className="bg-white mt-4 px-4 py-3 rounded-lg shadow-md flex gap-3 items-center flex-wrap">
        <FilterListIcon sx={{ color: 'rgba(0,0,0,0.54)' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Advanced Filters:</Typography>
        
        {/* Department Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            displayEmpty
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {uniqueDepartments.filter(d => d !== 'all').map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Designation Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            displayEmpty
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="all">All Designations</MenuItem>
            {uniqueDesignations.filter(d => d !== 'all').map((desig) => (
              <MenuItem key={desig} value={desig}>{desig}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Active Filters Chips */}
        {(filterDepartment !== 'all' || filterDesignation !== 'all') && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterDepartment !== 'all' && (
              <Chip
                label={`Dept: ${filterDepartment}`}
                onDelete={() => setFilterDepartment('all')}
                size="small"
                color="primary"
              />
            )}
            {filterDesignation !== 'all' && (
              <Chip
                label={`Designation: ${filterDesignation}`}
                onDelete={() => setFilterDesignation('all')}
                size="small"
                color="primary"
              />
            )}
          </Box>
        )}
      </div>

      {/* Data list table */}
      <div className="bg-white mt-4 px-4 py-2 rounded-lg shadow-[2px_2px_5px_2px] shadow-gray-400">
        {/* Search Results Info */}
        {(searchQuery || filterDepartment !== 'all' || filterDesignation !== 'all') && (
          <div className="py-3 border-b border-gray-200">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {filteredEmployeeData.length > 0 
                ? `Found ${filteredEmployeeData.length} employee${filteredEmployeeData.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No employees found matching "${searchQuery}"`
              }
            </Typography>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-gray-600">Loading employees...</div>
          </div>
        ) : filteredEmployeeData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-gray-600">
              {searchQuery ? `No employees found matching "${searchQuery}"` : "No employees found"}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {searchQuery 
                ? "Try adjusting your search query or clear the search to see all employees."
                : showInactive 
                  ? "No inactive employees found" 
                  : "No active employees found. Try adding a new employee or show inactive employees."
              }
            </div>
          </div>
        ) : viewMode === 'list' ? (
          filteredEmployeeData.map((data) => (
          <div
            key={data.id}
            className={`flex justify-between items-center border-b p-3 hover:bg-gray-50 transition-colors ${
              selectedEmployees.includes(data.id) ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            {/* Selection Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedEmployees.includes(data.id)}
                onChange={() => toggleEmployeeSelection(data.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex gap-4 ">
                <div className="w-[3rem] h-[3rem] overflow-hidden ">
                  <img
                    className=" w-full h-full rounded-[50%]"
                    src="/profile.png"
                    alt="profile"
                    loading="true"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{data.name}</p>
                  <p className="text-sm text-gray-500">
                    {data.email || data.user?.email} — {data.designation || 'Employee'}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span>📞 {data.contact_no}</span>
                    <span>Joined: {new Date(data.joining_date).toLocaleDateString('en-IN')}</span>
                    <span className={`font-semibold ${data.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {data.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Tooltip title="View Details">
                <IconButton
                  onClick={() => handleViewOpen(data)}
                  aria-label="view"
                  color="success"
                  size="small"
                >
                  <RemoveRedEyeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Employee">
                <IconButton
                  color="warning"
                  onClick={() => handleEditEmployeeOpen(data)}
                  size="small"
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Call">
                <IconButton
                  onClick={() => window.open(`tel:${data.contact_no}`)}
                  color="primary"
                  size="small"
                >
                  <PhoneIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email">
                <IconButton
                  onClick={() => window.open(`mailto:${data.email || data.user?.email}`)}
                  color="info"
                  size="small"
                >
                  <EmailIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <IconButton
                  onClick={() => {
                    const phone = data.contact_no?.replace(/\D/g, '');
                    if (phone) {
                      window.open(`https://wa.me/${phone}`, '_blank');
                    }
                  }}
                  color="success"
                  size="small"
                  disabled={!data.contact_no}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleDeleteOpen(data)}
                  aria-label="delete"
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {filteredEmployeeData.map((data) => (
              <Card
                key={data.id}
                sx={{
                  border: selectedEmployees.includes(data.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => toggleEmployeeSelection(data.id)}
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {data.name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {data.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {data.employee_id || 'N/A'}
                        </Typography>
                      </div>
                    </div>
                    <Chip
                      label={data.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={data.is_active ? 'success' : 'error'}
                      sx={{ height: 24 }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 16 }} />
                      {data.email || data.user?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16 }} />
                      {data.contact_no || 'N/A'}
                    </Typography>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {data.department && (
                        <Chip label={data.department} size="small" variant="outlined" />
                      )}
                      {data.designation && (
                        <Chip label={data.designation} size="small" variant="outlined" color="primary" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOpen(data);
                        }}
                        color="success"
                      >
                        <RemoveRedEyeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEmployeeOpen(data);
                        }}
                        color="warning"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Call">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${data.contact_no}`);
                        }}
                        color="primary"
                      >
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Email">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${data.email || data.user?.email}`);
                        }}
                        color="info"
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination - Only show if not searching */}
        {!searchQuery && (
          <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[25, 50, 100]}
          />
        )}
      </div>

      {/* Delete Employee Modal */}
      <ModalComp open={deleteOpen} onClose={handleDeleteClose}>
        <div className="w-full ">
          <div>Do you want to deactivate this employee? They will not be able to login, but their data will be preserved.</div>
          <div className="flex mt-8 justify-end gap-4">
            <CloseBtn
              onClick={handleDeleteClose}
              className={"border border-gray"}
            >
              Close
            </CloseBtn>
            <DeleteBtn onClick={deleteData}>Deactivate</DeleteBtn>
          </div>
        </div>
      </ModalComp>

      {/* View Modal */}

      <ModalComp
        title={"Employee Details"}
        open={viewOpen}
        onClose={handleViewClose}
        maxWidth={1200}
      >
        {employeeDetailsData && (
          <div className="mt-4 h-fit no-scrollbar overflow-y-scroll border-t border-gray-500">
            <div className="     ">
              <Grid2 container spacing={2} className="mt-4">
                <Grid2 size={{xs:12, md:6}} className=" ">
                  <div className="border border-gray-500 rounded-[.5rem] px-2 flex gap-y-2 gap-x-8 flex-row flex-1 ">
                    <div className="">
                      <div className="overflow-hidden w-[10rem] h-[10rem]">
                        <img
                          className=" w-full h-full rounded-[50%]"
                          src={employeeDetailsData.documents?.photo}
                          alt="Employee Image"
                          loading="true"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="">
                        <h2 className="text-xl font-bold">
                          {employeeDetailsData.name}
                        </h2>
                        <p className="text-gray-600">
                          {employeeDetailsData.employee_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-500 rounded-[.5rem] mt-4">
                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Email</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.user?.email}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Contact no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.contact_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Alternate contact no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.alternate_contact_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Father Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.father_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Gender</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.gender}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Pan Card no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.pan_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Aadhar Card no.</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.aadhar_no}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">D.O.B</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData?.dob}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Department</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.department || 'N/A'}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Designation</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.designation || 'N/A'}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Joining Date</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div>{employeeDetailsData.joining_date}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-0 px-4 py-2 border-gray-500"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold">Status</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="w-fit text-white ">
                          {" "}
                          {employeeDetailsData.user?.is_active == true ? (
                            <p className="bg-green-700 px-4  rounded-[2.5rem]">
                              Active
                            </p>
                          ) : (
                            <p className="bg-red-700  px-4  rounded-[2.5rem]">
                              Not Active
                            </p>
                          )}
                        </div>
                      </Grid2>
                    </Grid2>
                  </div>

                  {/* Documents Section - Enhanced UI */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div 
                      className="font-bold text-lg text-blue-700 bg-blue-100 px-4 py-3 border-b border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={() => setShowDocuments(!showDocuments)}
                    >
                      <span className="flex items-center gap-2">📄 Documents</span>
                      <span className="text-xs font-normal">{showDocuments ? '▼' : '▶'}</span>
                    </div>
                    {showDocuments && employeeDetailsData.documents && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {employeeDetailsData.documents?.higher_education_certificate && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">📜 Higher Education Certificate</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.higher_education_certificate, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                          </div>
                          )}
                          
                          {employeeDetailsData.documents?.resume && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">📑 Resume</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.resume, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                        </div>
                          )}
                          
                          {employeeDetailsData.documents?.aadhar_card && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🆔 Aadhar Card</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.aadhar_card, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                        </div>
                          )}
                          
                          {employeeDetailsData.documents?.pan_card && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🪪 PAN Card</span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => window.open(employeeDetailsData.documents?.pan_card, '_blank')}
                                >
                                  View →
                                </button>
                          </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Grid2>

                <Grid2 size={{xs:12, md:6}}>
                  {/* Current Address - Enhanced UI */}
                  <div className="border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <div 
                      className="font-bold text-lg text-green-700 bg-green-100 px-4 py-3 border-b border-green-200 flex items-center justify-between cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => setShowCurrentAddress(!showCurrentAddress)}
                    >
                      <span className="flex items-center gap-2">📍 Current Address</span>
                      <span className="text-xs font-normal">{showCurrentAddress ? '▼' : '▶'}</span>
                    </div>
                    {showCurrentAddress && employeeDetailsData.current_address && (
                      <div>
                        <div className="px-4 py-2 flex gap-2 bg-white border-b border-green-200">
                          <button 
                            className="text-xs text-green-600 hover:text-green-800 font-medium bg-white px-2 py-1 rounded border border-green-300"
                            onClick={() => {
                              const addr = employeeDetailsData.current_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              navigator.clipboard.writeText(address);
                              alert('Address copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-white px-2 py-1 rounded border border-blue-300"
                            onClick={() => {
                              const addr = employeeDetailsData.current_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                            }}
                          >
                            🗺️ View Map
                          </button>
                        </div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.city}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.state}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-green-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.pincode}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.current_address?.country}
                            </div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  {/* Permanent Address - Enhanced UI */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                    <div 
                      className="font-bold text-lg text-purple-700 bg-purple-100 px-4 py-3 border-b border-purple-200 flex items-center justify-between cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => setShowPermanentAddress(!showPermanentAddress)}
                    >
                      <span className="flex items-center gap-2">🏠 Permanent Address</span>
                      <span className="text-xs font-normal">{showPermanentAddress ? '▼' : '▶'}</span>
                    </div>
                    {showPermanentAddress && employeeDetailsData.permanent_address && (
                      <div>
                        <div className="px-4 py-2 flex gap-2 bg-white border-b border-purple-200">
                          <button 
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium bg-white px-2 py-1 rounded border border-purple-300"
                            onClick={() => {
                              const addr = employeeDetailsData.permanent_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              navigator.clipboard.writeText(address);
                              alert('Address copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-white px-2 py-1 rounded border border-blue-300"
                            onClick={() => {
                              const addr = employeeDetailsData.permanent_address;
                              const address = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`;
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                            }}
                          >
                            🗺️ View Map
                          </button>
                        </div>
                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Address</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">
                              {employeeDetailsData.permanent_address?.address}
                            </div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">City</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.city}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">State</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.state}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-b px-4 py-2 border-purple-200"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Pin code</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.pincode}</div>
                          </Grid2>
                        </Grid2>

                        <Grid2
                          container
                          spacing={2}
                          className="border-0 px-4 py-2"
                        >
                          <Grid2 size={4}>
                            <div className="font-bold text-gray-700">Country</div>
                          </Grid2>
                          <Grid2 size={8}>
                            <div className="text-gray-600">{employeeDetailsData.permanent_address?.country}</div>
                          </Grid2>
                        </Grid2>
                      </div>
                    )}
                  </div>

                  {/* Bank Details - Enhanced UI with Masked Account */}
                  <div className="mt-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <div 
                      className="font-bold text-lg text-orange-700 bg-orange-100 px-4 py-3 border-b border-orange-200 flex items-center justify-between cursor-pointer hover:bg-orange-200 transition-colors"
                      onClick={() => setShowBankDetails(!showBankDetails)}
                    >
                      <span className="flex items-center gap-2">🏦 Bank Details</span>
                      <span className="text-xs font-normal">{showBankDetails ? '▼' : '▶'}</span>
                    </div>
                    {showBankDetails && employeeDetailsData.bank_details && (
                      <div>
                        <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Account Holder Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.account_holder_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Bank Name</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.bank_name}</div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Account Number</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showAccountNumber 
                              ? employeeDetailsData.bank_details?.account_number 
                              : maskAccountNumber(employeeDetailsData.bank_details?.account_number)}
                          </span>
                          <button
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            {showAccountNumber ? '👁️ Hide' : '👁️ Show'}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(employeeDetailsData.bank_details?.account_number);
                              alert('Account number copied!');
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-b px-4 py-2 border-orange-200"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">IFSC Code</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-600">{employeeDetailsData.bank_details?.ifsc_code}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(employeeDetailsData.bank_details?.ifsc_code);
                              alert('IFSC code copied!');
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium bg-white px-2 py-1 rounded border border-orange-300"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </Grid2>
                    </Grid2>

                    <Grid2
                      container
                      spacing={2}
                      className="border-0 px-4 py-2"
                    >
                      <Grid2 size={4}>
                        <div className="font-bold text-gray-700">Branch</div>
                      </Grid2>
                      <Grid2 size={8}>
                        <div className="text-gray-600">{employeeDetailsData.bank_details?.branch}</div>
                      </Grid2>
                    </Grid2>
                      </div>
                    )}
                  </div>

                </Grid2>
              </Grid2>
            </div>
            
            {/* Download and Print Buttons */}
            <div className="mt-6 flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => {
                  // Generate PDF using jsPDF
                  const doc = new jsPDF();
                  
                  // Set title
                  doc.setFontSize(18);
                  doc.setTextColor(0, 0, 255);
                  doc.text('Employee Details', 105, 20, { align: 'center' });
                  
                  // Personal Information
                  doc.setFontSize(14);
                  doc.setTextColor(0, 0, 0);
                  doc.text('Personal Information', 14, 35);
                  
                  let yPos = 45;
                  doc.setFontSize(11);
                  doc.text(`Name: ${employeeDetailsData.name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Email: ${employeeDetailsData.user?.email || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Contact: ${employeeDetailsData.contact_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Alternate Contact: ${employeeDetailsData.alternate_contact_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Father Name: ${employeeDetailsData.father_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Gender: ${employeeDetailsData.gender || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`PAN Card: ${employeeDetailsData.pan_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Aadhar Card: ${employeeDetailsData.aadhar_no || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`DOB: ${employeeDetailsData.dob || 'N/A'}`, 14, yPos);
                  yPos += 10;
                  
                  // Employment Details
                  doc.setFontSize(14);
                  doc.text('Employment Details', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  doc.text(`Department: ${employeeDetailsData.department?.title || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Designation: ${employeeDetailsData.designation?.title || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Joining Date: ${employeeDetailsData.joining_date || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Status: ${employeeDetailsData.user?.is_active ? 'Active' : 'Inactive'}`, 14, yPos);
                  yPos += 10;
                  
                  // Current Address
                  doc.setFontSize(14);
                  doc.text('Current Address', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  const currentAddress = `${employeeDetailsData.current_address?.address || 'N/A'}, ${employeeDetailsData.current_address?.city || 'N/A'}, ${employeeDetailsData.current_address?.state || 'N/A'} - ${employeeDetailsData.current_address?.pincode || 'N/A'}`;
                  doc.text(currentAddress, 14, yPos);
                  yPos += 10;
                  
                  // Permanent Address
                  doc.setFontSize(14);
                  doc.text('Permanent Address', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  const permanentAddress = `${employeeDetailsData.permanent_address?.address || 'N/A'}, ${employeeDetailsData.permanent_address?.city || 'N/A'}, ${employeeDetailsData.permanent_address?.state || 'N/A'} - ${employeeDetailsData.permanent_address?.pincode || 'N/A'}`;
                  doc.text(permanentAddress, 14, yPos);
                  yPos += 10;
                  
                  // Bank Details
                  doc.setFontSize(14);
                  doc.text('Bank Details', 14, yPos);
                  yPos += 10;
                  doc.setFontSize(11);
                  doc.text(`Account Holder: ${employeeDetailsData.bank_details?.account_holder_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Bank Name: ${employeeDetailsData.bank_details?.bank_name || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Account Number: ${employeeDetailsData.bank_details?.account_number || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`IFSC Code: ${employeeDetailsData.bank_details?.ifsc_code || 'N/A'}`, 14, yPos);
                  yPos += 7;
                  doc.text(`Branch: ${employeeDetailsData.bank_details?.branch || 'N/A'}`, 14, yPos);
                  
                  // Save PDF
                  doc.save(`employee-${employeeDetailsData.name}-details.pdf`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                📥 Download PDF
              </button>
              
              <button
                onClick={() => {
                  // Print employee details
                  window.print();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        )}
      </ModalComp>

      {/* for Add Emloyee modal */}

      {/* Edit employee modal */}
    </div>
  );
};

export default Employee;
