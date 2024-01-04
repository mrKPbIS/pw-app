"use client";

import { Snackbar } from "@mui/base";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import { socket } from "../utils/socket";

export default function Notifications() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { id: userId } = getUser();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTransactionEvent(transaction: any) {
      if (userId === transaction.recipientId) {
        setOpen(true);
        setMessage(
          `Received ${transaction.amount}. Current balance: ${transaction.recipientBalance}`,
        );
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("transaction", onTransactionEvent);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("transaction", onTransactionEvent);
    };
  }, []);

  function handleClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  }

  const handleClick = (event) => {
    event.preventDefault();
    setOpen(false);
  };

  return (
    <Snackbar autoHideDuration={6000} open={open} onClose={handleClose}>
      <Alert onClose={handleClick} severity="success">
        {message}
      </Alert>
    </Snackbar>
  );
}
