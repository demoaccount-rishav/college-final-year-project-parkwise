import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGlobe, FaMobileAlt, FaFileAlt } from 'react-icons/fa';
import Navbar from '../components/Navigation/Navbar';
import img from '../imgs/image.jpg';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomePage() {
  // Color mode values
  const heroBg = useColorModeValue(
    'linear(to-r, blue.600, purple.500)',
    'linear(to-r, gray.800, gray.900)'
  );
  const featureCardBg = useColorModeValue('white', 'gray.700');
  const featureCardText = useColorModeValue('gray.600', 'gray.200');
  const footerBg = useColorModeValue('gray.800', 'gray.900');
  const buttonOutlineScheme = useColorModeValue('whiteAlpha', 'blackAlpha');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check user login status via API
    const checkUserLoggedIn = async () => {
      try {
        const response = await axios.get('api/user/cookie-based-view-user', { 
          withCredentials: true 
        });
        
        if (response.data && response.data !== false) {
          setUserLoggedIn(true);
        } else {
          setUserLoggedIn(false);
        }
      } catch (error) {
        setUserLoggedIn(false);
      }
    };
    
    // Check admin login status via API
    const checkAdminLoggedIn = async () => {
      try {
        const response = await axios.get('api/admin/getAdminProfile', { 
          withCredentials: true 
        });
        
        if (response.data.success) {
          setAdminLoggedIn(true);
        } else {
          setAdminLoggedIn(false);
        }
      } catch (error) {
        setAdminLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserLoggedIn();
    checkAdminLoggedIn();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <>
      <Navbar />
      <Box>
        {/* Hero Section */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          bgGradient={heroBg}
          color="white"
          px={{ base: 4, md: 8, lg: 16 }}
          py={16}
        >
          <VStack
            align="flex-start"
            spacing={6}
            maxW={{ md: '50%' }}
            mb={{ base: 8, md: 0 }}
          >
            <Heading as="h1" size="2xl" lineHeight="1.2">
              Find your bicycle faster than ever before.
            </Heading>
            <Text fontSize="xl">
              Welcome to ParkWise, a toolkit for finding your bicycle among many others.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Button
                as={RouterLink}
                to={userLoggedIn ? "/userPage" : "/userLogin"}
                colorScheme="green"
                size="lg"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                {userLoggedIn ? "User Profile" : "User Login"}
              </Button>
              <Button
                as={RouterLink}
                to={adminLoggedIn ? "/dashboard" : "/adminLogin"}
                variant="outline"
                colorScheme={buttonOutlineScheme}
                size="lg"
                color={useColorModeValue('white', 'white')}
                borderColor={useColorModeValue('white', 'gray.300')}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  bg: useColorModeValue('whiteAlpha.200', 'blackAlpha.200')
                }}
              >
                {adminLoggedIn ? "Admin Dashboard" : "Admin Login"}
              </Button>
            </Stack>
          </VStack>

          <Box
            maxW={{ base: '300px', md: '350px' }}
            mt={{ base: 8, md: 0 }}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="2xl"
          >
            <Image
              src={img}
              alt="Multiple bicycles parked in their stand, in a room"
              objectFit="cover"
            />
          </Box>
        </Flex>

        {/* Features Section */}
        <Container maxW="container.xl" py={16}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={8}
            px={{ base: 4, md: 0 }}
          >
            <FeatureCard
              icon={FaGlobe}
              title="Built for public parking spaces"
              description="Limited space, high demand, insufficient availability, overcrowding, unsafe conditions, and poor maintenance are common problems with public parking."
              bg={featureCardBg}
              textColor={featureCardText}
            />
            <FeatureCard
              icon={FaMobileAlt}
              title="Available across devices"
              description="Solutions offers seamless access, synchronization, and functionality on smartphones, tablets, and desktops."
              bg={featureCardBg}
              textColor={featureCardText}
            />
            <FeatureCard
              icon={FaFileAlt}
              title="Complete parking solution"
              description="A complete parking solution app offers reservation, navigation, payment, availability tracking, and real-time updates for convenient parking management."
              bg={featureCardBg}
              textColor={featureCardText}
            />
          </Grid>
        </Container>

        {/* Footer */}
        <Box bg={footerBg} color="white" py={12}>
          <Container maxW="container.xl">
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              justify="space-between"
              align={{ base: 'center', lg: 'flex-start' }}
              gap={8}
            >
              <VStack align={{ base: 'center', lg: 'flex-start' }} spacing={4}>
                <ContactInfo phone="+91 930306850" email="sourav@gmail.com" />
                <ContactInfo phone="+91 923323850" email="rishav@gmail.com" />
                <ContactInfo phone="+91 912323350" email="tanmoy@gmail.com" />
                <ContactInfo phone="+91 912322312" email="debjit@gmail.com" />
              </VStack>

              <VStack
                maxW={{ base: '100%', lg: '50%' }}
                align={{ base: 'center', lg: 'flex-start' }}
                spacing={4}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                <Heading as="h2" size="lg">About the company</Heading>
                <Text>
                  We provide innovative parking solutions through technology,
                  offering seamless experiences with reservation, navigation,
                  and real-time updates for users.
                </Text>
              </VStack>
            </Flex>
          </Container>
        </Box>
      </Box>
    </>
  );
}

function FeatureCard({ icon, title, description, bg, textColor }) {
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  
  return (
    <VStack
      align="flex-start"
      p={6}
      bg={bg}
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
        transition: 'all 0.3s ease'
      }}
    >
      <Icon as={icon} w={10} h={10} color={iconColor} />
      <Heading as="h3" size="md">{title}</Heading>
      <Text color={textColor}>{description}</Text>
    </VStack>
  );
}

function ContactInfo({ phone, email }) {
  const emailColor = useColorModeValue('blue.300', 'blue.400');
  
  return (
    <Flex direction="column">
      <Text fontWeight="medium">{phone}</Text>
      <Text color={emailColor} fontWeight="bold">{email}</Text>
    </Flex>
  );
}