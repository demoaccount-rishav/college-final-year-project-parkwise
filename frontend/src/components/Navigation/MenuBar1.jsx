import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Link,
  Text,
  useColorModeValue,
  Divider,
  Button,
  IconButton,
  Flex,
  useDisclosure,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiCreditCard,
  FiMap,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from 'react-icons/fi';
import { MdPedalBike, MdQrCode } from 'react-icons/md';
import axios from 'axios';

export default function MenuBar1() {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.700');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const buttonBg = useColorModeValue('red.500', 'red.600');
  const disabledColor = useColorModeValue('gray.400', 'gray.500');
  const [hovered, setHovered] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({ 
    adminName: '', 
    isLoading: true,
    isLoggedIn: false
  });

  const navItems = [
    { path: "/viewUsers", icon: <FiUsers />, label: "Users" },
    { path: "/viewCycles", icon: <MdPedalBike />, label: "Cycles" },
    { path: "/viewCards", icon: <FiCreditCard />, label: "Cards" },
    { path: "/viewAllZones", icon: <FiMap />, label: "Zones" },
    { path: "/qr-generator", icon: <MdQrCode />, label: "QR-generator" }
  ];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('api/admin/getAdminProfile', { 
          withCredentials: true 
        });
        
        if (response.data.success) {
          setAdminData({
            adminName: response.data.admin.name,
            isLoading: false,
            isLoggedIn: true
          });
        }
      } catch (error) {
        setAdminData(prev => ({ 
          ...prev, 
          isLoading: false,
          isLoggedIn: false
        }));
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'api/admin/logout',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setAdminData({
          adminName: '',
          isLoading: false,
          isLoggedIn: false
        });
        toast({
          title: 'Logged out successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      w={isOpen ? "250px" : "60px"}
      h="100vh"
      bg={bgColor}
      p={2}
      position="fixed"
      boxShadow="lg"
      zIndex="sticky"
      transition="width 0.2s ease"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <VStack align="stretch" spacing={4} h="100%">
        {/* Header with toggle button */}
        <Flex justify="space-between" align="center" p={2}>
          {isOpen && (
            <Text fontSize="xl" fontWeight="bold" whiteSpace="nowrap">
              Admin Panel
            </Text>
          )}
          <IconButton
            icon={isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            onClick={onToggle}
            aria-label="Toggle sidebar"
            variant="ghost"
            size="sm"
          />
        </Flex>
        
        <Divider />

        {/* Navigation Links */}
        {navItems.map((item) => (
          <Tooltip 
            key={item.path}
            label={adminData.isLoggedIn ? item.label : "Please login to access"}
            placement="right"
            isDisabled={isOpen && adminData.isLoggedIn}
            hasArrow
          >
            <Box>
              <Link
                as={adminData.isLoggedIn ? RouterLink : Box}
                to={item.path}
                p={3}
                borderRadius="md"
                _hover={{ 
                  bg: adminData.isLoggedIn ? activeBg : 'transparent',
                  cursor: adminData.isLoggedIn ? 'pointer' : 'not-allowed'
                }}
                _activeLink={adminData.isLoggedIn ? {
                  bg: activeBg,
                  color: activeColor,
                  fontWeight: 'semibold'
                } : {}}
                display="flex"
                alignItems="center"
                justifyContent={isOpen ? "flex-start" : "center"}
                color={adminData.isLoggedIn ? 'inherit' : disabledColor}
                onClick={(e) => {
                  if (!adminData.isLoggedIn) {
                    e.preventDefault();
                    toast({
                      title: 'Login required',
                      description: 'Please login to access this section',
                      status: 'warning',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                <Box mr={isOpen ? 3 : 0} opacity={adminData.isLoggedIn ? 1 : 0.6}>
                  {item.icon}
                </Box>
                {isOpen && (
                  <Text opacity={adminData.isLoggedIn ? 1 : 0.6}>
                    {item.label}
                  </Text>
                )}
              </Link>
            </Box>
          </Tooltip>
        ))}

        {/* Spacer to push buttons to bottom */}
        <Box flexGrow={1} />

        {/* Admin Profile and Logout Buttons */}
        <VStack spacing={2} mb={4}>
          {!adminData.isLoggedIn ? (
            <Tooltip 
              label="Login" 
              placement="right"
              isDisabled={isOpen}
              hasArrow
            >
              <Button
                leftIcon={isOpen ? <FiUser /> : undefined}
                rightIcon={!isOpen ? <FiUser /> : undefined}
                colorScheme="blue"
                variant="solid"
                w="100%"
                justifyContent={isOpen ? "flex-start" : "center"}
                px={isOpen ? 4 : 2}
                as={RouterLink}
                to="/adminLogin"
              >
                {isOpen && "Login"}
              </Button>
            </Tooltip>
          ) : (
            <>
              {isOpen && (
                <Text 
                  px={3} 
                  py={2}
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="center"
                >
                  Logged in as: {adminData.adminName}
                </Text>
              )}
              <Tooltip 
                label="Log Out" 
                placement="right"
                isDisabled={isOpen}
                hasArrow
              >
                <Button
                  leftIcon={isOpen ? <FiLogOut /> : undefined}
                  rightIcon={!isOpen ? <FiLogOut /> : undefined}
                  colorScheme="red"
                  variant="solid"
                  w="100%"
                  justifyContent={isOpen ? "flex-start" : "center"}
                  px={isOpen ? 4 : 2}
                  _hover={{
                    bg: buttonBg,
                    transform: 'scale(1.02)',
                  }}
                  _active={{
                    bg: buttonBg,
                    transform: 'scale(0.98)',
                  }}
                  onClick={handleLogout}
                >
                  {isOpen && "Log Out"}
                </Button>
              </Tooltip>
            </>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}