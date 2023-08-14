import { Card, CardContent, CardHeader } from "@mui/material";
import jwtDecode from "jwt-decode";
import React from "react";
import { DataProvider } from "react-admin";

export const Dashboard = () => (
    <Card>
        <CardHeader title="Welcome to the administration" />
        <CardContent>Lorem ipsum sic dolor amet...</CardContent>
    </Card>
);

// export const Dashboard = async (dataProvider: DataProvider) => {
//     const token = localStorage.getItem('auth');
//     if (!token) {
//         throw new Error('no user');
//     }
//     const tokenData = jwtDecode<{ id: string, email: string }>(token);
//     const user = await dataProvider.getOne('users', { id: tokenData.id });
//     console.log(user);

//     return () => (
//         <Card>
//             <CardHeader title='hello world' />
//             <CardContent>Text should be here</CardContent>
//         </Card>
//     )

// }