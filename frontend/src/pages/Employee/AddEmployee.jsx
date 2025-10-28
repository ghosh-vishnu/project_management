import React, { useEffect, useState } from "react";

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
// Fallback options in case API is empty/unavailable
const FALLBACK_DEPARTMENTS = [
  { id: 101, title: "Project Management" },
  { id: 102, title: "Development" },
  { id: 103, title: "Design" },
  { id: 104, title: "Quality Assurance" },
  { id: 105, title: "Human Resources" },
  { id: 106, title: "Sales & Marketing" },
  { id: 107, title: "Finance & Accounts" },
  { id: 108, title: "Support & Operations" },
  { id: 109, title: "IT Infrastructure" },
  { id: 110, title: "Research & Innovation" },
];

const DEPARTMENT_TO_DESIGNATIONS = {
  "Project Management": [
    "Project Manager",
    "Assistant Project Manager",
    "Project Coordinator",
    "Project Analyst",
  ],
  Development: [
    "Full Stack Developer",
    "Backend Developer (Python/Django)",
    "Frontend Developer (React/Angular)",
    "Software Engineer",
    "Intern Developer",
  ],
  Design: [
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

const FALLBACK_DESIGNATIONS_ALL = Object.values(DEPARTMENT_TO_DESIGNATIONS)
  .flat()
  .map((title, idx) => ({ id: `fd-${idx}`, title }));

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
  ({ onChange, onBlur, name, states }, ref) => (
    <>
      <label>
        State <span className="text-red-600">*</span>{" "}
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

  // Fetching the data of Departments
  const [departments, setDepartments] = useState([]);
  const fetchDepartments = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(
          `${BASE_API_URL}/peoples/departments/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const apiDepartments = Array.isArray(response.data) ? response.data : [];
        // If API returns empty, fallback to local seed list
        if (apiDepartments.length > 0) {
          setDepartments(apiDepartments);
        } else {
          setDepartments(FALLBACK_DEPARTMENTS);
        }
      }
    } catch (error) {
      // On error, use fallback departments so the user can proceed
      setDepartments(FALLBACK_DEPARTMENTS);
    }
  };

  // Fetching the data of Designations
  const [designations, setDesignations] = useState([]);
  const fetchDesignations = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken) {
        const response = await axios.get(
          `${BASE_API_URL}/peoples/designations/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const apiDesignations = Array.isArray(response.data) ? response.data : [];
        if (apiDesignations.length > 0) {
          setDesignations(apiDesignations);
        } else {
          // If API returns empty, show all fallback designations
          setDesignations(FALLBACK_DESIGNATIONS_ALL);
        }
      }
    } catch (error) {
      // Fallback to static list on error
      setDesignations(FALLBACK_DESIGNATIONS_ALL);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  // Fetch filtered designations based on department
  const fetchDesignationsForDepartment = async (departmentId) => {
    try {
      const accessToken = getToken("accessToken");
      if (accessToken && departmentId) {
        const response = await axios.get(
          `${BASE_API_URL}/peoples/designations/?department_id=${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const apiDesignations = Array.isArray(response.data) ? response.data : [];
        if (apiDesignations.length > 0) {
          setDesignations(apiDesignations);
        } else {
          // Fallback: map departmentId to title from local list and filter
          const dept = (departments || []).find((d) => String(d.id) === String(departmentId));
          const deptTitle = dept ? dept.title : "";
          const fallback = (DEPARTMENT_TO_DESIGNATIONS[deptTitle] || []).map((title, idx) => ({ id: `fd-${departmentId}-${idx}`, title }));
          setDesignations(fallback);
        }
      }
    } catch (error) {
      // Fallback to static mapping on error
      const dept = (departments || []).find((d) => String(d.id) === String(departmentId));
      const deptTitle = dept ? dept.title : "";
      const fallback = (DEPARTMENT_TO_DESIGNATIONS[deptTitle] || []).map((title, idx) => ({ id: `fe-${departmentId}-${idx}`, title }));
      setDesignations(fallback);
    }
  };

  // Watch department_id to filter designations
  const selectedDepartment = watch("department_id");
  
  // Fetch designations when department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchDesignationsForDepartment(selectedDepartment);
      // Clear designation when department changes
      setValue("designation_id", "");
    } else {
      fetchDesignations();
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
          // To reset the form
          reset()
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
                        placeholder="Employee's PAN Number"
                        type="text"
                        id="employeePan"
                        {...register("pan_no", {
                          required: "This field is required.",
                          minLength: {
                            value: 4,
                            message: "Length should be more than 4.",
                          },
                        })}
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
                        // options={["IT", "HR", "MANAGEMENT"]}
                        selectOption={"Department"}
                        options={departments}
                        {...register("department_id", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.department && (
                        <small className="text-red-600">
                          {errors.department.message}
                        </small>
                      )}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                      <SelectDesignation
                        label={"Designation"}
                        options={designations}
                        {...register("designation_id", {
                          required: "This field is required.",
                          validate: (value) => {
                            if (!selectedDepartment && value) {
                              return "Please select a department first";
                            }
                            return true;
                          },
                        })}
                        disabled={!selectedDepartment}
                      />
                      {!selectedDepartment && (
                        <small className="text-gray-500">
                          Please select a department first
                        </small>
                      )}
                      {errors.department_id && (
                        <small className="text-red-600">
                          {errors.department_id.message}
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
                      </label>
                      <input
                        type="text"
                        id="employeeCurrentCity"
                        placeholder="Employee's Current City"
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
                      </label>
                      <input
                        placeholder="Employee's Current pincode"
                        type="number"
                        id="employeePincode"
                        {...register("currentPincode", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.currentPincode && (
                        <small className="text-red-600">
                          {errors.currentPincode.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} className="inputData">
                      <label htmlFor="employeeCurrentAddress">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Employee's Current Address"
                        id="employeeCurrentAddress"
                        {...register("currentAddress", {
                          required: "This field is required.",
                        })}
                      ></textarea>
                      {errors.currentAddress && (
                        <small className="text-red-600">
                          {errors.currentAddress.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <div className="mt-8 flex justify-between flex-wrap gap-x-4 ">
                    <h4 className="font-bold ">Permanent Address</h4>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={(e) => setSameAsCurrent(e.target.checked)}
                      />
                      <span>Same as Current Address</span>
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
                      </label>
                      <input
                        type="text"
                        id="employeePermanentCity"
                        placeholder="Employee's Permanent City"
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
                      </label>
                      <input
                        placeholder="Employee's pincode"
                        type="number"
                        id="employeePermanentPincode"
                        {...register("permanentPincode", {
                          required: "This field is required.",
                        })}
                      />
                      {errors.permanentPincode && (
                        <small className="text-red-600">
                          {errors.permanentPincode.message}
                        </small>
                      )}
                    </Grid2>
                  </Grid2>

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} className="inputData">
                      <label htmlFor="employeePermanentAddress">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Employee's Permanent Address"
                        id="employeePermanentAddress"
                        {...register("permanentAddress", {
                          required: "This field is required.",
                        })}
                      ></textarea>
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
