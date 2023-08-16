import React from "react";
import {
  AutocompleteInput,
  Create,
  Datagrid,
  List,
  ReferenceInput,
  SimpleForm,
  TextField,
  TextInput,
  useAuthenticated,
} from "react-admin";

export const TransactionsList = () => {
  useAuthenticated();
  return (
    <List>
      <Datagrid>
        <TextField source="amount" />
        <TextField source="recipient.name" />
        <TextField source="amountAfter" />
        <TextField source="createdAt" />
      </Datagrid>
    </List>
  );
};

export const TransactionCreate = () => {
  useAuthenticated();
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="recipientId" reference="users">
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <TextInput source="amount" />
      </SimpleForm>
    </Create>
  );
};
