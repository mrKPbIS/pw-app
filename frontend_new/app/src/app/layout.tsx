"use client";

import {
  Box,
} from "@mui/material";

export default function RootLayout(props: {
  children: React.ReactNode;
  toolbar: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body>
        <Box>
          {props.toolbar}
          {props.children}
        </Box>
      </body>
    </html>
  );
}
