import jwtDecode from "jwt-decode";
import React from "react";
import {
  AutocompleteInput,
  CloneButton,
  Create,
  Datagrid,
  FunctionField,
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
  const userId = jwtDecode<{ id }>(localStorage.getItem("auth") || "").id;
  return (
    <List emptyWhileLoading>
      <Datagrid>
        <ShowButton />
        <FunctionField label="amount" render={record => `${record.recipientId === userId? '+': '-'}${record.amount}`}/>
        <TextField label="from" source="owner.name"/>
        <TextField label="to" source="recipient.name"/>
        <FunctionField label="balance" render={record => `${record.recipientId === userId? record.recipientBalance: record.ownerBalance}`} />
        <TextField source="createdAt" />
      </Datagrid>
    </List>
  );
};

export const TransactionShow = () => {
  useAuthenticated();
  const userId = jwtDecode<{ id }>(localStorage.getItem("auth") || "").id;
  return (
    <Show actions={<CloneButton />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="amount" />
        <TextField source="recipient.name" />
        <TextField source="owner.name" />
        <FunctionField label="balance" render={record => `${record.recipientId === userId? record.recipientBalance: record.ownerBalance}`} />
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
