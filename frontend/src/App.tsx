import React from "react";
import {
  Admin, Resource,
} from "react-admin";

import { Route } from "react-router-dom";

import { authProvider } from "./authProvider";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { Profile } from "./Profile";
import { TransactionsList } from './transactions';

export const App = () => (
  // eslint-disable-next-line no-undef
  <Admin authProvider={authProvider} dashboard={Dashboard} dataProvider={dataProvider}>
    <Resource
      name="transactions"
      list={TransactionsList}
    />
  </Admin>
);
