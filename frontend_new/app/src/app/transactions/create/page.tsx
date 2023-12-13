"use client";

import { getUsers, createTransaction, GetTransactionsItemResponse, getTransaction } from "@/app/api/api";
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

export default function TransactionCreateForm(props: { searchParams: { duplicate: string }}) {
  const { duplicate: duplicateId } = props.searchParams;

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(0);
  const [usersList, setUsersList] = useState(new Array());
  const router = useRouter();

  const token = getToken();

  if (!isAuthenticated()) {
    router.push("/login");
  }

  useEffect(() => {
    async function fetchData() {
      const req = await getUsers(token);
      let transaction = null;
      if (req.success && req.data) {
        const list = req.data.users.map(({ id, name }) => {
          return { label: name, id };
        });

        if (duplicateId) {
          const transactionReq = await getTransaction(token, duplicateId);
          if (transactionReq.success && transactionReq.data) {
            transaction = transactionReq.data;
          }
        }

        if (transaction) {
          setAmount(transaction.amount);
          setRecipient(transaction.recipientId);
        }
        
        setUsersList(list);
      }
    }

    fetchData();
  }, [JSON.stringify(usersList), amount, recipient]);

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
              <Button variant="contained" onClick={() => { router.back()}}>
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
                  value={
                    (duplicateId && usersList.length)? usersList.filter(it => it.id === recipient)[0]: { label: ""}
                  }
                  sx={{ width: 300 }}
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
                  sx={{ width: 300 }}
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
