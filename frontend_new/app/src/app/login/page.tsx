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
  Alert,
} from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../utils/api";
import { isAuthenticated, saveToken } from "../utils/auth";
import { validatePassword, validateEmail } from "../utils/validators";
import { APP_ROUTES } from "@/constants";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  if (isAuthenticated()) {
    router.push(APP_ROUTES.PROFILE);
  }

  const validateForm = () => {
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

    setEmailError(emailResult);
    setPasswordError(passwordResult);

    return emailResult || passwordResult;
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (validateForm()) {
      return;
    }
    try {
      const res = await login({ email, password });
      if (res.success && res.data) {
        saveToken(res.data);
        router.push(APP_ROUTES.PROFILE);
      } else if (res.error) {
        throw new Error(res.error.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        console.log(error);
      }
    }
  };

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
                  error={passwordError}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </ListItem>

              <Button variant="contained" type="submit">
                Login
              </Button>
              <Button variant="contained" href={APP_ROUTES.REGISTER}>
                Sign up
              </Button>
            </List>
          </form>
          { emailError? <Alert severity="error" >Email should be email</Alert>: null}
          { passwordError? <Alert severity="error" >Password is too short</Alert>: null}
          { serverError? <Alert severity="error">{serverError}</Alert>: null}
        </Paper>
      </Container>
    </Box>
  );
}
