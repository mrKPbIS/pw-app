# pw-app

Backend TODO:

1. ~~Create DB (docker, mssql)~~
1. ~~Create dockerfile for application~~
1. ~~Describe endpoints req/res interfaces~~
1. ~~Describe DB tables~~
1. ~~Add and config eslint~~
1. ~~Create models to interact with DB (typeorm)~~
1. ~~Create db driver~~
1. ~~Create auth endpoints (jsonwebtoken)~~
1. Create user profile endpoints
1. Create transaction endpoints
1. Add errors handling and input validation
1. Add tests

Frontend TODO:
1. Create react app

## Endpoints description

### Register new user
method: `POST` url: `/api/auth/register`

request:
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```
response:
```json
{
  "success": "boolean",
  "error": {
    "code": "number",
    "message": "string"
  }
}
```

### Login user
method: `POST` url: `api/auth/login`

request:
```json
{
  "email": "string",
  "password": "string",
}
```
response
```json
{
  "success": "boolean",
  "auth_token": "string",
  "error": {
    "code": "number",
    "message": "string"
  }
}
```


logout 
auth: Bearer token
```json
{
  "success": "boolean",
  "auth_token": "string",
  "error": {
    "code": "number",
    "message": "string"
  }
}
```

create transaction
auth: Bearer token
```json
{
  "recipient": "string",
  "amount": "string",
}
```

```json
{
  "success": "boolean",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": {
    "id": "string",
    "sender": "string",
    "recipient": "string",
    "createdAt": "string",
    "amount": "string",
    "amountAfter": "string"
  }
}
```

get transactions
auth: Bearer token
url: /api/transactions?offset=0&limit=0
```json
{
  "success": "true",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": [
    {
      "id": "string",
      "sender": "string",
      "recipient": "string",
      "createdAt": "string",
      "amount": "string",
      "amountAfter": "string"
    }
  ]
}
```

get transaction details
auth: Bearer token
url: /api/transactions/:transactionId

```json
{
  "success": "true",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": [
    {
      "id": "string",
      "sender": "string",
      "recipient": "string",
      "amount": "string",
      "amountAfter": "string",
      "createdAt": "string"
    }
  ]
}
```

get user profile
auth: Bearer token
url: /api/users/profile

```json
{
  "success": "true",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "balance": "string"
  }
}
```

get users list
auth: Bearer token
url: /api/users?filter=text&offset=0&limit=0
```json
{
  "success": "true",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "balance": "string"
  }]
}
```

## Tables description

### User
- id: integer, autoincrement, PK, not null
- name: varchar(100), not null
- email: varchar(500?), not null
- password: varchar(100), not null
- balance: varchar(15), not null
- createdAt: timestamp

### Transaction
- id: uuid, PK, not null
- owner: number, FK(user), not null
- recipient: number, FK(user), not null
- amount: varchar(15), not null
- amountAfter: varchar(15), not null
- createdAt: timestamp