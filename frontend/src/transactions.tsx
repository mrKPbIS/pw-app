import React from "react"
import { Datagrid, List, TextField } from "react-admin"

export const TransactionsList = () => {
  return <List>
    <Datagrid>
      <TextField source='id'/>
      <TextField source='ownerId'/>
      <TextField source='recipientId'/>
      <TextField source='amount'/>
      <TextField source='amountAfter'/>
    </Datagrid>
  </List>
}
