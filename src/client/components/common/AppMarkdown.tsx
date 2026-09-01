import Markdown from 'react-markdown'

import useOpensInNewWindowLabel from '../../hooks/useOpensInNewWindowLabel'
import HyLink from './hy/HyLink'

interface AppMarkdownProps {
  children: string
}

/* Wrapper for react-markdown with custom components. */
const AppMarkdown = ({ children }: AppMarkdownProps) => {
  const opensInNewWindowLabel = useOpensInNewWindowLabel()

  return (
    <Markdown
      components={{
        a: ({ href, children }) => (
          <HyLink href={href} target="_blank" opensInNewWindowLabel={opensInNewWindowLabel}>
            {children}
          </HyLink>
        ),
      }}
    >
      {children}
    </Markdown>
  )
}

export default AppMarkdown
