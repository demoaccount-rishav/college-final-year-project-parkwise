import React, { useState } from 'react';
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
  Tooltip
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiCreditCard,
  FiDollarSign,
  FiPlus,
  FiHome,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export default function MenuBarCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.700');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const buttonBg = useColorModeValue('red.500', 'red.600');

  const navItems = [
    { path: "/viewCards", icon: <FiCreditCard />, label: "View Cards" },
    { path: "/rechargeCard", icon: <FiDollarSign />, label: "Recharge Card" },
    { path: "/createCard", icon: <FiPlus />, label: "Create New Card" }
  ];

  return (
    <Box
      w={isCollapsed ? "70px" : "250px"}
      h="100vh"
      bg={bgColor}
      p={2}
      position="fixed"
      boxShadow="lg"
      zIndex="sticky"
      transition="width 0.2s ease"
    >
      <VStack align="stretch" spacing={4} h="100%">
        {/* Header with toggle button */}
        <Flex justify="space-between" align="center" p={2}>
          {!isCollapsed && (
            <Text fontSize="xl" fontWeight="bold" whiteSpace="nowrap">
              Card Management
            </Text>
          )}
          <IconButton
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={() => setIsCollapsed(!isCollapsed)}
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
            label={item.label} 
            placement="right"
            isDisabled={!isCollapsed}
            hasArrow
          >
            <Link
              as={RouterLink}
              to={item.path}
              p={3}
              borderRadius="md"
              _hover={{ bg: activeBg }}
              _activeLink={{
                bg: activeBg,
                color: activeColor,
                fontWeight: 'semibold'
              }}
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? "center" : "flex-start"}
            >
              <Box mr={isCollapsed ? 0 : 3}>{item.icon}</Box>
              {!isCollapsed && <Text>{item.label}</Text>}
            </Link>
          </Tooltip>
        ))}

        {/* Spacer to push button to bottom */}
        <Box flexGrow={1} />

        {/* Dashboard Button */}
        <Box mb={4}>
          <Tooltip 
            label="Go to Dashboard" 
            placement="right"
            isDisabled={!isCollapsed}
            hasArrow
          >
            <Button
              as={RouterLink}
              to="/dashboard"
              leftIcon={!isCollapsed ? <FiHome /> : undefined}
              rightIcon={isCollapsed ? <FiHome /> : undefined}
              colorScheme="red"
              variant="solid"
              w="100%"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              px={isCollapsed ? 2 : 4}
              _hover={{
                bg: buttonBg,
                transform: 'scale(1.02)',
              }}
              _active={{
                bg: buttonBg,
                transform: 'scale(0.98)',
              }}
            >
              {!isCollapsed && "Go to Dashboard"}
            </Button>
          </Tooltip>
        </Box>
      </VStack>
    </Box>
  );
}