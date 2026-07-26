import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/projects/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  console.log("id", id)
  return <div>Hello "/_dashboard/projects/$id"!</div>
}
