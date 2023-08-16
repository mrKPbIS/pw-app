import React from "react";
import { Layout, Menu } from "react-admin";
import LabelIcon from "@mui/icons-material/Label";
import ProfileIcon from "@mui/icons-material/Person";

export const CustomMenu = () => (
  <Menu>
    <Menu.DashboardItem />
    <Menu.Item to="/profile" primaryText="Profile" leftIcon={<ProfileIcon />} />
    <Menu.Item
      to="transactions/create"
      primaryText="Create transaction"
      leftIcon={<LabelIcon />}
    />
    <Menu.ResourceItem name="transactions" />
  </Menu>
);

export const CustomLayout = (props) => <Layout {...props} menu={CustomMenu} />;
