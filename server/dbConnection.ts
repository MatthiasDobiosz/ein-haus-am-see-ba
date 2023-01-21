import pgk from "pg";

const { Client } = pgk;

export const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "syn27X!L",
  database: "regensburg",
});
