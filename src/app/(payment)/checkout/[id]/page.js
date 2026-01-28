"use client";

import React, { use } from "react";
import CheckoutPage from "@/components/user/checkout/CheckoutPage";

function CheckoutRoute({ params }) {
  const resolvedParams = use(params);
  return <CheckoutPage courseId={resolvedParams.id} />;
}

export default CheckoutRoute;
