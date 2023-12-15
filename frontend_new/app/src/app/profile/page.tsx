"use client";

import { APP_ROUTES } from "@/constants";
import {
  Container,
  List,
  ListItemText,
  ListItemButton,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import { getProfile } from "../utils/api";
import { getToken, getUser, isAuthenticated, logout } from "../utils/auth";

export default function Profile() {
  const [data, setData] = useState({ name: "", email: "", balance: "" });
  const [isLoading, setLoading] = useState(false);
  const { id: userId } = getUser();
  const token = getToken();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push(APP_ROUTES.LOGIN);
  }

  const logoutHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getProfile(token, userId);
        if (res.success && res.data) {
          setData(res.data);
          setLoading(false);
        } else if (res.error) {
          throw new Error(res.error.message);
        }
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    }
    fetchData();
  }, [token, userId]);

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        {/* { isLoading 
            ?<CircularProgress />   */}
        <List>
          <ListItemText primary={data.name} secondary="Name" />
          <ListItemText primary={data.email} secondary="Email" />
          <ListItemText primary={data.balance} secondary="Balance" />
          <ListItemButton href={`${APP_ROUTES.TRANSACTIONS}/create`}>
            <ListItemText primary="New transaction" />
          </ListItemButton>
          <ListItemButton href={APP_ROUTES.TRANSACTIONS}>
            <ListItemText primary="Transactions history" />
          </ListItemButton>
        </List>
      </Paper>
    </Container>
  );
}
