"use client";

import { getUsers, createTransaction, GetTransactionsItemResponse, getTransaction } from "@/app/api/api";
import { getToken, isAuthenticated, logout } from "@/app/api/auth";
import { validateNumberString } from "@/app/api/validators";
import { APP_ROUTES } from "@/constants";
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
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";

const DEFAULT_AMOUNT = '0.00';

export default function TransactionCreateForm(props: { searchParams: { duplicate: string }}) {
  const { duplicate: duplicateId } = props.searchParams;

  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [recipient, setRecipient] = useState();
  const [usersList, setUsersList] = useState(new Array());
  const [recipientError, setRecipientError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push(APP_ROUTES.LOGIN);
  }
  const token = getToken();

  const logoutHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

  useEffect(() => {
    async function fetchData() {
      try {
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
        } else if (req.error) {
          throw new Error(req.error.message);
        }
      } catch(error) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          console.log(error);
        }
      }
    }

    fetchData();
  }, [token, duplicateId]);

  const validateForm = () => {
    const recipientResult = recipient === undefined;
    const amountResult = validateNumberString(amount, { min: 0, decimalDigits: 2 });

    setRecipientError(recipientResult);
    setAmountError(amountResult);


    return recipientResult || amountResult;
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (validateForm()) {
      return;
    }
    try {
      const req = await createTransaction(
        { amount, recipientId: recipient },
        token,
        );
        if (req.success && req.data) {
          router.push(APP_ROUTES.PROFILE);
        } else if (req.error) {
          throw new Error(req.error.message);
        }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
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
          <Button color="inherit" onClick={logoutHandler}>Logout</Button>
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
                    setRecipient(value?.id);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Recipient" />
                  )}
                  // value={
                  //   (duplicateId && usersList.length)? usersList.filter(it => it.id === recipient)[0]: null
                  // }
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
          { recipientError? <Alert severity="error" >Select a recipient for transaction</Alert>: null}
          { amountError? <Alert severity="error" >Amount should be a number with two decimal digits</Alert>: null}
          { serverError? <Alert severity="error">{serverError}</Alert>: null}
        </Paper>
      </Container>
    </Box>
  );
}
