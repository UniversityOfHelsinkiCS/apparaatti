import Markdown from 'react-markdown'

import HyLink from './hy/HyLink'

interface AppMarkdownProps {
  children: string
}

/* Wrapper for react-markdown with custom components. */
const AppMarkdown = ({ children }: AppMarkdownProps) => (
  <Markdown
    components={{
      a: ({ href, children }) => (
        <HyLink href={href} target="_blank">
          {children}
        </HyLink>
      ),
    }}
  >
    {children}
  </Markdown>
)

export default AppMarkdown
