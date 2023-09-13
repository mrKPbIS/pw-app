import React, { useEffect, useState } from "react";
import {
  Admin,
  Authenticated,
  CustomRoutes,
  Resource,
  useNotify,
} from "react-admin";

import { Route } from "react-router-dom";

import { authProvider } from "./authProvider";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { CustomLayout } from "./Menu";
import { UserProfile } from "./Profile";
import { RegistrationForm } from "./Registration";
import {
  TransactionCreate,
  TransactionShow,
  TransactionsList,
} from "./transactions";
import { LoginForm } from "./Login";
import { socket } from './socket';
import jwtDecode from "jwt-decode";

export function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [transactionEvents, setTransactionEvents] = useState([]);
  let userId;
  try {
    userId = jwtDecode<{ id }>(localStorage.getItem("auth") || "").id;
  } catch(e) {
    userId = null;
  }
  const notify = useNotify();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTransactionEvent(transaction) {
      setTransactionEvents(previous => [...previous, transaction]);
      if (userId === transaction.recipientId) {
        notify(`Received ${transaction.amount}. Current balance: ${transaction.recipientBalance}`);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('transaction', onTransactionEvent);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('transaction', onTransactionEvent);
    };
    
    
  }, []);

  return (
  // eslint-disable-next-line no-undef
    <Admin
      loginPage={LoginForm}
      authProvider={authProvider}
      dataProvider={dataProvider}
      dashboard={Dashboard}
      layout={CustomLayout}
    >
      <CustomRoutes noLayout>
        <Route path="/register" element={<RegistrationForm />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route
          path="/profile"
          element={
            <Authenticated>
              <UserProfile />
            </Authenticated>
          }
        />
      </CustomRoutes>

      <Resource
        name="transactions"
        create={TransactionCreate}
        list={TransactionsList}
        show={TransactionShow}
      />
    </Admin>
  );
}
