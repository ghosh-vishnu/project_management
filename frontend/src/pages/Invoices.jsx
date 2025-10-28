import React,{useState} from "react";

import { Breadcrumbs, Button, IconButton, Menu, MenuItem, Typography,Grid2 } from "@mui/material";
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


const Invoices = () => {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [modalOpen, setModalOpen] = React.useState(false);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

   // View Modal open and close
    const [viewOpen, setViewOpen] = useState(false);
    const handleViewOpen = () => {
      setViewOpen(true);
    };
    const handleViewClose = () => {
      setViewOpen(false);
    };
     // Delete modal open and close
      const [deleteOpen, setDeleteOpen] = useState(false);
      const handleDeleteOpen = () => {
        setDeleteOpen(true);
      };
      const handleDeleteClose = () => {
        setDeleteOpen(false);
      };

    // Edit Invoice Modal
      const [editInvoiceOpen, setEditInvoiceOpen] = useState(false);
      const handleEditInvoiceOpen = () => setEditInvoiceOpen(true);
      const handleEditInvoiceClose = () => setEditInvoiceOpen(false);
    
      // Tab panel in view modal
      const [activeTab, setActiveTab] = useState("Team Details");

       // Create invoice modal
       const [CreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
       const handleCreateInvoiceOpen = () => setCreateInvoiceOpen(true);
       const handleCreateInvoiceClose = () => setCreateInvoiceOpen(false);
     
       // Tab panel in view modal
       //const [activeTab, setActiveTab] = useState("Team Details");

       // Create invoice modal
       const [DownloadInvoiceOpen, setDownloadInvoiceOpen] = useState(false);
       const handleDownloadInvoiceOpen = () => setDownloadInvoiceOpen(true);
       const handleDownloadInvoiceClose = () => setDownloadInvoiceOpen(false);
     
  
  return (
    <div>
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
          {/* Card 1 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">Cloud Migration (#INV-001)</h5>
              <div className="mt-2 text-gray-500">Amount: $13000</div>
              <div className="bg-red-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Overdue
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2024-01-29</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">UI/UX design (#INV-002)</h5>
              <div className="mt-2 text-gray-500">Amount: $15000</div>
              <div className="bg-green-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Paid
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2024-03-22</div>
            </div>
          </div>

          {/* Card 3*/}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">API Intigration (#INV-003)</h5>
              <div className="mt-2 text-gray-500">Amount: $1000</div>
              <div className="bg-orange-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Pending
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2024-07-20</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">Cloud Migration (#INV-004)</h5>
              <div className="mt-2 text-gray-500">Amount: $1350</div>
              <div className="bg-red-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Overdue
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-06-27</div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">SEO Optimization(#INV-005)</h5>
              <div className="mt-2 text-gray-500">Amount: $13000</div>
              <div className="bg-green-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Paid
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-10-01</div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">Website Redesign (#INV-006)</h5>
              <div className="mt-2 text-gray-500">Amount: $13000</div>
              <div className="bg-red-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                pending
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-10-10</div>
            </div>
          </div>

          {/* Card 7 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">SEO Optimization (#INV-007)</h5>
              <div className="mt-2 text-gray-500">Amount: $15000</div>
              <div className="bg-green-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Paid
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-06-20</div>
            </div>
          </div>

          {/* Card 8*/}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">Cloud Migration (#INV-008)</h5>
              <div className="mt-2 text-gray-500">Amount: $1000</div>
              <div className="bg-orange-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Pending
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-01-17</div>
            </div>
          </div>

          {/* Card 9 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">WebSite Redesign(#INV-009)</h5>
              <div className="mt-2 text-gray-500">Amount: $3000</div>
              <div className="bg-red-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Overdue
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2024-01-29</div>
            </div>
          </div>

          {/* Card 10 */}
          <div className="flex justify-between gap-2 border border-gray-300 rounded-[10px] py-4 px-4">
            <div>
              <h5 className="text-[1.2rem] font-bold">E-Commerce Website (#INV-010)</h5>
              <div className="mt-2 text-gray-500">Amount: $23000</div>
              <div className="bg-green-500 rounded-2xl w-[9rem] text-center text-white mt-2 leading-[1.7rem]">
                Paid
              </div>
            </div>
            <div>
              <div className="leading-[.5rem] text-right cursor-pointer">
                <IconButton id="basic-button" onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleViewOpen}>
                    <Button startIcon={<RemoveRedEyeIcon />} color="inherit">View</Button>
                  </MenuItem>
                  <MenuItem onClick={handleEditInvoiceOpen}>
                    <Button startIcon={<EditIcon />} color="inherit">Edit</Button>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                    <Button startIcon={<DeleteIcon />} color="inherit">Delete</Button>
                  </MenuItem>
                </Menu>
              </div>
              <div className="mt-6">Due Date: 2025-05-15</div>
            </div>
          </div>

         
            
          
          {/* Delete Employee Modal */}
      <ModalComp open={deleteOpen} onClose={handleDeleteClose}>
        <div className="w-full ">
          <div>Do you wand to delete ?</div>
          <div className="flex mt-8 justify-end gap-4">
            <CloseBtn
              onClick={handleDeleteClose}
              className={"border border-gray"}
            >
              Close
            </CloseBtn>
            <DeleteBtn>Delete</DeleteBtn>
          </div>
        </div>
      </ModalComp>


          {/* View Modal */}
      <ModalComp
        title={"View Details"}
        open={viewOpen}
        onClose={handleViewClose}
      >
        <div className="mt-4 h-[30rem] no-scrollbar overflow-y-scroll">
          <div className="   rounded-[.5rem]">
            <div className="border-y border-gray-500 px-2 flex gap-y-2 gap-x-8 flex-row flex-1 ">
            
              
            </div>

            <div>
            <Grid2
                container
                spacing={2}
                className="border-b px-4 py-2 border-gray-500"
              >
                <Grid2 size={4}>
                  <div className="font-bold">Project Id</div>
                </Grid2>
                <Grid2 size={8}>
                  <div>id</div>
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
                  <div>project name</div>
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
                  <div>enter amount</div>
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
                  <div>pending/paid/overdue</div>
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
                  <div>12-04-2024</div>
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
                  <div>
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Vitae, ut!
                  </div>
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
                  <div>India</div>
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
                  <div>Bank Transaction</div>
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
                  <div>soma</div>
                </Grid2>
              </Grid2>
            </div>
          </div>
        </div>
      </ModalComp>

      {/* Edit employee modal */}
      <ModalComp
        open={editInvoiceOpen}
        onClose={handleEditInvoiceClose}
        title={"Edit Invoice Details"}
      >
        <form action="">
          <div className="mt-4 space-y-2">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="ProjectName">
                  Project Name <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  placeholder="Project Name"
                  type="text"
                  name="ProjectName"
                  id="ProjectName"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Project ID">
                Project ID<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project ID"
                  name="Project ID"
                  id="Project ID"
                />
                <small></small>
              </Grid2>
            </Grid2>
            
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Amount">
                Amount<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  name="Amount"
                  id="Amount"
                />
                <small></small>
              </Grid2>
            
            <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Address">
                Address<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  name="Address"
                  id="Address"
                />
                <small></small>
              </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Amount">
                  Phone No. <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  name="Amount"
                  id="Amount"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Payment Method">
                  Payment Method <span className="text-red-600">*</span>
                </label>
                <select required name="Payment Method" id="Payment Method">
                  <option value="">Select Role</option>
                  <option value="Online">Online</option>
                  <option value="Bank Transaction">Bank Transaction</option>
                  <option value="Other">Other</option>
                </select>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="employeeImage">
                  Profile Image <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  required
                  name="employeeImage"
                  id="employeeImage"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Status">
                  Status <span className="text-red-600">*</span>
                </label>
                <select name="Status" id="Status">
                  <option value="">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <small></small>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Bank Account">
                  Bank Account <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bank Account"
                  name="Bank Account"
                  id="Bank Account"
                />
                <small></small>
              </Grid2>
              
            </Grid2>

            

            

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }} className="inputData">
                <label htmlFor="note">
                  Note <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Note"
                  name="Note"
                  id="Note"
                ></textarea>
                <small></small>
              </Grid2>
            </Grid2>

            <div className="flex gap-3 flex-wrap justify-end">
              <CloseBtn onClick={handleClose}>Close</CloseBtn>
              <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
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
        <form action="">
          <div className="mt-4 space-y-2">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="ProjectName">
                  Project Name <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  placeholder="Project Name"
                  type="text"
                  name="ProjectName"
                  id="ProjectName"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Project ID">
                Project ID<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project ID"
                  name="Project ID"
                  id="Project ID"
                />
                <small></small>
              </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Address">
                Address<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  name="Address"
                  id="Address"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Amount">
                Amount<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  name="Amount"
                  id="Amount"
                />
                <small></small>
              </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Amount">
                  Phone No. <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  name="Amount"
                  id="Amount"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Payment Method">
                  Payment Method <span className="text-red-600">*</span>
                </label>
                <select required name="Payment Method" id="Payment Method">
                  <option value="">Select Role</option>
                  <option value="Online">Online</option>
                  <option value="Bank Transaction">Bank Transaction</option>
                  <option value="Other">Other</option>
                </select>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="employeeImage">
                  Profile Image <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  required
                  name="employeeImage"
                  id="employeeImage"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Status">
                  Status <span className="text-red-600">*</span>
                </label>
                <select name="Status" id="Status">
                  <option value="">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <small></small>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Bank Account">
                  Bank Account <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bank Account"
                  name="Bank Account"
                  id="Bank Account"
                />
                <small></small>
              </Grid2>
              
            </Grid2>

            

            

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }} className="inputData">
                <label htmlFor="note">
                  Note <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Note"
                  name="Note"
                  id="Note"
                ></textarea>
                <small></small>
              </Grid2>
            </Grid2>

            <div className="flex gap-3 flex-wrap justify-end">
              <CloseBtn onClick={handleClose}>Close</CloseBtn>
              <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
            </div>
          </div>
        </form>
      </ModalComp>

      {/* download invoice */}
      <ModalComp
        open={DownloadInvoiceOpen}
        onClose={handleDownloadInvoiceClose}
        title={"Download Invoice"}
      
      >
        <form action="">
          <div className="mt-4 space-y-2">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="ProjectName">
                  Project Name <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  placeholder="Project Name"
                  type="text"
                  name="ProjectName"
                  id="ProjectName"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Project ID">
                Project ID<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project ID"
                  name="Project ID"
                  id="Project ID"
                />
                <small></small>
              </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Address">
                Address<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  name="Address"
                  id="Address"
                />
                <small></small>
              </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Amount">
                  Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  name="Amount"
                  id="Amount"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Phone">
                Phone<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Phone"
                  name="Phone"
                  id="Phone"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Payment Method">
                  Payment Method <span className="text-red-600">*</span>
                </label>
                <select required name="Payment Method" id="Payment Method">
                  <option value="">Select Role</option>
                  <option value="Online">Online</option>
                  <option value="Bank Transaction">Bank Transaction</option>
                  <option value="Other">Other</option>
                </select>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="employeeImage">
                  Profile Image <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  required
                  name="employeeImage"
                  id="employeeImage"
                />
                <small></small>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Status">
                  Status <span className="text-red-600">*</span>
                </label>
                <select name="Status" id="Status">
                  <option value="">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <small></small>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }} className="inputData">
                <label htmlFor="Bank Account">
                  Bank Account <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bank Account"
                  name="Bank Account"
                  id="Bank Account"
                />
                <small></small>
              </Grid2>
              
            </Grid2>

            

            

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }} className="inputData">
                <label htmlFor="note">
                  Note <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Note"
                  name="Note"
                  id="Note"
                ></textarea>
                <small></small>
              </Grid2>
            </Grid2>

            <div className="flex gap-3 flex-wrap justify-end">
              <CloseBtn onClick={handleClose}>Close</CloseBtn>
              <PrimaryBtn type={"submit"}>Submit</PrimaryBtn>
            </div>
          </div>
        </form>
      </ModalComp>

     

        </div>
      </div>
    </div>
  );
};

export default Invoices;
