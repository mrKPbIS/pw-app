import React from "react";
import {
  Admin, CustomRoutes, Resource,
} from "react-admin";

import { Route } from "react-router-dom";

import { authProvider } from "./authProvider";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { CustomLayout } from "./Menu";
import { UserProfile } from "./Profile";
import { TransactionCreate, TransactionsList } from './transactions';

export const App = () => (
  // eslint-disable-next-line no-undef
  <Admin authProvider={authProvider} dataProvider={dataProvider} layout={CustomLayout} >
    <CustomRoutes>
      <Route path='/profile' element={<UserProfile />} />
    </CustomRoutes>
    <Resource
      name="transactions"
      create={TransactionCreate}
      list={TransactionsList}
    />
  </Admin>
);
