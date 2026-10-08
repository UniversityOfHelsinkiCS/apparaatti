import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CurTagPremises, TagBase, TagMutations } from '../../../../common/types.ts'
import { invalidateTagQueries, mutateSnapshot } from './courseTagUtils.ts'
import { applyMutationsToPremises } from './tagVersionState.ts'

export const useTagMutation = (base: TagBase) => {
  const queryClient = useQueryClient()
  const versionId = base.kind === 'snapshot' ? base.id : null

  return useMutation({
    scope: { id: 'course-tag-version' },
    mutationFn: (mutations: TagMutations) => mutateSnapshot(versionId as number, mutations),
    onMutate: async (mutations: TagMutations) => {
      await queryClient.cancelQueries({ queryKey: ['course-tag-states'] })
      const previous = queryClient.getQueriesData({ queryKey: ['course-tag-states'] })

      queryClient.setQueriesData({ queryKey: ['course-tag-states'] }, (data: CurTagPremises[] | undefined) =>
        data ? applyMutationsToPremises(data, mutations) : data
      )

      return { previous }
    },
    onError: (_error, _mutations, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSettled: () => invalidateTagQueries(queryClient),
  })
}
