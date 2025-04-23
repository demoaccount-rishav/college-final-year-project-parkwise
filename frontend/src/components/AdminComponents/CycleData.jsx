import React from 'react';
import { 
  Tr, 
  Td, 
  Button, 
  Badge,
  Text,
  Box,
  Tooltip,
  ButtonGroup
} from '@chakra-ui/react';
import { DeleteIcon, TimeIcon } from '@chakra-ui/icons';

export default function CycleData({ zone, search, onDelete, onUpdateExit, isDeleting, isUpdatingExit, hoverBg }) {
  const filteredCycles = zone.filter((item) => {
    return search.toLowerCase() === '' 
      ? item 
      : item.cycleId.toLowerCase().includes(search);
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const getLastEvents = (entryExitTimes) => {
    if (!entryExitTimes || entryExitTimes.length === 0) {
      return {
        lastEntry: null,
        lastExit: null,
        isCurrentlyInZone: false
      };
    }

    const lastEvent = entryExitTimes[entryExitTimes.length - 1];
    const isCurrentlyInZone = new Date(lastEvent.exit).getTime() === new Date(lastEvent.entry).getTime();

    return {
      lastEntry: lastEvent.entry,
      lastExit: isCurrentlyInZone ? null : lastEvent.exit,
      isCurrentlyInZone
    };
  };

  if (filteredCycles.length === 0) {
    return (
      <Tr>
        <Td colSpan={5} textAlign="center" py={10}>
          <Text color="gray.500">No cycles found</Text>
        </Td>
      </Tr>
    );
  }

  return (
    <>
      {filteredCycles.map((data) => {
        const { _id, cycleId, zoneId, entryExitTimes } = data;
        const isOnline = zoneId !== "offline";
        const { lastEntry, lastExit, isCurrentlyInZone } = getLastEvents(entryExitTimes);
        
        return (
          <Tr key={_id} _hover={{ bg: hoverBg }}>
            <Td>
              <Badge 
                colorScheme="blue"
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {cycleId}
              </Badge>
            </Td>
            <Td>
              <Badge 
                colorScheme={isOnline ? 'green' : 'red'}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {zoneId}
              </Badge>
            </Td>
            <Td>
              <Tooltip label={`Last entry time`}>
                <Box fontSize="md">
                  {lastEntry ? formatDateTime(lastEntry) : 'Never entered'}
                </Box>
              </Tooltip>
            </Td>
            <Td>
              {isCurrentlyInZone ? (
                <Tooltip label="Cycle is currently in this zone">
                  <Badge colorScheme="yellow" variant="subtle">Currently in zone</Badge>
                </Tooltip>
              ) : (
                <Tooltip label="Last exit time">
                  <Box fontSize="md">{lastExit ? formatDateTime(lastExit) : 'No exit recorded'}</Box>
                </Tooltip>
              )}
            </Td>
            <Td textAlign="right">
              <ButtonGroup spacing={2}>
                <Button
                  colorScheme="orange"
                  variant="outline"
                  size="sm"
                  leftIcon={<TimeIcon />}
                  onClick={() => onUpdateExit(cycleId)}
                  isLoading={isUpdatingExit}
                  loadingText="Updating"
                  isDisabled={isUpdatingExit || !isCurrentlyInZone}
                  title={!isCurrentlyInZone ? "Can only update exit for cycles currently in a zone" : ""}
                >
                  Update Exit
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  leftIcon={<DeleteIcon />}
                  onClick={() => onDelete(cycleId)}
                  isLoading={isDeleting}
                  loadingText="Deleting"
                  isDisabled={isDeleting || isOnline}
                  title={isOnline ? "Can only delete offline cycles" : ""}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </Td>
          </Tr>
        );
      })}
    </>
  );
}