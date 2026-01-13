import React from 'react'
import { Box, Button, Typography } from '@mui/material'

function Navbar() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography fontSize={24} fontWeight={600}>Navbar</Typography>
        {/* <Button variant="contained" color="primary">Login</Button> */}
        </Box>
  )
}

export default Navbar