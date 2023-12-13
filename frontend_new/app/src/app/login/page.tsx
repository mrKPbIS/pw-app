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
import { login } from "../api/api";
import { saveToken } from "../api/auth";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const router = useRouter();
  const LOGIN_REQ = "login-req";

  const validateForm = () => {};

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
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
                <ListItemText primary="Email" />
                <TextField
                  id="auth-email"
                  label="email"
                  variant="filled"
                  error={emailError}
                  required
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
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </ListItem>

              <Button variant="contained" type="submit">
                Login
              </Button>
              <Button variant="contained" href="/register">
                Sign up
              </Button>
            </List>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
