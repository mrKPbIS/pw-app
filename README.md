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
1. ~~Create user profile endpoints~~
1. ~~Create transaction endpoints~~
1. Add errors handling and input validation
1. Add indexes
1. Add tests
1. Fix TODO's

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
  },
  "data": {
    "token": "string"
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
  },
  "data": {
    "token": "string"
  }
}
```

### Create transaction
method: `POST` url: `/api/transactions`

request:
auth: Bearer token
```json
{
  "recipient": "string",
  "amount": "string",
}
```

response:
```json
{
  "success": "boolean",
  "error": {
    "code": "number",
    "message": "string"
  },
  "data": {
    "id": "string",
    "amountAfter": "string",
    "createdAt": "string"
  }
}
```

### Get transactions list for authorized user
Method: `GET` url: `api/transactions?offset=0&limit=0`

request:

auth: Bearer token

response:
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
      "senderId": "string",
      "recipientId": "string",
      "createdAt": "string",
      "amount": "string",
      "amountAfter": "string"
    }
  ]
}
```

### Get transaction details for authorized user
Method: `GET` url: `/api/transactions/:id`

request:

auth: Bearer token

response:
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
      "senderId": "string",
      "recipientId": "string",
      "amount": "string",
      "amountAfter": "string",
      "createdAt": "string"
    }
  ]
}
```

### Get authorized user profile
Method: `GET` url: `/api/users/profile`

request:

auth: Bearer token

response:
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

### get users list
Method: `GET` url: `/api/users?name=text&offset=0&limit=0`

request:

auth: Bearer token

response:
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
  }]
}
```

## Tables description

### User
- id: integer, autoincrement, PK, not null
- name: varchar(100), not null, index
- email: varchar(500?), not null, index
- password: varchar(100), not null
- balance: varchar(15), not null
- createdAt: timestamp

### Transaction
- id: uuid, PK, not null
- owner: number, FK(user), not null, index
- recipient: number, FK(user), not null
- amount: varchar(15), not null
- amountAfter: varchar(15), not null
- createdAt: timestamp