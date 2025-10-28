
import './App.css'
import Contracts from './pages/Contracts/Contracts';
import Income from './pages/Finance/Income';
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices';
import Project from './pages/Project'
import Tasks from './pages/Tasks';
import { BrowserRouter, Routes, Route } from "react-router";
import Leads from './pages/Leads';
import Login from './pages/Login';
import Teams from './pages/Teams';
import Meetings from './pages/Meetings';
import Clients from './pages/Clients';
import Employee from './pages/Employee/Employee';


import Bank from './pages/Setting/Bank';
// import Setting from './pages/Setting';

import Expenses from './pages/Finance/Expenses'
import AllProposals from './pages/Proposals/AllProposals';
import Tickets from './pages/Tickets';
import ResetPassword from './pages/ResetPassword';
import Logout from './pages/Logout';
import ToDo from './pages/ToDo';
import Profile from './pages/Profile';
import AddEmployee from './pages/Employee/AddEmployee';
import EditEmployee from './pages/Employee/EditEmployee';
import Layout from './pages/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout/>} >
          <Route index  element = {<Dashboard/>}/>
        <Route path='/employee'  element = {<Employee/>}/>
        <Route path='/employee/add'  element = {<AddEmployee/>}/>
        <Route path='/employee/edit/:employeeId'  element = {<EditEmployee/>}/>
        <Route path='/income'  element = {<Income/>}/>
        <Route path='/teams'  element = {<Teams/>}/>
        <Route path='/meetings'  element = {<Meetings/>}/>
        <Route path='/projects'  element = {<Project/>}/>
        <Route path='/tasks'  element = {<Tasks/>}/>
        <Route path='/contracts'  element = {<Contracts/>}/>
        <Route path='/invoices'  element = {<Invoices/>}/>
        <Route path='/leads'  element = {<Leads/>}/>
        <Route path='/clients'  element = {<Clients/>}/>
        <Route path='/profile'  element = {<Profile/>}/>
        <Route path='/expenses'  element = {<Expenses/>}/>
        <Route path='/setting'  element = {<Bank/>}/>
        <Route path='/AllProposals' element={<AllProposals/>} />
        <Route path='/tickets'  element = {<Tickets/>}/>
        <Route path='/todo'  element = {<ToDo/>}/>
        </Route>
        <Route path='/dashboard' element = {<Dashboard/>}/>
        <Route path='/login' element = {<Login/>}/>
        <Route path='/logout' element={<Logout/>}/>
        <Route path='/ResetPassword' element={<ResetPassword/>}/>

        
      </Routes>
    </BrowserRouter>
  )
}

export default App
