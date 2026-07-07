import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/leaderboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/leaderboard"!</div>
}
