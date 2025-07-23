import { Metadata } from "next";
import { Suspense } from "react";

import { GoalsList } from "@/components/goals/GoalsList";
import { Spinner } from "@/components/spinner/spinner";

export const metadata: Metadata = {
  title: "Goals",
  description: "Wakana goals, set and track development goals.",
};

export default function Goals() {
  return (
    <div className="my-6 min-h-screen min-w-full">
      <Suspense fallback={<Spinner />}>
        <GoalsList />
      </Suspense>
    </div>
  );
}
