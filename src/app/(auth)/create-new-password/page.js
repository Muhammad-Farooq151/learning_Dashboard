import CreateNewPassword from '@/components/auth/CreateNewPassword'
import React, { Suspense } from 'react'

function page() {
  return (
    <Suspense fallback={<div />}>
      <CreateNewPassword/>
    </Suspense>
  )
}

export default page