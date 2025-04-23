import React from 'react'
import { 
  Box,
  Container, 
  Flex, 
  HStack, 
  Text, 
  useColorMode, 
  useColorModeValue,
  Show,
  Hide,
  Switch,
  Tooltip,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { IoMoon, IoSunny } from "react-icons/io5"

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'gray.800')
  const color = useColorModeValue('gray.800', 'white')
  
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
            {/* <Text cursor="pointer">ParkWise</Text> */}
            <RouterLink to="/">ParkWise</RouterLink>
          </Text>

          {/* Dark Mode Toggle */}
          <FormControl display="flex" alignItems="center" width="auto">
            <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
              <HStack spacing={2}>
                <IoSunny />
                <Switch 
                  id="dark-mode-toggle"
                  isChecked={colorMode === 'dark'}
                  onChange={toggleColorMode}
                  colorScheme="blue"
                  size="md"
                />
                <IoMoon />
              </HStack>
            </Tooltip>
          </FormControl>
        </Flex>
      </Container>
    </Box>
  )
}