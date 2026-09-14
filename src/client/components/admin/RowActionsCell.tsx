import { IconButton, TableCell } from '@mui/material'
import { Pencil, Trash2 } from 'lucide-react'

type RowActionsCellProps = {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
  canDelete?: boolean
}

const RowActionsCell = ({ editLabel, deleteLabel, onEdit, onDelete, canDelete = true }: RowActionsCellProps) => (
  <TableCell sx={{ whiteSpace: 'nowrap' }}>
    <IconButton size="small" aria-label={editLabel} onClick={onEdit}>
      <Pencil />
    </IconButton>
    {canDelete && (
      <IconButton size="small" aria-label={deleteLabel} onClick={onDelete}>
        <Trash2 />
      </IconButton>
    )}
  </TableCell>
)

export default RowActionsCell
