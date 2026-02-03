import React from 'react'
import EditCourse from '@/components/admin/courses/EditCourse'

async function page({ params }) {
  const resolvedParams = await params;
  return (
    <EditCourse courseId={resolvedParams.id} />
  )
}

export default page
