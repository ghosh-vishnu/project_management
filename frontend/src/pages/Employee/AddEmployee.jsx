import React, { useEffect, useState, useRef, useCallback } from "react";

import { Breadcrumbs, Grid2, Typography } from "@mui/material";
import CloseBtn from "../../components/Buttons/CloseBtn";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import { Link } from "react-router";
import FileUploadInput from "../../components/Form/FileUploadInput";
import { useForm } from "react-hook-form";
import {
  AADHAR_REGEX,
  EMAIL_REGEX,
  NUMBER_ONLY_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from "../../utils";
import axios from "axios";
import BASE_API_URL from "../../data";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import { getToken } from "../../Token";

// Hardcoded departments and designations
const HARDCODED_DEPARTMENTS = [
  { id: 1, title: "Project Management" },
  { id: 2, title: "Development" },
  { id: 3, title: "Design" },
  { id: 4, title: "Quality Assurance" },
  { id: 5, title: "Human Resources" },
  { id: 6, title: "Sales & Marketing" },
  { id: 7, title: "Finance & Accounts" },
  { id: 8, title: "Support & Operations" },
  { id: 9, title: "IT Infrastructure" },
  { id: 10, title: "Research & Innovation" },
];

const DEPARTMENT_TO_DESIGNATIONS = {
  "Project Management": [
    "Project Manager",
    "Assistant Project Manager",
    "Project Coordinator",
    "Project Analyst",
  ],
  "Development": [
    "Full Stack Developer",
    "Backend Developer (Python/Django)",
    "Frontend Developer (React/Angular)",
    "Software Engineer",
    "Intern Developer",
  ],
  "Design": [
    "UI/UX Designer",
    "Graphic Designer",
    "Frontend Designer",
    "Creative Lead",
  ],
  "Quality Assurance": [
    "QA Engineer",
    "QA Lead",
    "Software Tester",
    "Automation Tester",
  ],
  "Human Resources": [
    "HR Manager",
    "HR Executive",
    "Talent Acquisition Specialist",
  ],
  "Sales & Marketing": [
    "Business Development Executive",
    "Sales Manager",
    "Digital Marketing Executive",
    "SEO Specialist",
  ],
  "Finance & Accounts": [
    "Accounts Executive",
    "Finance Officer",
    "Billing & Payroll Executive",
  ],
  "Support & Operations": [
    "Support Engineer",
    "Technical Support Executive",
    "Operations Manager",
  ],
  "IT Infrastructure": [
    "System Administrator",
    "Network Engineer",
    "Cloud Administrator",
  ],
  "Research & Innovation": [
    "R&D Specialist",
    "Product Researcher",
    "Data Analyst",
  ],
};

// Select dropdown for gender
const SelectOthers = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select {selectOption}</option>
        {options &&
          options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
      </select>
    </>
  )
);

// Select dropdown for designation
const SelectDesignation = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], disabled = false }, ref) => (
    <>
      <label htmlFor="employeeDesignation">
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select
        id="employeeDesignation"
        name={name}
        ref={ref}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      >
        <option value="">Select Designation</option>
        {options &&
          options.map((option, index) => (
            <option key={option.id ?? index} value={option.id ?? index}>
              {option.title}
            </option>
          ))}
      </select>
    </>
  )
);

// Select Dropdown for department
const SelectDepartment = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label htmlFor="employeeDeprtment">
        {label} <span className="text-red-600">*</span>{" "}
      </label>
      <select
        id="employeeDeprtment"
        name={name}
        ref={ref}
        onChange={onChange}
        onBlur={onBlur}
      >
        <option value="">Select {selectOption}</option>
        {options &&
          options.map((option, index) => (
            <option key={option.id ?? index} value={option.id ?? index}>
              {option.title}
            </option>
          ))}
      </select>
    </>
  )
);

// Select Dropdown for Status
const SelectStatus = React.forwardRef(({ onChange, onBlur, name }, ref) => (
  <>
    <label>
      Status <span className="text-red-600">*</span>{" "}
    </label>
    <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
      {/* <option value="">Select Status</option> */}
      <option value="true">Active</option>
      <option value="false">Not Active</option>
    </select>
  </>
));

