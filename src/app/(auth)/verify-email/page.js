import VerifyEmailStatus from "@/components/auth/VerifyEmailStatus";
import React, { Suspense } from "react";

function Page() {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmailStatus />
    </Suspense>
  );
}

export default Page;

