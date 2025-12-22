import VerificationEmailSent from "@/components/auth/VerificationEmailSent";
import React, { Suspense } from "react";

function Page() {
  return (
    <Suspense fallback={<div />}>
      <VerificationEmailSent />
    </Suspense>
  );
}

export default Page;

