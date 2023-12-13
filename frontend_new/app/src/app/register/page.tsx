"use client";

import {
  Box,
  Button,
  Container,
  List,
  ListItemText,
  AppBar,
  Typography,
  Paper,
  Toolbar,
  TextField,
  ListItem,
  CircularProgress,
} from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../api/api";
import { saveToken } from "../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await register({ email, name, password });
      if (res.success && res.data) {
        saveToken(res.data);
        router.push("/profile");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PW app
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <form onSubmit={handleSubmit}>
            <List>
              <ListItem>
                <ListItemText primary="Name" />
                <TextField
                  id="auth-name"
                  label="name"
                  variant="filled"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" />
                <TextField
                  id="auth-email"
                  label="email"
                  variant="filled"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Password" />
                <TextField
                  id="auth-password"
                  label="password"
                  variant="filled"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Confirm password" />
                <TextField
                  id="auth-confirm-password"
                  label="confirm password"
                  variant="filled"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </ListItem>

              <Button variant="contained" type="submit">
                Register
              </Button>
              <Button variant="contained" href="/login">
                Back
              </Button>
            </List>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
