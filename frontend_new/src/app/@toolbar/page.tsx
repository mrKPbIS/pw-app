"use client";

import { APP_ROUTES } from "@/constants";
import { AppBar, Typography, Button, Toolbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import { isAuthenticated, logout } from "../utils/auth";

export default function AppToolbar() {
  let [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const logoutHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    logout();
    router.push(APP_ROUTES.LOGIN);
  };
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PW app
        </Typography>
        {isAuth ? (
          <Button color="inherit" onClick={logoutHandler}>
            Logout
          </Button>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
