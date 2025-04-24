import React from 'react';
import { CourseRecommendation as CourseRecommendationType } from '/common/types';
import { Box, Paper, Typography } from '@mui/material';

const CourseRecommendation = ({ course }: { course: CourseRecommendationType }) => {
  if (!course) return null;

  return (
    <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {course.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {course.description}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         {course.courseCode}
        </Typography>
        <Typography variant="body2" color="textSecondary">
         opintopisteet: {course.credits}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CourseRecommendation;