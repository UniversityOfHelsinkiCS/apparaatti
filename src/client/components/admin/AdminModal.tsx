import { Box, Typography, Modal } from '@mui/material'
import { CourseRecommendations } from '../../../common/types.ts'
import useApi from '../../util/useApi.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import VersionBadge from '../common/VersionBadge.tsx'
import { useNavigate } from 'react-router-dom'

const style = {
  position: 'absolute',
  top: { xs: 0, md: '50%' },
  left: { xs: 0, md: '50%' },
  transform: { xs: 'none', md: 'translate(-50%, -50%)' },
  width: { xs: '100%', md: '50%' },
  height: { xs: '100%', md: 'auto' },
  minHeight: { md: '80vh' },
  bgcolor: 'background.paper',
  color: 'black',
  border: { xs: 'none', md: '2px solid #000' },
  boxShadow: { xs: 0, md: 24 },
  p: 4,
  overflowY: 'auto',
}

type TextFeedbackV2Props = {
  open: boolean;
  onClose: () => void;
  recommendations: CourseRecommendations;
};
const AdminModal = ({ open, onClose, recommendations }: TextFeedbackV2Props) => {
  const { data: user } = useApi('user', '/api/user', 'GET', null)
  const navigate = useNavigate()

  

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="admin-modal-title"
      aria-describedby="admin-modal-description"
    >
      <Box sx={style}>
        <Typography id="admin-modal-title" variant="h6" component="h2">
          Admin
        </Typography>
       
        <Box sx={{ mt: 3, borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', gap: 1 }}>
          <BlackOutlinedButton onClick={() => navigate('/admin')}>
            Filter config
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/courses')}>
            Courses
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/stats')}>
            Stats
          </BlackOutlinedButton>
          <BlackOutlinedButton onClick={() => navigate('/admin/feedback')}>
            User feedback
          </BlackOutlinedButton>
          {user?.isSuperuser && (
            <BlackOutlinedButton onClick={() => navigate('/admin/login-as')}>
              Login as
            </BlackOutlinedButton>
          )}
        </Box>
        <VersionBadge />
      </Box>
    </Modal>
  )
}

export default AdminModal
