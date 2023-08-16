import React from "react";
import {
  Create,
  Datagrid,
  List,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  SimpleList,
  TextField,
  TextInput,
  useAuthenticated,
  useGetIdentity,
} from "react-admin";

export const TransactionsList = () => {
  useAuthenticated();
  return (
    <List>
      <Datagrid>
        <TextField source="id" />
        <TextField source="recipientId" />
        <TextField source="amount" />
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
          <SelectInput optionText="name" />
        </ReferenceInput>
        <TextInput source="amount" />
      </SimpleForm>
    </Create>
  );
};
