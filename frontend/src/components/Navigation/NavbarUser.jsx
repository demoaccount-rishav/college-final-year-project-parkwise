import React from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Show,
  Hide,
  Avatar,
  useToast,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { IoMoon, IoSunny } from "react-icons/io5"
import { FiMenu, FiLogOut, FiUser } from "react-icons/fi"
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'gray.800')
  const color = useColorModeValue('gray.800', 'white')
  const [userData, setUserData] = useState({
    userName: '',
    isLoading: true,
    isLoggedIn: false
  })
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('api/user/cookie-based-view-user', {
          withCredentials: true
        })

        if (response.data.success) {
          setUserData({
            userName: response.data.data.user.userName,
            isLoading: false,
            isLoggedIn: true
          })
        }
      } catch (error) {
        setUserData(prev => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false
        }))
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'api/user/cookie-based-logout-user',
        {},
        { withCredentials: true }
      )

      if (response.data.success) {
        setUserData({
          userName: '',
          isLoading: false,
          isLoggedIn: false
        })
        toast({
          title: 'Logged out successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate('/')
      }
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      position="sticky"
      top={0}
      zIndex="sticky"
      bg={bg}
      color={color}
      boxShadow="sm"
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container maxW="container.xl" px={4}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Logo/Brand */}
          <Text
            fontSize="xl"
            fontWeight="bold"
            textTransform="uppercase"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
            _hover={{ transform: 'scale(1.05)' }}
            transition="transform 0.2s"
          >
            <Text cursor="pointer">ParkWise</Text>
            {/* <RouterLink to="/">ParkWise</RouterLink> */}
          </Text>

          {/* Desktop Navigation */}
          <Show above="md">
            <HStack spacing={8} alignItems="center">
              <NavLink to={userData.isLoggedIn ? "/homePageUser" : "/"}>
                Home
              </NavLink>

              {/* Show user profile only if logged in */}
              {userData.isLoggedIn && (
                <Button
                  as={RouterLink}
                  to="/userPage"
                  variant="ghost"
                  leftIcon={<FiUser />}
                  isLoading={userData.isLoading}
                >
                  {userData.userName || 'Profile'}
                </Button>
              )}

              {userData.isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  leftIcon={<FiLogOut />}
                  variant="ghost"
                  colorScheme="red"
                  _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  as={RouterLink}
                  to="/userLogin"
                  variant="ghost"
                  colorScheme="blue"
                  _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                >
                  Login
                </Button>
              )}

              <FormControl display="flex" alignItems="center" width="auto">
                <HStack spacing={2}>
                  <IoSunny size={18} />
                  <Switch
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    colorScheme="blue"
                    size="md"
                    aria-label="Toggle dark mode"
                  />
                  <IoMoon size={18} />
                </HStack>
              </FormControl>
            </HStack>
          </Show>

          {/* Mobile Navigation */}
          <Hide above="md">
            <HStack spacing={4}>
              <FormControl display="flex" alignItems="center" width="auto">
                <HStack spacing={2}>
                  <IoSunny size={16} />
                  <Switch
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    colorScheme="blue"
                    size="sm"
                    aria-label="Toggle dark mode"
                  />
                  <IoMoon size={16} />
                </HStack>
              </FormControl>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMenu />}
                  variant="outline"
                  aria-label="Open menu"
                />
                <MenuList>
                  <MenuItem as={RouterLink} to={userData.isLoggedIn ? "/homePageUser" : "/"}>
                    Home
                  </MenuItem>
                  {userData.isLoggedIn && (
                    <MenuItem
                      as={RouterLink}
                      to="/userPage"
                      icon={<FiUser />}
                    >
                      {userData.isLoading ? 'Loading...' : userData.userName || 'Profile'}
                    </MenuItem>
                  )}
                  {userData.isLoggedIn ? (
                    <MenuItem
                      icon={<FiLogOut />}
                      onClick={handleLogout}
                      color="red.500"
                    >
                      Logout
                    </MenuItem>
                  ) : (
                    <MenuItem
                      as={RouterLink}
                      to="/userLogin"
                      icon={<FiUser />}
                      color="blue.500"
                    >
                      Login
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </Hide>
        </Flex>
      </Container>
    </Box>
  )
}

// Reusable NavLink component
function NavLink({ to, children }) {
  return (
    <RouterLink to={to}>
      <Button
        variant="ghost"
        fontWeight="medium"
        _hover={{
          textDecoration: 'none',
          bg: useColorModeValue('gray.100', 'gray.700'),
          color: useColorModeValue('blue.500', 'blue.300')
        }}
        _activeLink={{
          color: useColorModeValue('blue.600', 'blue.400'),
          fontWeight: 'semibold'
        }}
      >
        {children}
      </Button>
    </RouterLink>
  )
}