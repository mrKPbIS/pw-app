"use client";

import {
  Box,
  Button,
  Container,
  List,
  ListItemText,
  ListItemButton,
  AppBar,
  Typography,
  Paper,
  Toolbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import { getProfile } from "../api/api";
import { getToken, getUser, isAuthenticated, logout } from "../api/auth";

export default function Profile() {
  const [data, setData] = useState({ name: "", email: "", balance: "" });
  const { id: userId } = getUser();
  const token = getToken();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push("/login");
  }

  const logoutHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    logout();
    router.push("/login");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getProfile(token, userId);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          console.log(res.error);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PW app
          </Typography>
          <Button color="inherit" onClick={logoutHandler}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <List>
            <ListItemText primary={data.name} secondary="Name" />
            <ListItemText primary={data.email} secondary="Email" />
            <ListItemText primary={data.balance} secondary="Balance" />
            <ListItemButton href="/transactions/create?t=test">
              <ListItemText primary="New transaction" />
            </ListItemButton>
            <ListItemButton href="/transactions">
              <ListItemText primary="Transactions history" />
            </ListItemButton>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}
