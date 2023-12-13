"use client";

import {
  Box,
  Container,
  List,
  ListItemText,
  AppBar,
  Button,
  Typography,
  Paper,
  Toolbar,
  ListItem,
  Pagination,
} from "@mui/material";
import { useState, useEffect } from "react";
import { getTransactions, GetTransactionsItemResponse } from "../api/api";
import { getToken, getUser } from "../api/auth";

export default function TransactionsList() {
  const [data, setData] = useState({ transactions: new Array(), count: 0 });
  const { transactions, count } = data;

  const token = getToken();

  useEffect(() => {
    async function fetchData() {
      const res = await getTransactions(token);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        console.log(res.error);
      }
    }

    fetchData();
  }, []);

  const pages = count ? Math.ceil(count / transactions.length) : 0;
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
          <Button variant="contained" href="/profile">
            Back
          </Button>
          <List>
            {transactions.length ? (
              transactions.map((item) => {
                return <TransactionsItem key={item.id} transaction={item} />;
              })
            ) : (
              <Typography variant="h6" component="div">
                No transactions
              </Typography>
            )}
            <Pagination count={pages} />
          </List>
        </Paper>
      </Container>
    </Box>
  );
}

function TransactionsItem(props: { transaction: GetTransactionsItemResponse }) {
  const { id: userId } = getUser();
  const { owner, recipient, amount } = props.transaction;
  let elem;
  if (userId === owner.id) {
    elem = (
      <ListItem>
        <ListItemText primary={recipient.name} secondary="Transferred to" />
        <Typography align="right">{amount}</Typography>
      </ListItem>
    );
  } else {
    elem = (
      <ListItem>
        <ListItemText primary={owner.name} secondary="Received from" />
        <Typography align="right" color="green">
          +{amount}
        </Typography>
      </ListItem>
    );
  }
  return elem;
}
