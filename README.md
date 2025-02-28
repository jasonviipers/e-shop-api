# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.


```bash
/api
├── src
│   ├── config         # Configuration files (e.g., environment variables, constants)
│   ├── controllers    # Request handlers/business logic for each route
│   ├── middlewares    # Custom middleware functions
│   ├── models         # Database models/ORM definitions (if applicable)
│   ├── routes         # Route definitions that bind URLs to controllers
│   ├── services       # Business logic, integration with external APIs, etc.
│   ├── utils          # Helper functions and utilities
│   └── index.ts       # Entry point: initialize the ElysiaJS app, apply middleware, register routes
├── tests              # Unit/integration tests
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── .env               # Environment variables
└── README.md          # Project documentation
```