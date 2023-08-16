import React from "react";
import {
  AutocompleteInput,
  CloneButton,
  Create,
  Datagrid,
  List,
  ReferenceInput,
  Show,
  ShowButton,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  useAuthenticated,
} from "react-admin";

export const TransactionsList = () => {
  useAuthenticated();
  return (
    <List>
      <Datagrid>
        <ShowButton />
        <TextField source="amount" />
        <TextField source="recipient.name" />
        <TextField source="amountAfter" />
        <TextField source="createdAt" />
      </Datagrid>
    </List>
  );
};

export const TransactionShow = () => {
  useAuthenticated();
  return (
    <Show actions={<CloneButton />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="amount" />
        <TextField source="recipient.name" />
        <TextField source="amountAfter" />
        <TextField source="createdAt" />
      </SimpleShowLayout>
    </Show>
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
