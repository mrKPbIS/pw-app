"use client";

import { getUsers, createTransaction } from "@/app/api/api";
import { getToken, isAuthenticated } from "@/app/api/auth";
import {
  Box,
  Container,
  AppBar,
  Button,
  Typography,
  Paper,
  Toolbar,
  ListItem,
  TextField,
  List,
  ListItemText,
  Autocomplete,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";

export default function TransactionCreateForm(props: any) {
  const { clone } = props;

  const [amount, setAmount] = useState(clone ? clone.amount : "");
  const [recipient, setRecipient] = useState(clone ? clone.recipientId : "");
  const [usersList, setUsersList] = useState(new Array());
  const router = useRouter();

  const token = getToken();

  if (!isAuthenticated()) {
    router.push("/login");
  }

  useEffect(() => {
    async function fetchData() {
      const req = await getUsers(token);
      if (req.success && req.data) {
        const list = req.data.users.map(({ id, name }) => {
          return { label: name, id };
        });
        setUsersList(list);
      }
    }

    fetchData();
  }, [JSON.stringify(usersList)]);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const req = await createTransaction(
      { amount, recipientId: recipient },
      token,
    );
    if (req.success && req.data) {
      router.push("/profile");
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PW app
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <form onSubmit={handleSubmit}>
            <List>
              <Button variant="contained" href="/profile">
                Back
              </Button>
              <ListItem>
                <ListItemText primary="Recipient" />
                <Autocomplete
                  id="transactions-recipient"
                  options={usersList}
                  onChange={(e, value) => {
                    setRecipient(value.id);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Recipient" />
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Amount" />
                <TextField
                  id="transaction-amount"
                  label="amount"
                  variant="filled"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </ListItem>
              <Button variant="contained" type="submit">
                Create Transaction
              </Button>
            </List>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