// Select Dropdown for Country
const SelectCountry = React.forwardRef(
  ({ onChange, onBlur, name, countries = [] }, ref) => (
    <>
      <label>
        Country <span className="text-red-600">*</span>{" "}
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

// Select Dropdown for States
const SelectState = React.forwardRef(
  ({ onChange, onBlur, name, states, showAutoFillLabel }, ref) => (
    <>
      <label>
        State <span className="text-red-600">*</span>
        {showAutoFillLabel && <span className="text-xs text-gray-500 ml-2">(Auto-filled from PIN)</span>}
      </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select State</option>
        {states &&
          states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
      </select>
    </>
  )
);

const AddEmployee = () => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  // Fetching the data of Departments - Using hardcoded data
  const [departments, setDepartments] = useState(HARDCODED_DEPARTMENTS);
  const [designations, setDesignations] = useState([]);

  // Watch department_id to filter designations
  const selectedDepartment = watch("department_id");
  
  // Get designations based on selected department using hardcoded mapping
  useEffect(() => {
    if (selectedDepartment) {
      // Get department title from hardcoded list
      const dept = departments.find((d) => String(d.id) === String(selectedDepartment));
      const deptTitle = dept ? dept.title : "";
      
      // Get designations from hardcoded mapping
      if (deptTitle && DEPARTMENT_TO_DESIGNATIONS[deptTitle]) {
        const designationsList = DEPARTMENT_TO_DESIGNATIONS[deptTitle].map((title, idx) => ({
          id: idx.toString(), // Send just the index number
          title: title
        }));
        setDesignations(designationsList);
      } else {
        setDesignations([]);
      }
      
      // Clear designation when department changes
      setValue("designation_id", "");
    } else {
      setDesignations([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment]);

  // Same as current address variable
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  const currentCountry = watch("currentCountry");
  const currentState = watch("currentState");
  const currentCity = watch("currentCity");
  const currentPincode = watch("currentPincode");
  const currentAddress = watch("currentAddress");
  const permanentCountry = watch("permanentCountry");
  const permanentAddress = watch("permanentAddress");

  // Implemented the feature of same as current address
  useEffect(() => {
    if (sameAsCurrent) {
      setValue("permanentCountry", currentCountry);
      setValue("permanentState", currentState);
      setValue("permanentCity", currentCity);
      setValue("permanentPincode", currentPincode);
      setValue("permanentAddress", currentAddress);
    }
  }, [
    sameAsCurrent,
    currentCountry,
    currentState,
    currentCity,
    currentPincode,
    currentAddress,
    setValue,
  ]);

  useEffect(() => {
    if (!sameAsCurrent) {
      setValue("permanentCountry", "");
      setValue("permanentState", "");
      setValue("permanentCity", "");
      setValue("permanentPincode", "");
      setValue("permanentAddress", "");
    }
  }, [sameAsCurrent]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close current address suggestions if clicked outside
      if (currentAddressRef.current && !currentAddressRef.current.contains(event.target)) {
        setShowCurrentSuggestions(false);
      }
      
      // Close permanent address suggestions if clicked outside
      if (permanentAddressRef.current && !permanentAddressRef.current.contains(event.target)) {
        setShowPermanentSuggestions(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetching the name of countries
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
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
    // Function to fetch the data of countries
    fetchCountries();
  }, []);

  // Fetching the list of states according to the current country
  const [currentStates, setCurrentStates] = useState([]);

  useEffect(() => {
    const fetchCurrentStates = async (country) => {
      if (!country) {
        return;
      }

      try {
        const res = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            country: country,
          }
        );

        const stateList = res.data?.data?.states || [];
        const stateNames = stateList.map((s) => s.name);
        setCurrentStates(stateNames);
      } catch (error) {
        // console.error("Error fetching states:", error);
        setCurrentStates([]);
      }
    };

    fetchCurrentStates(currentCountry);
  }, [currentCountry]);

  // Fetching the list of states according to the permanent country
  const [permanentStates, setPermanentStates] = useState([]);
  useEffect(() => {
    const fetchPermanentStates = async (country) => {
      if (!country) {
        return;
      }

      try {
        const res = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            country: country,
          }
        );

        const stateList = res.data?.data?.states || [];
        const stateNames = stateList.map((s) => s.name);
        setPermanentStates(stateNames);
      } catch (error) {
        console.error("Error fetching states:", error);
        setPermanentStates([]);
      }
    };

    if (sameAsCurrent) {
      setPermanentStates(currentStates);
      setValue("permanentState", currentState);
    } else {
      fetchPermanentStates(permanentCountry);
    }
  }, [permanentCountry, sameAsCurrent, currentStates]);

  // Variables to show Error or success alert
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Resume parsing state
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // PIN code auto-fill states
  const [isLoadingCurrentPin, setIsLoadingCurrentPin] = useState(false);
  const [isLoadingPermanentPin, setIsLoadingPermanentPin] = useState(false);
  const [currentAddressSuggestions, setCurrentAddressSuggestions] = useState([]);
  const [permanentAddressSuggestions, setPermanentAddressSuggestions] = useState([]);
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const [showPermanentSuggestions, setShowPermanentSuggestions] = useState(false);

  // Clears RHF values and all local UI states after a successful submission
  const resetAfterSuccess = useCallback(() => {
    // Reset form values and validation states
    reset({}, { keepErrors: false, keepDirty: false, keepTouched: false, keepValues: false });

    // Clear auxiliary UI states
    setSameAsCurrent(false);
    setParsedData(null);
    setIsLoadingCurrentPin(false);
    setIsLoadingPermanentPin(false);

    setCurrentAddressSuggestions([]);
    setPermanentAddressSuggestions([]);
    setShowCurrentSuggestions(false);
    setShowPermanentSuggestions(false);

    // Clear dependent dropdown data
    setDesignations([]);

    // Also clear any file inputs left in the DOM
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      // eslint-disable-next-line no-param-reassign
      input.value = '';
    });
  }, [reset]);
  
  // Refs for dropdown containers
  const currentAddressRef = useRef(null);
  const permanentAddressRef = useRef(null);

  // Function to fetch city and state from PIN code
  const fetchCityStateFromPin = async (pincode, type = 'current') => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    const isLoading = type === 'current' ? setIsLoadingCurrentPin : setIsLoadingPermanentPin;
    const setSuggestions = type === 'current' ? setCurrentAddressSuggestions : setPermanentAddressSuggestions;
    const setField = type === 'current' ? 'current' : 'permanent';

    try {
      isLoading(true);
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data && response.data[0] && response.data[0].Status === 'Success') {
        const postOffice = response.data[0].PostOffice?.[0];
        
        if (postOffice) {
          const district = postOffice.District || postOffice.Block || '';
          const state = postOffice.State || '';
          
          setValue(`${setField}City`, district);
          setValue(`${setField}State`, state);
          
          // Collect address suggestions from all post offices
          const postOffices = response.data[0].PostOffice || [];
          const suggestions = postOffices.map(office => {
            const village = office.Name || '';
            const block = office.Block && office.Block !== office.Name ? office.Block : '';
            const district = office.District && office.District !== office.Name ? office.District : '';
            
            // Build address parts
            const addressParts = [];
            if (village) addressParts.push(village);
            if (block) addressParts.push(block);
            if (district) addressParts.push(district);
            
            const fullAddress = addressParts.join(', ') + (office.State ? `, ${office.State}` : '');
            
            return {
              village: village, // Village name for filtering
              display: village, // Display village name prominently
              full: fullAddress,
              pincode: office.Pincode,
              block: block,
              district: district,
              searchText: `${village} ${block} ${district}`.toLowerCase() // For filtering
            };
          });
          
          setSuggestions(suggestions);
          
          // Don't auto-show suggestions - user will click "Show Suggestions" button
          // This keeps the UI clean while typing
        }
      } else {
        // Invalid PIN code - clear fields
        setValue(`${setField}City`, '');
        setValue(`${setField}State`, '');
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching PIN code data:", error);
      // On error, clear fields
      setValue(`${setField}City`, '');
      setValue(`${setField}State`, '');
      setSuggestions([]);
    } finally {
      isLoading(false);
    }
  };

  // Function to handle address suggestion selection
  const handleAddressSuggestionClick = (suggestion, type) => {
    const setField = type === 'current' ? 'current' : 'permanent';
    setValue(`${setField}Address`, suggestion.full);
    
    // Hide suggestions after selection
    if (type === 'current') {
      setShowCurrentSuggestions(false);
    } else {
      setShowPermanentSuggestions(false);
    }
  };

  // Function to filter suggestions based on user typing
  const getFilteredSuggestions = (suggestions, searchText, type) => {
    if (!suggestions.length) return suggestions;
    if (!searchText || !searchText.trim()) return suggestions;
    
    const lowerSearch = searchText.toLowerCase().trim();
    return suggestions.filter(suggestion => 
      suggestion.searchText.includes(lowerSearch)
    );
  };

  // Handle current address input change
  const handleCurrentAddressChange = (e) => {
    const value = e.target.value;
    register("currentAddress").onChange(e);
    
    // Show dropdown only if typed text matches any suggestion
    if (currentAddressSuggestions.length > 0 && value.trim()) {
      const lowerValue = value.toLowerCase().trim();
      const hasMatch = currentAddressSuggestions.some(suggestion => 
        suggestion.searchText.includes(lowerValue)
      );
      
      if (hasMatch) {
        setShowCurrentSuggestions(true);
      } else {
        setShowCurrentSuggestions(false);
      }
    }
  };

  // Handle permanent address input change
  const handlePermanentAddressChange = (e) => {
    const value = e.target.value;
    register("permanentAddress").onChange(e);
    
    // Show dropdown only if typed text matches any suggestion
    if (permanentAddressSuggestions.length > 0 && value.trim()) {
      const lowerValue = value.toLowerCase().trim();
      const hasMatch = permanentAddressSuggestions.some(suggestion => 
        suggestion.searchText.includes(lowerValue)
      );
      
      if (hasMatch) {
        setShowPermanentSuggestions(true);
      } else {
        setShowPermanentSuggestions(false);
      }
    }
  };

  // Close suggestions handlers
  const closeCurrentSuggestions = () => {
    setShowCurrentSuggestions(false);
  };

  const closePermanentSuggestions = () => {
    setShowPermanentSuggestions(false);
  };

  // Debounced PIN code handlers
  const handleCurrentPinChange = (e) => {
    const value = e.target.value;
    setValue("currentPincode", value);
    
    if (value.length === 6) {
      // Wait 500ms before calling API (debounce)
      const timer = setTimeout(() => {
        fetchCityStateFromPin(value, 'current');
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Clear if not 6 digits
      setValue("currentCity", '');
      setValue("currentState", '');
      setCurrentAddressSuggestions([]);
    }
  };

  const handlePermanentPinChange = (e) => {
    const value = e.target.value;
    setValue("permanentPincode", value);
    
    if (value.length === 6) {
      // Wait 500ms before calling API (debounce)
      const timer = setTimeout(() => {
        fetchCityStateFromPin(value, 'permanent');
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Clear if not 6 digits
      setValue("permanentCity", '');
      setValue("permanentState", '');
      setPermanentAddressSuggestions([]);
    }
  };

  // Handle resume upload and parsing
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      setShowMessage("Please upload a PDF or DOCX file.");
      setShowError(true);
      return;
    }

    setIsParsingResume(true);
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setShowMessage("Not authenticated. Please login again.");
        setShowError(true);
        setIsParsingResume(false);
        return;
      }

      const response = await axios.post(
        `${BASE_API_URL}/peoples/parse-resume/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        setParsedData(response.data);
        
        // Auto-fill form fields
        if (response.data.EmployeeName) {
          setValue("name", response.data.EmployeeName);
        }
        if (response.data.FathersName) {
          setValue("father_name", response.data.FathersName);
        }
        if (response.data.Email) {
          setValue("email", response.data.Email);
        }
        if (response.data.ContactNumber) {
          setValue("contact_no", response.data.ContactNumber);
        }
        if (response.data.AlternateContact) {
          setValue("alternate_contact_no", response.data.AlternateContact);
        }
        if (response.data.Gender) {
          setValue("gender", response.data.Gender);
        }
        if (response.data.PAN) {
          setValue("pan_no", response.data.PAN);
        }
        if (response.data.Aadhaar) {
          setValue("aadhar_no", response.data.Aadhaar);
        }
        if (response.data.DOB) {
          // Convert DOB to date format (YYYY-MM-DD)
          try {
            const dobParts = response.data.DOB.split('/');
            if (dobParts.length === 3) {
              // Assume DD/MM/YYYY format
              const formattedDob = `${dobParts[2]}-${dobParts[1].padStart(2, '0')}-${dobParts[0].padStart(2, '0')}`;
              setValue("dob", formattedDob);
            }
          } catch (err) {
            console.log("Could not parse DOB");
          }
        }

        // Show success message with extracted fields count
        const extractedCount = Object.values(response.data).filter(v => v !== null && v !== 'confidences' && typeof v !== 'object').length;
        setShowMessage(`Resume parsed successfully! ${extractedCount} fields extracted and auto-filled.`);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      const errorMsg = error.response?.data?.error || "Failed to parse resume. Please check the file format.";
      setShowMessage(errorMsg);
      setShowError(true);
    } finally {
      setIsParsingResume(false);
      // Clear file input
      e.target.value = '';
    }
  };

  // Add employee form submit
  const employeeAddFormSubmit = async (data) => {
    

    try {
      const {
        email,
        is_active,
        password,
        confirm_password,
        currentAddress,
        currentCity,
        currentCountry,
        currentPincode,
        currentState,
        permanentAddress,
        permanentCity,
        permanentCountry,
        permanentPincode,
        permanentState,

        account_holder_name,
        account_number,
        branch,
        bank_name,
        ifsc_code,

        higher_education_certificate,
        pan_card,
        photo,
        resume,
        aadhar_card,

        ...formDataRest
      } = data;

      const formData = new FormData();
      // Append user info
      formData.append("user.email", email);
      formData.append("user.is_active", is_active);
      formData.append("user.password", password);
      formData.append("user.confirm_password", confirm_password);
      formData.append("user.user_type", "Employee");

      
        formData.append("current_address.address", currentAddress);
        formData.append("current_address.city" , currentCity,);
        formData.append("current_address.state", currentState);
        formData.append("current_address.pincode", currentPincode);
        formData.append("current_address.country", currentCountry);


        formData.append("permanent_address.address", permanentAddress);
        formData.append("permanent_address.city", permanentCity);
        formData.append("permanent_address.state", permanentState);
        formData.append("permanent_address.pincode", permanentPincode);
        formData.append("permanent_address.country", permanentCountry);

      // Append bank details
      formData.append("bank_details.account_holder_name", account_holder_name);
      formData.append("bank_details.bank_name", bank_name);
      formData.append("bank_details.account_number", account_number);
      formData.append("bank_details.ifsc_code", ifsc_code);
      formData.append("bank_details.branch", branch);

      // Append documents (files)
      formData.append(
        "documents.higher_education_certificate",
        higher_education_certificate[0]
      );
      formData.append("documents.resume", resume[0]);
      formData.append("documents.photo", photo[0]);
      formData.append("documents.aadhar_card", aadhar_card[0]);
      formData.append("documents.pan_card", pan_card[0]);

      // Add any remaining fields (like name, mobile, etc.)
      Object.entries(formDataRest).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.post(
          `${BASE_API_URL}/peoples/employee/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log(response.data);
        if (response.status == 201) {
          setShowMessage("Employee added successfully.");
          setShowSuccess(true);

          // Fully reset form and UI to allow adding another employee immediately
          resetAfterSuccess();
        }
      }
    } catch (error) {
      // console.log(error)
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
        else if(data.user?.email){
          
          setShowMessage("Employee with this email is already exist.");
        }
        else if (typeof data === 'object') {
          let messages = [];
      
          for (const field in data) {
            if (Array.isArray(data[field])) {
              messages.push(`${data[field][0]}`);
            }
          }
          setShowMessage(messages);
        }
        else {
          setShowMessage("Something went wrong. Please try again.");
        }
      } 
      setShowError(true);
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
      <div>
        <div className="w-full">
          <div className="">
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="/">
                Dashboard
              </Link>

              <Typography sx={{ color: "text.primary" }}>Employees</Typography>
            </Breadcrumbs>
          </div>

          <div className="mt-6 flex flex-row flex-wrap place-content-between  gap-x-2 gap-y-4">
            <div>
              <h4 className="text-2xl font-bold">Add New Employee</h4>
            </div>
            
            {/* Resume Parser Button */}
            <div className="relative">
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.docx,.doc"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <label
                htmlFor="resumeUpload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isParsingResume
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white cursor-pointer hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isParsingResume ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Upload Resume to Auto-Fill</span>
                  </>
                )}
              </label>
              {parsedData && parsedData.EmployeeName && (
                <span className="ml-2 text-green-600 font-medium">
                  ✓ {parsedData.EmployeeName}'s resume loaded
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form to add an employee */}
        <div className="mt-4 w-full">
          <form
            onSubmit={handleSubmit(employeeAddFormSubmit)}
            className="w-full"
            action=""
          >
            <div className="w-full ">
              <Grid2 container spacing={3}>
                {/* Employee details */}
                <Grid2
                  className="space-y-4 border-2 border-gray-300 rounded-[5px] p-4"
                  size={{ xs: 12, md: 6 }}
                >
                  <h4 className="font-bold">Employee Details</h4>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeName">
                        Employee Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        placeholder="Employee's Full Name"
                        type="text"
                        id="employeeName"
                        {...register("name", {
                          required: {
                            value: true,
                            message: "This field is required.",
                          },
                          minLength: {
                            value: 4,
                            message: "Length should be more than 4.",
                          },
                        })}
                      />
                      {errors.name && (
                        <small className="text-red-600">
                          {errors.name.message}{" "}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeEmail">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Employee's Email"
                        name="employeeEmail"
                        id="employeeEmail"
                        {...register("email", {
                          required: {
                            value: true,
                            message: "This field is required.",
                          },
                          pattern: {
                            value: EMAIL_REGEX,
                            message: "Email is invalid.",
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
                      <label htmlFor="employeeFather">
                        Father Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Employee's Father Name"
                        id="employeeFather"
                        {...register("father_name", {
                          required: "This field is required.",
                          minLength: {
                            value: 3,
                            message: "Length should be greater than 3",
                          },
                        })}
                      />
                      {errors.father_name && (
                        <small className="text-red-600">
                          {errors.father_name.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePhone">
                        Contact No. <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Employee's Contact No."
                        id="employeePhone"
                        {...register("contact_no", {
                          required: "This field is required.",
                          pattern: {
                            value: PHONE_REGEX,
                            message: "Contact no. is invalid. ",
                          },
                        })}
                      />
                      {errors.contact_no && (
                        <small className="text-red-600">
                          {errors.contact_no.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeAlternateContact">
                        Alternate Contact No.
                      </label>
                      <input
                        type="text"
                        placeholder="Employee's Father Name"
                        id="employeeAlternateContact"
                        {...register("alternate_contact_no", {
                          required: false,
                          pattern: {
                            value: PHONE_REGEX,
                            message: "Contact no. is invalid. ",
                          },
                          validate: (value) => {
                            const mainContact = getValues("contact_no");
                            return (
                              mainContact != value ||
                              "Contact no. and Alternate contact no. should not be same."
                            );
                          },
                        })}
                      />
                      {errors.alternate_contact_no && (
                        <small className="text-red-600">
                          {errors.alternate_contact_no.message}
                        </small>
                      )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectOthers
                        label={"Gender"}
                        options={["Male", "Female", "Others"]}
                        selectOption={"Gender"}
                        {...register("gender", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.gender && (
                        <small className="text-red-600">
                          {errors.gender.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePan">
                        PAN Card Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        placeholder="Employee's PAN Number (e.g., ABCDE1234F)"
                        type="text"
                        id="employeePan"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                        {...register("pan_no", {
                          required: "This field is required.",
                          minLength: {
                            value: 10,
                            message: "PAN must be exactly 10 characters.",
                          },
                          maxLength: {
                            value: 10,
                            message: "PAN must be exactly 10 characters.",
                          },
                          pattern: {
                            value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                            message: "Invalid PAN format. Must be like ABCDE1234F (5 letters + 4 digits + 1 letter).",
                          },
                        })}
                        onChange={(e) => {
                          // Auto-uppercase the input
                          e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          // Trigger onChange from register
                          register("pan_no").onChange(e);
                        }}
                      />
                      {errors.pan_no && (
                        <small className="text-red-600">
                          {errors.pan_no.message}
                        </small>
                      )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeAadhar">
                        Aadhar Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        placeholder="Employee's Aadhar Number"
                        type="text"
                        id="employeeAadhar"
                        {...register("aadhar_no", {
                          required: "This field is required.",
                          pattern: {
                            value: AADHAR_REGEX,
                            message:
                              "Adhaar no. is invalid or length is less than 12.",
                          },
                        })}
                      />
                      {errors.aadhar_no && (
                        <small className="text-red-600">
                          {errors.aadhar_no.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectDepartment
                        label={"Department"}
                        selectOption={"Department"}
                        options={departments}
                        {...register("department_id", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.department_id && (
                        <small className="text-red-600">
                          {errors.department_id.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectDesignation
                        label={"Designation"}
                        options={designations}
                        disabled={!selectedDepartment}
                        {...register("designation_id", {
                          required: "This field is required.",
                          validate: (value) => {
                            if (!selectedDepartment && value) {
                              return "Please select a department first";
                            }
                            return true;
                          },
                        })}
                      />
                      {!selectedDepartment && (
                        <small className="text-gray-500">
                          Please select a department first
                        </small>
                      )}
                      {errors.designation_id && (
                        <small className="text-red-600">
                          {errors.designation_id.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeDob">Date Of Birth</label>
                      <input
                        type="date"
                        id="employeeDob"
                        placeholder="Select DOB"
                        {...register("dob")}
                      />
                      {errors.dob && (
                        <small className="text-red-600">
                          {errors.dob.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeJoiningDate">
                        Joining Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        id="employeeJoiningDate"
                        placeholder="Select Joining Date"
                        {...register("joining_date", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.joining_date && (
                        <small className="text-red-600">
                          {errors.joining_date.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeSalary">
                        Basic Salary <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="employeeSalary"
                        type="number"
                        placeholder="Employee's Salary"
                        {...register("basic_salary", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.basic_salary && (
                        <small className="text-red-600">
                          {errors.basic_salary.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectStatus {...register("is_active")} />
                      {errors.is_active && (
                        <small className="text-red-600">
                          {errors.is_active.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePassword">
                        Password <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Employee's Password"
                        id="employeePassword"
                        {...register("password", {
                          required: "This field is required.",
                          pattern: {
                            value: PASSWORD_REGEX,
                            message:
                              "Password must contain a letter , a digit , a special character and minimum length should be 7.",
                          },
                        })}
                      />
                      {errors.password && (
                        <small className="text-red-600">
                          {errors.password.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeCPassword">
                        Confirm Password <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Employee's Confirm Password"
                        id="employeeCPassword"
                        {...register("confirm_password", {
                          required: "This field is required.",
                          validate: (value) => {
                            const password = getValues("password");
                            return (
                              password === value ||
                              "Password and Confirm password must be same."
                            );
                          },
                        })}
                      />
                      {errors.confirm_password && (
                        <small className="text-red-600">
                          {errors.confirm_password.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Employee Address */}
                <Grid2
                  className="space-y-4 border-2 border-gray-300 rounded-[5px] p-4"
                  size={{ xs: 12, md: 6 }}
                >
                  <h4 className="font-bold">Current Address</h4>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectCountry
                        countries={countries}
                        {...register("currentCountry", {
                          required: "This field is required.",
                        })}
                      />

                      {errors.currentCountry && (
                        <small className="text-red-600">
                          {errors.currentCountry.message}
                        </small>
                      )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectState
                        states={currentStates}
                        showAutoFillLabel={true}
                        {...register("currentState", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.currentState && (
                        <small className="text-red-600">
                          {errors.currentState.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeCurrentCity">
                        City <span className="text-red-600">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Auto-filled from PIN)</span>
                      </label>
                      <input
                        type="text"
                        id="employeeCurrentCity"
                        placeholder="Auto-filled from PIN code"
                        style={{ backgroundColor: currentCity ? '#f0f9ff' : 'white' }}
                        {...register("currentCity", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.currentCity && (
                        <small className="text-red-600">
                          {errors.currentCity.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePincode">
                        Pincode <span className="text-red-600">*</span>
                        {isLoadingCurrentPin && <span className="ml-2 text-blue-600 text-sm">Loading...</span>}
                      </label>
                      <input
                        placeholder="Enter 6-digit PIN code (e.g., 201301)"
                        type="number"
                        id="employeePincode"
                        maxLength={6}
                        {...register("currentPincode", {
                          required: "This field is required.",
                          minLength: {
                            value: 6,
                            message: "PIN code must be 6 digits.",
                          },
                          maxLength: {
                            value: 6,
                            message: "PIN code must be 6 digits.",
                          },
                        })}
                        onChange={handleCurrentPinChange}
                      />
                      {errors.currentPincode && (
                        <small className="text-red-600">
                          {errors.currentPincode.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} className="inputData relative" ref={currentAddressRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="employeeCurrentAddress" className="cursor-pointer">
                          Address <span className="text-red-600">*</span>
                          {currentAddressSuggestions.length > 0 && !showCurrentSuggestions && (
                            <span className="text-xs text-gray-500 ml-2">({currentAddressSuggestions.length} suggestions)</span>
                          )}
                        </label>
                        {currentAddressSuggestions.length > 0 && !showCurrentSuggestions && (
                          <button
                            type="button"
                            onClick={() => setShowCurrentSuggestions(true)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            📍 Show Suggestions
                          </button>
                        )}
                      </div>
                      
                      <textarea
                        rows={2}
                        placeholder={currentAddressSuggestions.length > 0 ? "Type address or click 'Show Suggestions' button above" : "Employee's Current Address"}
                        id="employeeCurrentAddress"
                        {...register("currentAddress", {
                          required: "This field is required.",
                        })}
                        onChange={handleCurrentAddressChange}
                      ></textarea>

                      {/* Address Suggestions Dropdown */}
                      {showCurrentSuggestions && currentAddressSuggestions.length > 0 && (() => {
                        const filtered = getFilteredSuggestions(currentAddressSuggestions, currentAddress, 'current');
                        const displayed = filtered;
                        
                        // Don't show if no suggestions to display
                        if (displayed.length === 0) return null;
                        
                        return (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div className="flex items-center justify-between text-xs text-gray-600 font-medium p-2 bg-gray-50 border-b">
                              <div className="flex items-center gap-2">
                                <span>🏘️ Village/Locality Suggestions ({displayed.length})</span>
                                {currentAddress && currentAddress.trim() && filtered.length !== currentAddressSuggestions.length && (
                                  <span className="text-blue-600">(filtered)</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={closeCurrentSuggestions}
                                className="px-2 py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-bold text-lg rounded"
                                title="Close suggestions (or click outside)"
                              >
                                ×
                              </button>
                            </div>
                            {displayed.slice(0, 8).map((suggestion, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleAddressSuggestionClick(suggestion, 'current')}
                              className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all"
                            >
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                <span className="text-blue-600">📍</span>
                                {suggestion.village}
                              </div>
                              {(suggestion.block || suggestion.district) && (
                                <div className="text-xs text-gray-600 mt-1 ml-5">
                                  {suggestion.block && <span>Block: {suggestion.block}</span>}
                                  {suggestion.block && suggestion.district && <span className="mx-1">•</span>}
                                  {suggestion.district && <span>District: {suggestion.district}</span>}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1 ml-5">{suggestion.full}</div>
                            </div>
                          ))}
                          </div>
                        );
                      })()}
                      
                      {errors.currentAddress && (
                        <small className="text-red-600">
                          {errors.currentAddress.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <div className="mt-8 flex justify-between items-center flex-wrap gap-x-4 gap-y-2">
                    <h4 className="font-bold">Permanent Address</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={(e) => setSameAsCurrent(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <span className="cursor-pointer">Same as Current Address</span>
                    </label>
                  </div>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectCountry
                        countries={countries}
                        {...register("permanentCountry", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.permanentCountry && (
                        <small className="text-red-600">
                          {errors.permanentCountry.message}
                        </small>
                      )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectState
                        states={permanentStates}
                        showAutoFillLabel={true}
                        {...register("permanentState", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.permanentState && (
                        <small className="text-red-600">
                          {errors.permanentState.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePermanentCity">
                        City <span className="text-red-600">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Auto-filled from PIN)</span>
                      </label>
                      <input
                        type="text"
                        id="employeePermanentCity"
                        placeholder="Auto-filled from PIN code"
                        style={{ backgroundColor: watch("permanentCity") ? '#f0f9ff' : 'white' }}
                        {...register("permanentCity", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.permanentCity && (
                        <small className="text-red-600">
                          {errors.permanentCity.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeePermanentPincode">
                        Pincode <span className="text-red-600">*</span>
                        {isLoadingPermanentPin && <span className="ml-2 text-blue-600 text-sm">Loading...</span>}
                      </label>
                      <input
                        placeholder="Enter 6-digit PIN code (e.g., 201301)"
                        type="number"
                        id="employeePermanentPincode"
                        maxLength={6}
                        {...register("permanentPincode", {
                          required: "This field is required.",
                          minLength: {
                            value: 6,
                            message: "PIN code must be 6 digits.",
                          },
                          maxLength: {
                            value: 6,
                            message: "PIN code must be 6 digits.",
                          },
                        })}
                        onChange={handlePermanentPinChange}
                      />
                      {errors.permanentPincode && (
                        <small className="text-red-600">
                          {errors.permanentPincode.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} className="inputData relative" ref={permanentAddressRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="employeePermanentAddress" className="cursor-pointer">
                          Address <span className="text-red-600">*</span>
                          {permanentAddressSuggestions.length > 0 && !showPermanentSuggestions && (
                            <span className="text-xs text-gray-500 ml-2">({permanentAddressSuggestions.length} suggestions)</span>
                          )}
                        </label>
                        {permanentAddressSuggestions.length > 0 && !showPermanentSuggestions && (
                          <button
                            type="button"
                            onClick={() => setShowPermanentSuggestions(true)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            📍 Show Suggestions
                          </button>
                        )}
                      </div>
                      
                      <textarea
                        rows={2}
                        placeholder={permanentAddressSuggestions.length > 0 ? "Type address or click 'Show Suggestions' button above" : "Employee's Permanent Address"}
                        id="employeePermanentAddress"
                        {...register("permanentAddress", {
                          required: "This field is required.",
                        })}
                        onChange={handlePermanentAddressChange}
                      ></textarea>

                      {/* Address Suggestions Dropdown */}
                      {showPermanentSuggestions && permanentAddressSuggestions.length > 0 && (() => {
                        const filtered = getFilteredSuggestions(permanentAddressSuggestions, permanentAddress, 'permanent');
                        const displayed = filtered;
                        
                        // Don't show if no suggestions to display
                        if (displayed.length === 0) return null;
                        
                        return (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div className="flex items-center justify-between text-xs text-gray-600 font-medium p-2 bg-gray-50 border-b">
                              <div className="flex items-center gap-2">
                                <span>🏘️ Village/Locality Suggestions ({displayed.length})</span>
                                {permanentAddress && permanentAddress.trim() && filtered.length !== permanentAddressSuggestions.length && (
                                  <span className="text-blue-600">(filtered)</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={closePermanentSuggestions}
                                className="px-2 py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-bold text-lg rounded"
                                title="Close suggestions (or click outside)"
                              >
                                ×
                              </button>
                            </div>
                            {displayed.slice(0, 8).map((suggestion, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleAddressSuggestionClick(suggestion, 'permanent')}
                              className="p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all"
                            >
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                <span className="text-blue-600">📍</span>
                                {suggestion.village}
                              </div>
                              {(suggestion.block || suggestion.district) && (
                                <div className="text-xs text-gray-600 mt-1 ml-5">
                                  {suggestion.block && <span>Block: {suggestion.block}</span>}
                                  {suggestion.block && suggestion.district && <span className="mx-1">•</span>}
                                  {suggestion.district && <span>District: {suggestion.district}</span>}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1 ml-5">{suggestion.full}</div>
                            </div>
                          ))}
                          </div>
                        );
                      })()}
                      
                      {errors.permanentAddress && (
                        <small className="text-red-600">
                          {errors.permanentAddress.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>
                </Grid2>
              </Grid2>

              <Grid2 className="mt-6" container spacing={3}>
                {/* Employee Documents */}
                <Grid2
                  className="space-y-4 border-2 border-gray-300 rounded-[5px] p-4"
                  size={{ xs: 12, md: 6 }}
                >
                  <h4 className="font-bold">Employee's Documents</h4>
                  <FileUploadInput
                    id={"employeePhoto"}
                    label={"Photo"}
                    required={true}
                    registerName={"photo"}
                    register={register}
                    errors={errors}
                    allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                    allowedFileTypesErrorMessage={
                      "Only .png, .jpeg, .jpg file types are allowed."
                    }
                  />
                  <FileUploadInput
                    id={"employeeHigherEducation"}
                    label={"Higher Education Certificate"}
                    required={true}
                    registerName={"higher_education_certificate"}
                    register={register}
                    errors={errors}
                    allowedFileTypes={["application/pdf"]}
                    allowedFileTypesErrorMessage={"Only pdf is allowed."}
                  />
                  <FileUploadInput
                    id={"employeeAadharFile"}
                    label={"Aadhar card"}
                    required={true}
                    registerName={"aadhar_card"}
                    register={register}
                    errors={errors}
                    allowedFileTypes={["application/pdf"]}
                    allowedFileTypesErrorMessage={"Only pdf is allowed."}
                  />
                  <FileUploadInput
                    id={"employeePanFile"}
                    label={"PAN card"}
                    required={true}
                    registerName={"pan_card"}
                    register={register}
                    errors={errors}
                    allowedFileTypes={["application/pdf"]}
                    allowedFileTypesErrorMessage={"Only pdf is allowed."}
                  />
                  <FileUploadInput
                    id={"employeeResume"}
                    label={"Resume"}
                    required={true}
                    registerName={"resume"}
                    register={register}
                    errors={errors}
                    allowedFileTypes={["application/pdf"]}
                    allowedFileTypesErrorMessage={"Only pdf is allowed."}
                  />
                </Grid2>

                {/* Employee Bank Details */}
                <Grid2
                  className="space-y-4 border-2 border-gray-300 rounded-[5px] p-4"
                  size={{ xs: 12, md: 6 }}
                >
                  <h4 className="font-bold">Employee's Bank Details</h4>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeAccountHolder">
                        Account Holder Name{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeAccountHolder"
                        placeholder="Employee's Account Holder Name"
                        {...register("account_holder_name", {
                          required: "This field is required.",
                          minLength: {
                            value: 3,
                            message: "Minimum length should be 3.",
                          },
                        })}
                      />
                      {errors.account_holder_name && (
                        <small className="text-red-600">
                          {errors.account_holder_name.message}
                        </small>
                      )}
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeBankName">
                        Bank Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeBankName"
                        placeholder="Employee's Bank Name"
                        {...register("bank_name", {
                          required: "This field is required.",
                          minLength: {
                            value: 2,
                            message: "Minimum length should be 2.",
                          },
                        })}
                      />
                      {errors.bank_name && (
                        <small className="text-red-600">
                          {errors.bank_name.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <label htmlFor="employeeAccountNumber">
                        Account Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeAccountNumber"
                        placeholder="Employee's Account Number"
                        {...register("account_number", {
                          required: "This field is required.",
                          minLength: {
                            value: 5,
                            message: "Minimum length should be 5.",
                          },
                          pattern: {
                            value: NUMBER_ONLY_REGEX,
                            message: "Account Number is not valid.",
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
                      <label htmlFor="employeeIfsc">
                        IFSC Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        placeholder="Employee's IFSC Code"
                        type="text"
                        id="employeeIfsc"
                        {...register("ifsc_code", {
                          required: "This field is required.",
                          minLength: {
                            value: 3,
                            message: "Minimum length should be 3.",
                          },
                        })}
                      />
                      {errors.ifsc_code && (
                        <small className="text-red-600">
                          {errors.ifsc_code.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} className="inputData">
                      <label htmlFor="employeeBankBranch">
                        Branch <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeBankBranch"
                        placeholder="Bank's Branch"
                        {...register("branch", {
                          required: "This field is required.",
                          minLength: {
                            value: 3,
                            message: "Minimum length should be 3.",
                          },
                        })}
                      />
                      {errors.branch && (
                        <small className="text-red-600">
                          {errors.branch.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>
                </Grid2>
              </Grid2>

              <div className="mt-4 flex gap-3 flex-wrap justify-end">
                <CloseBtn to={"/employee"}>Close</CloseBtn>
                <PrimaryBtn type={"Submit"} disabled={isSubmitting} className={`${isSubmitting ?" cursor-wait  ": "" }`}>
                {isSubmitting ? "Submitting": "Submit"}
              </PrimaryBtn>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
