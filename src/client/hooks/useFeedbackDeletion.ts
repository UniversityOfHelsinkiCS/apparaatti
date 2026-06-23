import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { adminFetch } from '../components/admin/filterEdit/filterEditorUtils.ts'

type FeedbackRow = { id: number; date: string }

export type DeleteTarget =
  | { type: 'selected'; ids: number[]; count: number }
  | { type: 'older-than'; before: string; count: number }

export function useFeedbackDeletion(feedbackRows: FeedbackRow[], filteredRows: FeedbackRow[], refetch: () => void) {
  const { t } = useTranslation()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [olderThanDate, setOlderThanDate] = useState('')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const filteredIds = filteredRows.map(f => f.id)
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.has(id))
  const someFilteredSelected = filteredIds.some(id => selectedIds.has(id))

  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filteredIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelectedIds(prev => new Set([...prev, ...filteredIds]))
    }
  }

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedIds).filter(id => filteredIds.includes(id))
    setDeleteTarget({ type: 'selected', ids, count: ids.length })
  }

  const handleDeleteOlderThan = () => {
    if (!olderThanDate) return
    const before = new Date(`${olderThanDate}T23:59:59.999Z`)
    const count = feedbackRows.filter(f => new Date(f.date) < before).length
    setDeleteTarget({ type: 'older-than', before: before.toISOString(), count })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      let res: Response
      if (deleteTarget.type === 'selected') {
        res = await adminFetch('DELETE', '/api/admin/user-feedback', { ids: deleteTarget.ids })
      } else {
        res = await adminFetch('DELETE', '/api/admin/user-feedback/older-than', { before: deleteTarget.before })
      }
      if (!res.ok) throw new Error('Failed')
      const { deleted } = (await res.json()) as { deleted: number }
      setSnackbar({ open: true, message: t('v2:feedback.admin.deleteSuccess', { count: deleted }) })
      setSelectedIds(new Set())
      setDeleteTarget(null)
      void refetch()
    } catch {
      setSnackbar({ open: true, message: t('v2:feedback.admin.deleteError') })
      setDeleteTarget(null)
    }
  }

  return {
    selectedIds,
    allFilteredSelected,
    someFilteredSelected,
    toggleRow,
    toggleAll,
    olderThanDate,
    setOlderThanDate,
    deleteTarget,
    clearDeleteTarget: () => setDeleteTarget(null),
    handleDeleteSelected,
    handleDeleteOlderThan,
    handleConfirmDelete,
    snackbar,
    closeSnackbar: () => setSnackbar(prev => ({ ...prev, open: false })),
  }
}
