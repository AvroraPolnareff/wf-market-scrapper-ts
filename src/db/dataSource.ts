import path from "path"
import { DataSource } from "typeorm"

export const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    path.join(__dirname, "/entity/**/*{.ts,.js}")
  ],
  migrations: [
    path.join(__dirname, "/migrations/**/*{.ts,.js}")
  ],
})
