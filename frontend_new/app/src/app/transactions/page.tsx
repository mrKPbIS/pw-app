"use client";

import {
  Container,
  List,
  ListItemText,
  Button,
  Typography,
  Paper,
  ListItem,
  Pagination,
  ListItemIcon,
  Link,
  CircularProgress,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { useState, useEffect, SyntheticEvent } from "react";
import { getTransactions, GetTransactionsItemResponse } from "../utils/api";
import { getToken, getUser, logout } from "../utils/auth";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants";

const PAGE_LIMIT = 10;

export default function TransactionsList() {
  const [data, setData] = useState({ transactions: new Array(), count: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const { transactions, count } = data;
  const token = getToken();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getTransactions(
          token,
          (page - 1) * PAGE_LIMIT,
          PAGE_LIMIT,
        );
        if (res.success && res.data) {
          setData(res.data);
        } else {
          console.log(res.error);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token, page]);

  const handlePagination = async (event: any, page: number) => {
    setPage(page);
  };

  const pages = count ? Math.ceil(count / PAGE_LIMIT) : 0;
  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Button variant="contained" href={APP_ROUTES.PROFILE}>
          Back
        </Button>

        <List>
          {isLoading ? (
            <CircularProgress />
          ) : transactions.length ? (
            transactions.map((item) => {
              return <TransactionsItem key={item.id} transaction={item} />;
            })
          ) : (
            <Typography variant="h6" component="div">
              No transactions
            </Typography>
          )}
          <Pagination count={pages} onChange={handlePagination} />
        </List>
      </Paper>
    </Container>
  );
}

function TransactionsItem(props: { transaction: GetTransactionsItemResponse }) {
  const { id: userId } = getUser();
  const {
    id,
    owner,
    recipient,
    amount,
    createdAt,
    ownerBalance,
    recipientBalance,
  } = props.transaction;
  let elem;
  if (userId === owner.id) {
    elem = (
      <ListItem>
        <ListItemText
          primary={`Transferred to ${recipient.name}`}
          secondary={createdAt.toLocaleString()}
        />
        <ListItemIcon>
          <Link href={`${APP_ROUTES.TRANSACTIONS}/create?duplicate=${id}`}>
            <ReplayIcon />
          </Link>
        </ListItemIcon>
        <Typography align="right">
          {ownerBalance} (-{amount})
        </Typography>
      </ListItem>
    );
  } else {
    elem = (
      <ListItem>
        <ListItemText
          primary={`Received from ${owner.name}`}
          secondary={createdAt.toLocaleString()}
        />
        <Typography align="right" color="green">
          {recipientBalance} (+{amount})
        </Typography>
      </ListItem>
    );
  }
  return elem;
}
