"use client";

import { APP_ROUTES } from "@/constants";
import {
  Container,
  List,
  ListItemText,
  ListItemButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "../utils/api";
import { getToken, getUser, isAuthenticated } from "../utils/auth";

export default function Profile() {
  const [data, setData] = useState({ name: "", email: "", balance: "" });
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        let token = "";
        let userId = 0;
        if (localStorage) {
          if (!isAuthenticated()) {
            router.push(APP_ROUTES.LOGIN);
          } else {
            token = getToken();
            userId = getUser().id;
          }
        }
        setLoading(true);
        const res = await getProfile(token, userId);
        if (res.success && res.data) {
          setData(res.data);
        } else if (res.error) {
          throw new Error(res.error.message);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
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
        )}
      </Paper>
    </Container>
  );
}
