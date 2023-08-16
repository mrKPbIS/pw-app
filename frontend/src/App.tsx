import React from "react";
import { Admin, Authenticated, CustomRoutes, Resource } from "react-admin";

import { Route } from "react-router-dom";

import { authProvider } from "./authProvider";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { CustomLayout } from "./Menu";
import { UserProfile } from "./Profile";
import { RegistrationForm } from "./Registration";
import { TransactionCreate, TransactionsList } from "./transactions";
import { LoginForm } from "./Login";

export const App = () => (
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
    />
  </Admin>
);
