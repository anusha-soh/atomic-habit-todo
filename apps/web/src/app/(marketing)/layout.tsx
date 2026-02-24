/**
 * Marketing Layout
 * Wraps the public-facing landing page with no app navbar.
 * The NotebookNav is rendered inside the page itself.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
