import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='text-primary'>Hello "/_dash/"!</div>
}
