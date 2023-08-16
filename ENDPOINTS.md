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
  "data": "string"
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
  "data": "string"
}
```

### Create transaction
method: `POST` url: `/api/transactions`

request:
auth: Bearer token
```json
{
  "recipientId": "number",
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
    "recipientId": "number",
    "recipient": {
      "id": "number",
      "name": "string"
    },
    "ownerId": "number",
    "owner": {
      "id": "number",
      "name": "string"
    },
    "amount": "string",
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
  "data": {
    "transactions": [
      {
        "id": "string",
        "recipientId": "number",
        "recipient": {
          "id": "number",
          "name": "string"
        },
        "ownerId": "number",
        "owner": {
          "id": "number",
          "name": "string"
        },
        "amount": "string",
        "amountAfter": "string",
        "createdAt": "string"
      }
    ],
    "count": "number"
  }
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
  "data": {
    "id": "string",
    "recipientId": "number",
    "recipient": {
      "id": "number",
      "name": "string"
    },
    "ownerId": "number",
    "owner": {
      "id": "number",
      "name": "string"
    },
    "amount": "string",
    "amountAfter": "string",
    "createdAt": "string"
  }
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

### Get user details by id
Method: `GET` url: `/api/users/:id`

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
  "data": {
    "users": [
     {
      "id": "string",
      "name": "string",
      "email": "string",
      }
    ],
    "count": "number"
  }
}
```