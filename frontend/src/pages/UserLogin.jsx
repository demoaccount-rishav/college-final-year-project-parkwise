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
  
  export default function UserLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
  
    // Dynamic colors based on theme - matching AdminLogin
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
        const response = await fetch('/api/user/cookie-based-login-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPhone: phone,
            userPassword: password
          }),
          credentials: 'include' // Important for cookies
        });
  
        const data = await response.json();
  
        if (data.success) {
          toast({
            title: 'Login successful',
            description: `Welcome back, ${data.user.name}!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate('/userPage'); // Redirect to dashboard after login
        } else {
          toast({
            title: 'Login failed',
            description: data.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred during login',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        console.error('Login error:', error);
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
                  User Login
                </Heading>
                <Text fontSize={'lg'} color={'whiteAlpha.800'}>
                  Enter your credentials to continue
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
                    <FormControl id="phone" isRequired>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
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
                        placeholder="Enter your password"
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
                      loadingText="Logging in..."
                    >
                      Login
                    </Button>
                  </Stack>
                </form>
                {/* <Text mt={6} textAlign={'center'} fontSize="sm">
                  Don't have an account?{' '}
                  <Text 
                    as={RouterLink} 
                    to="/userReg" 
                    color={linkColor}
                    textDecoration="underline"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Sign up
                  </Text>
                </Text> */}
              </Box>
            </Stack>
          </Container>
        </Flex>
      </>
    );
  }