import { Box, Container, AppBar, Button, Typography, Paper, Toolbar } from '@mui/material';

export default function TransactionCreateForm() {
  return (
    <Box>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PW app
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Button variant="contained" href='/profile'>Back</Button>
          
        </Paper>
      </Container>
    </Box>
  )
}