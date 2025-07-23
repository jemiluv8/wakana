import { Metadata } from "next";
import { Suspense } from "react";
import { ClientsList } from "@/components/clients/ClientsList";
import { Spinner } from "@/components/spinner/spinner";

export const metadata: Metadata = {
  title: "Clients",
  description: "Wakana clients, manage your freelance clients.",
};

export default function Clients() {
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Clients</h1>
      </div>
      <Suspense fallback={<Spinner />}>
        <ClientsList />
      </Suspense>
    </div>
  );
}
