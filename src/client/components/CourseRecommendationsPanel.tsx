import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

const CourseRecommendationsPanel = ({ onClose }: { onClose: () => void }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match the animation duration
  };

  useEffect(() => {
    setIsClosing(false); // Reset closing state when the component is mounted
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '300px',
        height: '100%',
        backgroundColor: '#f5f5f5',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
        animation: isClosing ? 'slide-out 0.3s forwards' : 'slide-in 0.3s forwards',
        '@keyframes slide-in': {
          from: {
            transform: 'translateX(100%)',
          },
          to: {
            transform: 'translateX(0)',
          },
        },
        '@keyframes slide-out': {
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(100%)',
          },
        },
      }}
    >
      <Button
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          minWidth: '24px',
          height: '24px',
          padding: 0,
          fontSize: '1rem',
          lineHeight: 1,
          color: 'black',
          background: 'none',
          border: '1px solid lightgray',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: 'lightgray',
          },
        }}
      >
        X
      </Button>
      <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
        Suositellut kurssit
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        TODO: kussit
      </Typography>
    </Box>
  );
};

export default CourseRecommendationsPanel;
