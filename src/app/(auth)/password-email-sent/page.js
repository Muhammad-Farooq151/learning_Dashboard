import ResetEmailSend from "@/components/auth/ResetEmailSend";
import React, { Suspense } from "react";

function Page() {
  return (
    <Suspense fallback={null}>
      <ResetEmailSend />
    </Suspense>
  );
}

export default Page;