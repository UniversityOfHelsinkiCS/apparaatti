import { Box, Pagination } from '@mui/material'

interface TagMatrixPaginationProps {
  count: number
  page: number
  onChange: (page: number) => void
}

const TagMatrixPagination = ({ count, page, onChange }: TagMatrixPaginationProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
    <Pagination
      count={count}
      page={page}
      onChange={(_event, value) => onChange(value)}
      sx={{
        '& .MuiPaginationItem-root': { color: '#374151' },
        '& .Mui-selected': { backgroundColor: '#111827 !important', color: '#ffffff' },
      }}
    />
  </Box>
)

export default TagMatrixPagination
