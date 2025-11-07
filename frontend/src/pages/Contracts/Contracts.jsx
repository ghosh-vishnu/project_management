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
import BASE_API_URL from "../../data";
import { set, useForm } from "react-hook-form";


import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../utils";
import axios from "axios";
import ErrorAlert from "../../components/Alert/ErrorAlert";
import SuccessAlert from "../../components/Alert/SuccessAlert";
import { getToken } from "../../Token";

// select for lead
const SelectOption = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [],selectOption, defaultValue }, ref) => (
    <>
    <label>{label} <span className="text-red-600">*</span> </label>
    <select name={name} ref={ref} onChange={onChange} onBlur={onBlur} defaultValue={defaultValue}>
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

//select for status
const SelectOthers = React.forwardRef(
  ({ onChange, onBlur, name, label, options = [], selectOption }, ref) => (
    <>
      <label>{label} <span className="text-red-600">*</span> </label>
      <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
        <option value="">Select  {selectOption}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  )
);

const Contracts = () => {
 

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const startDateWatch = watch("start_date");


  // Pagination variables
  const [count, SetCount] = useState(0); 
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

  // Create contract modal
  const [createcontractsOpen, setCreatecontractsOpen] = useState(false);

  const handleCreatecontractsOpen = () => {
    reset({
      name: "",
        lead_name_id: "",
        start_date : "",
        end_date: "",
        status : "",
        description: "",
        budget: ""
    });
    setCreatecontractsOpen(true);
  };
  const handleCreatecontractsClose = () => {
    setCreatecontractsOpen(false);
  };

  // Edit contract Modal
  const [editcontractsOpen, setEditContractsOpen] = useState(false);

  const handleEditContractsOpen = (data) => {
    if (localStorage.getItem('contractsId')){
      localStorage.removeItem('contractsId')
    }
    localStorage.setItem('contractsId', data.id)
    
    // Use proposal_id from contract data if available, otherwise find by email match
    let proposalId = data.proposal_id || '';
    if (!proposalId && data?.lead_name?.email && proposalsFullData.length > 0) {
      // Fallback: find proposal by matching email (get most recent)
      const matchingProposals = proposalsFullData.filter(p => p.client_lead === data.lead_name.email);
      if (matchingProposals.length > 0) {
        const sortedProposals = matchingProposals.sort((a, b) => b.id - a.id);
        proposalId = sortedProposals[0].id;
      }
    }
    
    reset(
      {
        name: data.name,
        lead_name_id: proposalId || data.proposal_id || '',
        start_date : data.start_date,
        end_date: data.end_date,
        status : data.status,
        description: data.description,
        budget: data.budget
      }
    )
    setEditContractsOpen(true);
  };
  const handleEditContractsClose = () => {
    setEditContractsOpen(false);
  };

  // Delete contract Modal
  const [deletecontractsOpen, setDeletecontractsOpen] = useState(false);
  const handleDeletecontractsOpen = (data) => {
    if(localStorage.getItem('contractsId')){
      localStorage.removeItem('contractsId')
    }
    localStorage.setItem('contractsId',data.id)
    setDeletecontractsOpen(true);
  };
  const handleDeleteContractsClose = () => {
    setDeletecontractsOpen(false);
  };


  
  //contract data variable
  const[contractsData,setContractsData]=useState([]);

  // To fetch the contracts data list
const getContractsData = async (page,rowsPerPage) => {
  try {
    const accessToken = getToken("accessToken");
    if (accessToken) {
      const response = await axios.get(`${BASE_API_URL}/contracts/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params:{
          page :page+1,
          page_size :rowsPerPage,
        }
      });
      setContractsData(response.data.results);
      SetCount(response.data.count)
      // console.log(response.data.results)
    }
  } catch (error) {}
};

useEffect(()=>{
  getContractsData(page, rowsPerPage)
},[page, rowsPerPage])



//get proposal name data
const[proposalNameData,setProposalNameData] = useState();
const[proposalsFullData, setProposalsFullData] = useState([]); // Store full proposals data
const[leadsData, setLeadsData] = useState([]); // Store leads data for email to ID mapping

const getProposalNameData = async () =>{
  try {
    const accessToken = getToken("accessToken");
    const response = await axios.get(`${BASE_API_URL}/proposals/`,{
      headers:{
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page_size: 1000, // Get all proposals
      },
    });
    // Transform proposals data to match dropdown format
    if (response.data && response.data.results) {
      // Store full data for lookup
      setProposalsFullData(response.data.results);
      
      const proposals = response.data.results.map(proposal => ({
        id: proposal.id,
        name: proposal.proposal_title || `Proposal ${proposal.id}`,
        email: proposal.client_lead, // Store email for matching
      }));
      setProposalNameData(proposals);
    }
  } catch (error) {}
};

// Fetch leads data to map email to lead ID
const getLeadsData = async () => {
  try {
    const accessToken = getToken("accessToken");
    const response = await axios.get(`${BASE_API_URL}/peoples/leads/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page_size: 1000 },
    });
    if (response.data && response.data.results) {
      setLeadsData(response.data.results);
    }
  } catch (error) {}
};








  // View contract Modal
  const [viewcontractsOpen, setViewcontractsOpen] = useState(false);
  //contracts details vars
  const[contractDetailsData,setcontractsDetailsData] = useState({});
  const[proposalNameForView, setProposalNameForView] = useState('');
  
  //get contracts details dat
  const handleViewcontractsOpen = async(data) => {
    setViewcontractsOpen(true);
    setcontractsDetailsData(data);
    
    // Use proposal_id if available (exact match)
    if (data.proposal_id && proposalsFullData.length > 0) {
      const proposal = proposalsFullData.find(p => p.id === data.proposal_id);
      if (proposal) {
        setProposalNameForView(proposal.proposal_title || `Proposal ${proposal.id}`);
        return;
      }
    }
    
    // Fallback: Find proposal name based on lead email
    // Get most recent proposal if multiple exist
    if (data?.lead_name?.email && proposalsFullData.length > 0) {
      const leadEmail = data.lead_name.email;
      const matchingProposals = proposalsFullData.filter(p => p.client_lead === leadEmail);
      if (matchingProposals.length > 0) {
        // Sort by ID descending to get most recent, then get first
        const sortedProposals = matchingProposals.sort((a, b) => b.id - a.id);
        const proposal = sortedProposals[0];
        setProposalNameForView(proposal.proposal_title || `Proposal ${proposal.id}`);
      } else {
        // If not found in cached data, try fetching fresh
        try {
          const accessToken = getToken("accessToken");
          if (accessToken) {
            const response = await axios.get(`${BASE_API_URL}/proposals/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { page_size: 1000 },
            });
            if (response.data && response.data.results) {
              const matchingProposals = response.data.results.filter(p => p.client_lead === leadEmail);
              if (matchingProposals.length > 0) {
                const sortedProposals = matchingProposals.sort((a, b) => b.id - a.id);
                const proposal = sortedProposals[0];
                setProposalNameForView(proposal.proposal_title || `Proposal ${proposal.id}`);
              } else {
                setProposalNameForView(data.lead_name?.name || 'N/A');
              }
            } else {
              setProposalNameForView(data.lead_name?.name || 'N/A');
            }
          }
        } catch (error) {
          setProposalNameForView(data.lead_name?.name || 'N/A');
        }
      }
    } else {
      setProposalNameForView(data.lead_name?.name || 'N/A');
    }
  };
  const handleViewcontractsClose = () => {
    setViewcontractsOpen(false);
  };



  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Post API Call 
  const createContractForm = async (data) => {
    try {
      // Client-side date validation
      if (data?.start_date && data?.end_date) {
        const s = new Date(data.start_date);
        const e = new Date(data.end_date);
        if (isFinite(s) && isFinite(e) && e < s) {
          setShowError(true);
          setShowMessage("End Date must be on or after Start Date.");
          return;
        }
      }
      
      // data.lead_name_id contains the proposal ID (from SelectOption)
      // Find the proposal to get its email, then find matching lead
      let leadId = null;
      let proposalId = data.lead_name_id;
      
      if (proposalId) {
        // Find the proposal by ID
        const proposal = proposalsFullData.find(p => p.id === parseInt(proposalId));
        if (proposal && proposal.client_lead) {
          // Find lead by email
          const lead = leadsData.find(l => l.email === proposal.client_lead);
          if (lead) {
            leadId = lead.id;
          } else {
            setShowError(true);
            setShowMessage("Lead not found for the selected proposal.");
            return;
          }
        } else {
          setShowError(true);
          setShowMessage("Proposal not found.");
          return;
        }
      }
      
      const payload = { ...data, lead_name_id: leadId, proposal_id: proposalId };
      const accessToken = getToken("accessToken");
      const response = await axios.post(`${BASE_API_URL}/contracts/`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status == 201) {
        setShowSuccess(true);
        setShowMessage("contract created successfully.");
        reset();
        getContractsData(page, rowsPerPage);
        handleCreatecontractsClose();
      } else {
        setShowError(true);
        setShowMessage("contract doesn't created.");
      }
    } catch (error) {console.log (error)

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

  // Update api call
  const editContractForm = async (data) => {
    
    try {
      // Client-side date validation
      if (data?.start_date && data?.end_date) {
        const s = new Date(data.start_date);
        const e = new Date(data.end_date);
        if (isFinite(s) && isFinite(e) && e < s) {
          setShowError(true);
          setShowMessage("End Date must be on or after Start Date.");
          return;
        }
      }
      
      // data.lead_name_id contains the proposal ID (from SelectOption)
      // Find the proposal to get its email, then find matching lead
      let leadId = null;
      let proposalId = data.lead_name_id;
      
      if (proposalId) {
        // Find the proposal by ID
        const proposal = proposalsFullData.find(p => p.id === parseInt(proposalId));
        if (proposal && proposal.client_lead) {
          // Find lead by email
          const lead = leadsData.find(l => l.email === proposal.client_lead);
          if (lead) {
            leadId = lead.id;
          } else {
            setShowError(true);
            setShowMessage("Lead not found for the selected proposal.");
            return;
          }
        } else {
          setShowError(true);
          setShowMessage("Proposal not found.");
          return;
        }
      }
      
      const payload = { ...data, lead_name_id: leadId, proposal_id: proposalId };
      const accessToken = getToken("accessToken");
      const contractId = localStorage.getItem("contractsId");
      if (accessToken && contractId){
        const response = await axios.put(`${BASE_API_URL}/contracts/${contractId}/`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
       
        if (response.status == 200) {
          getContractsData(page, rowsPerPage);
          setShowSuccess(true);
          setShowMessage("Contract edited successfully.");
          handleEditContractsClose();
          
        } 
      }

    } catch (error) {
      setShowError(true);
      setShowMessage("Contract doesn't edited.");
    }
  };
// Use Effect
  useEffect(() => {
    // getContractsData(page, rowsPerPage);
   
    getProposalNameData();
    getLeadsData();
   
  }, []);


// Delete api call
const deleteContractData = async ()=>{
  try {
    const accessToken = getToken("accessToken");
    const contractId = localStorage.getItem("contractsId");
    // console.log("accesstoken", accessToken)
    // console.log("ti", contractId)
    if (accessToken && contractId){
      const response = await axios.delete(`${BASE_API_URL}/contracts/${contractId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.status == 204) {
        setShowSuccess(true);
        setShowMessage("Contract deleted successfully.");
        getContractsData(page, rowsPerPage)
        handleDeleteContractsClose();
      } 
    }
    
  } catch (error) {
    // console.log(error.response)
    setShowError(true);
    setShowMessage("Contract doesn't deleted.");
  }
}





  return (
    <div>
      {/*show alerts*/}
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
           {/* <breadcrumbs*/}
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" to={"/"}>
              Dashboard
            </Link>

            <Typography sx={{ color: "text.primary" }}>Contracts</Typography>
          </Breadcrumbs>
        
       {/*header*/}
        <div className="flex flex-row flex-wrap place-content-between mt-6  gap-x-2 gap-y-4">
        
            <h4 className="text-2xl font-bold">Contracts</h4>
            

          <PrimaryBtn onClick={handleCreatecontractsOpen}>
                          <AddIcon /> Create Contract
                        </PrimaryBtn>
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
                  <TableCell>Contract Name</TableCell>
                  <TableCell>Proposal Name</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contractsData &&
                  contractsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>
                        {(() => {
                          // Use proposal_id if available (exact match)
                          if (data.proposal_id && proposalsFullData.length > 0) {
                            const proposal = proposalsFullData.find(p => p.id === data.proposal_id);
                            if (proposal) {
                              return proposal.proposal_title || `Proposal ${proposal.id}`;
                            }
                          }
                          // Fallback: Find proposal name by matching lead email with proposal client_lead
                          // Get most recent proposal (highest ID) if multiple exist
                          if (data?.lead_name?.email && proposalsFullData.length > 0) {
                            const matchingProposals = proposalsFullData.filter(p => p.client_lead === data.lead_name.email);
                            if (matchingProposals.length > 0) {
                              // Sort by ID descending to get most recent, then get first
                              const sortedProposals = matchingProposals.sort((a, b) => b.id - a.id);
                              const proposal = sortedProposals[0];
                              return proposal.proposal_title || `Proposal ${proposal.id}`;
                            }
                            return data.lead_name?.name || 'N/A';
                          }
                          return data.lead_name?.name || 'N/A';
                        })()}
                      </TableCell>
                      <TableCell>{data.start_date}</TableCell>
                      <TableCell>{data.end_date}</TableCell>
                      <TableCell>{data.status}</TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleViewcontractsOpen(data)}
                          aria-label="edit"
                          color="success"
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditContractsOpen(data)}
                          aria-label="edit"
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() =>handleDeletecontractsOpen(data)}
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

        {/* Create contract Modal */}
        <ModalComp
          open={createcontractsOpen}
          onClose={handleCreatecontractsClose}
          title={"Create Contract"}
        >
          <form onSubmit={handleSubmit(createContractForm)} action="">
            <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractName">
                    Contract Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Contract Name"
                    type="text"
                    name="contractName"
                    id="contractName"
                    {...register("name", {
                      required: "This field id required.",
                      minLength: {
                        value: 4,
                        message: <span >Length should be greater than 3.</span>
                      },
                    })}
                  />
                  {errors.name && <small className="text-red-600">{errors.name.message}</small>}

                 
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                 <SelectOption
                  {...register("lead_name_id",{
                    required: "This field id required."
                  })}
                  label="Proposal Name"
                  options={proposalNameData}
                  selectOption={"Proposal Name"}
                />
                {errors.lead_name_id && (
                  <small className="text-red-600">{errors.lead_name_id.message}</small>)}
            
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    
                    placeholder="Start Date"
                    name="contractStartDate"
                    id="contractStartDate"

                    {...register("start_date",
                      {
                        required: "This field id required."
                      }
                    )
                    }
                  />
                  {errors.start_date && <small className="text-red-600">{errors.start_date.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    
                    placeholder="End Date"
                    name="contractEndDate"
                    id="contractEndDate"

                    {...register("end_date",{
                      required: "This field id required."
                    })
                    }
                    min={startDateWatch || undefined}
                  />
                  {errors.end_date && <small className="text-red-600">{errors.end_date.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                 <SelectOthers
                 {...register("status",{
                  required: "This field id required."
                 })}
                 label="Status"
                 options={["Pending","Active","Completed","Cancelled"]}
                 selectOption={"status"}
                 />
                  {errors.status && (
                    <small className="text-red-600">{errors.status.message}</small>

                 )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractBudget">
                    Budget <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contract Budget"
                    name="contractBudget"
                    id="contractBudget"

                    {...register("budget",{
                      required: "This field id required."
                    })
                    }
                  />
                  {errors.budget && <small className="text-red-600">{errors.budget.message}</small>}


                 
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
                    {...register("description",{
                      required: "This field id required."
                    })}
                  ></textarea>
                  {errors.description && (
                    <small className="text-red-600">{errors.description.message}</small>
                  )}
                  
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleCreatecontractsClose}>Close</CloseBtn>
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

        {/* Edit contract Modal */}
        <ModalComp
          title={"Edit contract"}
          open={editcontractsOpen}
          onClose={handleEditContractsClose}
        >
          <form onSubmit={handleSubmit(editContractForm)} action="">
          <div className="mt-4 space-y-2">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractName">
                    Contract Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    
                    placeholder="Contract Name"
                    type="text"
                    name="contractName"
                    id="contractName"
                    {...register("name", {
                      required: "This field id required.",
                      minLength: {
                        value: 4,
                        message: <span >Length should be greater than 3.</span>
                      },
                    })}
                  />
                  {errors.name && <small className="text-red-600">{errors.name.message}</small>}

                 
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                 <SelectOption
                  {...register("lead_name_id",{
                    required: "This field id required."
                  })}
                  label="Proposal Name"
                  options={proposalNameData}
                  selectOption={"Proposal Name"}
                />
                {errors.lead_name_id && (
                  <small className="text-red-600">{errors.lead_name_id.message}</small>)}
            
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractStartDate">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    
                    placeholder="Start Date"
                    name="contractStartDate"
                    id="contractStartDate"

                    {...register("start_date",
                      {
                        required: "This field id required."
                      }
                    )
                    }
                  />
                  {errors.start_date && <small className="text-red-600">{errors.start_date.message}</small>}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractEndDate">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    
                    placeholder="End Date"
                    name="contractEndDate"
                    id="contractEndDate"

                    {...register("end_date",{
                      required: "This field id required."
                    })
                    }
                  />
                  {errors.end_date && <small className="text-red-600">{errors.end_date.message}</small>}
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                 <SelectOthers
                 {...register("status",{
                  required: "This field id required."
                 })}
                 label="Status"
                 options={["Pending","Active","Completed","Cancelled"]}
                 selectOption={"status"}
                 />
                  {errors.status && (
                    <small className="text-red-600">{errors.status.message}</small>

                 )}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                  <label htmlFor="contractBudget">
                    Budget <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contract Budget"
                    name="contractBudget"
                    id="contractBudget"

                    {...register("budget",{
                      required: "This field id required."
                    })
                    }
                  />
                  {errors.budget && <small className="text-red-600">{errors.budget.message}</small>}


                 
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
                    {...register("description",{
                      required: "This field id required."
                    })}
                  ></textarea>
                  {errors.description && (
                    <small className="text-red-600">{errors.description.message}</small>
                  )}
                  
                </Grid2>
              </Grid2>

              <div className="flex gap-3 flex-wrap justify-end">
                <CloseBtn onClick={handleEditContractsClose}>Close</CloseBtn>
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

        {/* Delete contract Modal */}
        <ModalComp
          open={deletecontractsOpen}
          onClose={handleDeleteContractsClose}
        >
          <div className="w-full ">
            <div>Do you wand to delete ?</div>
            <div className="flex mt-8 justify-end gap-4">
              <CloseBtn
                onClick={handleDeleteContractsClose}
                className={"border border-gray"}
              >
                Close
              </CloseBtn>
              <DeleteBtn onClick={deleteContractData}>Delete</DeleteBtn>
            </div>
          </div>
        </ModalComp>

        {/* View contract Modal */}
        <ModalComp
          title={"contract Details"}
          open={viewcontractsOpen}
          onClose={handleViewcontractsClose}
        >
          {contractDetailsData &&
          <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
            <div className=" border    border-gray-500  rounded-[.5rem]">
              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold"> Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{contractDetailsData.name && contractDetailsData.name}</div>
                </Grid2>
              </Grid2>

              <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Proposal Name</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>{proposalNameForView || (contractDetailsData.lead_name && contractDetailsData.lead_name.name) || 'N/A'}</div>
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
                  <div>{contractDetailsData.start_date && contractDetailsData.start_date}</div>
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
                  <div>{contractDetailsData.end_date && contractDetailsData.end_date}</div>
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
                  <div>{contractDetailsData.status && contractDetailsData.status}</div>
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
                  <div>{contractDetailsData.budget && contractDetailsData.budget}</div>
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
                  <div>
                  {contractDetailsData.description && contractDetailsData.description}
                  </div>
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

export default Contracts;
