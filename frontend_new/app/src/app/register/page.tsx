"use client";

import {
  Alert,
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
} from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../api/api";
import { isAuthenticated, saveToken } from "../api/auth";
import { validateConfirmPassword, validateEmail, validateString, validatePassword } from "../api/validators";
import { APP_ROUTES } from "@/constants";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  if (isAuthenticated()) {
    router.push(APP_ROUTES.PROFILE);
  }

  const validateForm = () => {
    const nameResult = validateString(name);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmPasswordResult = validateConfirmPassword(password, confirmPassword);

    setNameError(nameResult);
    setEmailError(emailResult);
    setPasswordError(passwordResult);
    setConfirmPasswordError(confirmPasswordResult);

    return nameResult || emailResult || passwordResult || confirmPasswordResult;
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (validateForm()) {
      return;
    }
    try {
      const res = await register({ email, name, password });
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
                <ListItemText primary="Name" />
                <TextField
                  id="auth-name"
                  label="name"
                  variant="filled"
                  value={name}
                  error={nameError}
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
                  error={emailError}
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
                  error={passwordError}
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
                  error={confirmPasswordError}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </ListItem>

              <Button variant="contained" type="submit">
                Register
              </Button>
              <Button variant="contained" href={APP_ROUTES.LOGIN}>
                Back
              </Button>
            </List>
          </form>
          { nameError? <Alert severity="error" >Name is empty</Alert>: null}
          { emailError? <Alert severity="error" >Email should be email</Alert>: null}
          { passwordError? <Alert severity="error" >Password is too short</Alert>: null}
          { confirmPasswordError? <Alert severity="error" >Passwords don&apos;t match</Alert>: null}
          { serverError? <Alert severity="error">{serverError}</Alert>: null}
        </Paper>
      </Container>
    </Box>
  );
}
