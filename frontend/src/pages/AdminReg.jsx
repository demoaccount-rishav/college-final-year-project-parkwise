import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';

export default function AdminRegister() {
  const [adminName, setAdminName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Dynamic colors based on theme
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.600, purple.500)',
    'linear(to-r, gray.800, gray.900)'
  );
  const formBg = useColorModeValue('white', 'gray.700');
  const formTextColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.800');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.500');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace with actual registration logic
      toast({
        title: 'Registration successful',
        description: 'Admin account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin-login');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Error creating admin account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Flex
        minH={'calc(100vh - 64px)'}
        align={'center'}
        justify={'center'}
        bgGradient={bgGradient}
      >
        <Container maxW={'container.md'} py={12}>
          <Stack spacing={8} mx={'auto'} maxW={'md'}>
            <Stack align={'center'}>
              <Heading fontSize={'4xl'} color={'white'} textAlign={'center'}>
                Admin Registration
              </Heading>
              <Text fontSize={'lg'} color={'whiteAlpha.800'}>
                Create a new admin account
              </Text>
            </Stack>
            <Box
              rounded={'lg'}
              bg={formBg}
              boxShadow={'2xl'}
              p={8}
              color={formTextColor}
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <FormControl id="adminName" isRequired>
                    <FormLabel>Admin Name</FormLabel>
                    <Input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Enter admin name"
                      bg={inputBg}
                      size="lg"
                    />
                  </FormControl>
                  
                  <FormControl id="phoneNumber" isRequired>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      bg={inputBg}
                      size="lg"
                    />
                  </FormControl>
                  
                  <FormControl id="password" isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      bg={inputBg}
                      size="lg"
                    />
                  </FormControl>
                  
                  <FormControl id="confirmPassword" isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      bg={inputBg}
                      size="lg"
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    bg={buttonBg}
                    color={'white'}
                    size="lg"
                    fontSize="md"
                    _hover={{
                      bg: buttonHoverBg,
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                    isLoading={isLoading}
                    loadingText="Registering..."
                  >
                    Register
                  </Button>
                </Stack>
              </form>
              <Text mt={6} textAlign={'center'} fontSize="sm">
                Already have an account?{' '}
                <Text 
                  as={RouterLink} 
                  to="/adminLogin" 
                  color={linkColor}
                  textDecoration="underline"
                  _hover={{ textDecoration: 'none' }}
                >
                  Login here
                </Text>
              </Text>
            </Box>
          </Stack>
        </Container>
      </Flex>
    </>
  );
}