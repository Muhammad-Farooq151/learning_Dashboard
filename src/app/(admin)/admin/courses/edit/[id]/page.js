import React from 'react'
import EditCourse from '@/components/admin/courses/EditCourse'

function page({ params }) {
  return (
    <EditCourse courseId={params.id} />
  )
}

export default page
