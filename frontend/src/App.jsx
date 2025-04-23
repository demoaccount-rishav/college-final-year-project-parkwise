import { Box } from '@chakra-ui/react';
import { Route, Routes } from 'react-router-dom';

import AdminLogin from './pages/AdminLogin';
import AdminReg from './pages/AdminReg';

import Dashboard from './pages/AdminPages/Dashboard';

import HomePage from './pages/HomePage';
import HomePageUser from './pages/HomePageUser';

import UserLogin from './pages/UserLogin';
import UserReg from './pages/UserReg';


import CreateNewUser from './pages/AdminPages/User/CreateNewUser';
import ViewUsers from './pages/AdminPages/User/ViewUsers';

import CreateCycle from './pages/AdminPages/Cycle/CreateCycle';
import CycleZoneScanner from './pages/AdminPages/Cycle/CycleZoneScanner';
import ViewCycles from './pages/AdminPages/Cycle/ViewCycles';

import CreateNewZone from './pages/AdminPages/Zone/CreateNewZone';
import ViewAllZones from './pages/AdminPages/Zone/ViewAllZones';

import CreateCard from './pages/AdminPages/Card/CreateCard';
import RechargeCard from './pages/AdminPages/Card/RechargeCard';
import ViewCards from './pages/AdminPages/Card/ViewCards';


import UserPage from './pages/UserPages/UserPage';
import ViewCardDetails from './pages/UserPages/ViewCardDetails';
import ViewUserCycleDetails from './pages/UserPages/ViewUserCycleDetails';

import QRGeneratar from './pages/AdminPages/QRCodeGenerator/QRGenerator';

function App() {
  return (
    <Box>
      <Routes>
        <Route path='/adminLogin' element={<AdminLogin />} />
        <Route path='/adminReg' element={<AdminReg />} />

        <Route path='/dashboard' element={<Dashboard />} />

        <Route path='/' element={<HomePage />} />
        <Route path='/homePageUser' element={<HomePageUser />} />

        <Route path='/userLogin' element={<UserLogin />} />
        <Route path='/userReg' element={<UserReg />} />


        <Route path='/createNewZone' element={<CreateNewZone />} />
        <Route path='/viewAllZones' element={<ViewAllZones />} />

        <Route path='/createCycle' element={<CreateCycle />} />
        <Route path="/scanCycleZone" element={<CycleZoneScanner />} />
        <Route path='/viewCycles' element={<ViewCycles />} />

        <Route path='/createNewUser' element={<CreateNewUser />} />
        <Route path='/viewUsers' element={<ViewUsers />} />

        <Route path='/createCard' element={<CreateCard />} />
        <Route path='/rechargeCard' element={<RechargeCard />} />
        <Route path='/viewCards' element={<ViewCards />} />


        <Route path='/userPage' element={<UserPage />} />
        <Route path='/view-card-details' element={<ViewCardDetails />} />
        <Route path='/viewUserCycleDetails' element={<ViewUserCycleDetails />} />


        <Route path='/qr-generator' element={<QRGeneratar/>} />

      </Routes>
    </Box>
  )
}

export default App