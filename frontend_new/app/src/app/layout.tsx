"use client";

import { Box } from "@mui/material";

export default function RootLayout(props: {
  children: React.ReactNode;
  toolbar: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Box>
          {props.toolbar}
          {props.children}
          {props.notifications}
        </Box>
      </body>
    </html>
  );
}
