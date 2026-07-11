import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '~/lib/providers/auth-provider';

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth();
  console.log("user", user)
  return <div className='text-primary'>Hello "/_dash/"!</div>
}
