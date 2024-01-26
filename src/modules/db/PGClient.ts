import { Client } from "pg"

const PGClient = new Client({
  user: "postgres",
  password: "postgres",
  database: "koa_api",
  host: "localhost",
  port: 5432,
})

export default PGClient
