import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Loading, useDataProvider } from "react-admin";

export const UserProfile = () => {
  const userId = jwtDecode<{ id }>(localStorage.getItem("auth") || "").id;
  const dataProvider = useDataProvider();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    balance: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  useEffect(() => {
    dataProvider
      .getOne("users", { id: userId })
      .then(({ data }) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <ul>
      <li>Name: {user.name}</li>
      <li>Email: {user.email}</li>
      <li>Balance: {user.balance}</li>
    </ul>
  );
};
