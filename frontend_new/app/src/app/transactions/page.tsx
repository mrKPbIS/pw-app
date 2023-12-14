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
  ListItemIcon,
  Link,
} from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import { useState, useEffect, SyntheticEvent } from "react";
import { getTransactions, GetTransactionsItemResponse } from "../api/api";
import { getToken, getUser, logout } from "../api/auth";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants";

export default function TransactionsList() {
  const [data, setData] = useState({ transactions: new Array(), count: 0 });
  const { transactions, count } = data;
  const router = useRouter();

  const token = getToken();

  const logoutHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

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
  }, [token]);

  const pages = count ? Math.ceil(count / transactions.length) : 0;
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PW app
          </Typography>
          <Button color="inherit" onClick={logoutHandler}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Button variant="contained" href={APP_ROUTES.PROFILE}>
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
  const { id, owner, recipient, amount } = props.transaction;
  let elem;
  if (userId === owner.id) {
    elem = (
      <ListItem>
        <ListItemText primary={recipient.name} secondary="Transferred to" />
        <ListItemIcon >
          <Link href={`${APP_ROUTES.TRANSACTIONS}/create?duplicate=${id}`}>
            <ReplayIcon />
          </Link>
        </ListItemIcon>
        <Typography align="right">{amount}</Typography>
      </ListItem>
    );
  } else {
    elem = (
      <ListItem>
        <ListItemText primary={owner.name} secondary="Received from"/>
        <Typography align="right" color="green">
          +{amount}
        </Typography>
      </ListItem>
    );
  }
  return elem;
}
