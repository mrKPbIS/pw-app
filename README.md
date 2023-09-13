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
1. ~~Add errors handling~~
1. ~~Add input validation~~
1. ~~Add indexes~~
1. ~~Add tests~~
1. ~~Add sockets.io~~
1. ~~Sockets.io evento on new transaction~~
1. Fix TODO's

Frontend TODO:
1. ~~Create react app~~
1. ~~Create profile page~~
1. ~~Create transactions list~~
1. ~~Create login page~~
1. ~~Transaction create page~~
1. ~~Create registration page~~
1. ~~Add search by name to transaction create~~
1. ~~Add transaction duplicate~~
1. ~~Add validation to transaction create~~
1. ~~Sort transactions in list~~


## Current problems

1. [App crashes with dataSource synchronization](backend/src/adapters/dataSource.ts#28)
1. [Login page renders in upper left corner](frontend/src/App.tsx)

[Endpoints description](ENDPOINTS.md)

## Tables description

### User
- id: integer, autoincrement, PK, not null
- name: varchar(100), not null, index
- email: varchar(500), not null, index
- password: varchar(64), not null
- balance: varchar(15), not null
- created_at: datetime

### Transaction
- id: uuid, PK, not null
- ownerId: number, FK(user), not null
- recipientId: number, FK(user), not null, index
- amount: varchar(15), not null
- amountAfter: varchar(15), not null
- created_at: datetime

### Sockets

postman workspace: https://www.postman.com/speeding-resonance-3855/workspace/pw-app/collection/65007d08fdf5370744b0f96b?action=share&creator=8044404