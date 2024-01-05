"use client";

import {
  getUsers,
  createTransaction,
  getTransaction,
  GetTransactionsItemResponse,
} from "@/app/utils/api";
import { getToken, isAuthenticated, logout } from "@/app/utils/auth";
import { validateNumberString } from "@/app/utils/validators";
import { APP_ROUTES } from "@/constants";
import {
  Container,
  Button,
  Paper,
  ListItem,
  TextField,
  List,
  ListItemText,
  Autocomplete,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";

const DEFAULT_AMOUNT = "0.00";

export default function TransactionCreateForm(props: {
  searchParams: { duplicate: string };
}) {
  const { duplicate: duplicateId } = props.searchParams;
  const [isLoading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState(new Array());
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [recipientValue, setRecipientValue] = useState<null | {
    label: string;
    id: number;
  }>(null);
  const [recipientInputValue, setRecipientInputValue] = useState("");

  const [recipientError, setRecipientError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push(APP_ROUTES.LOGIN);
  }
  const token = getToken();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const req = await getUsers(token);
        let transaction: GetTransactionsItemResponse | null = null;
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
            const { amount, recipientId } = transaction;
            const [duplicated] = list.filter(({ id }) => id === recipientId);
            setAmount(amount);
            setRecipientValue(duplicated);
            setRecipientInputValue(duplicated.label);
          }

          setUsersList(list);
        } else if (req.error) {
          throw new Error(req.error.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token, duplicateId]);

  const validateForm = () => {
    const recipientResult = recipientValue === null;
    const amountResult = validateNumberString(amount, {
      min: 0,
      decimalDigits: 2,
    });

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
        {
          amount,
          recipientId: (recipientValue as { label: string; id: number }).id,
        },
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
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSubmit}>
            <List>
              <Button
                variant="contained"
                onClick={() => {
                  router.back();
                }}
              >
                Back
              </Button>
              <ListItem>
                <ListItemText primary="Recipient" />
                <Autocomplete
                  id="transactions-recipient"
                  options={usersList}
                  renderInput={(params) => (
                    <TextField {...params} label="Recipient" />
                  )}
                  value={recipientValue}
                  onChange={(e, value) => {
                    setRecipientValue(value);
                  }}
                  inputValue={recipientInputValue}
                  onInputChange={(e, value) => setRecipientInputValue(value)}
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
        )}
        {recipientError ? (
          <Alert severity="error">Select a recipient for transaction</Alert>
        ) : null}
        {amountError ? (
          <Alert severity="error">
            Amount should be a number with two decimal digits
          </Alert>
        ) : null}
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      </Paper>
    </Container>
  );
}
