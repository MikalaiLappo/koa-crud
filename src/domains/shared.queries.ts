import { TRole } from "@repo/model"

const sharedQueries = {
  insert: {
    createUser: ([username, email, password, role]: [
      string,
      string,
      string,
      TRole,
    ]) => ({
      text: "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *;",
      values: [username, email, password, role],
    }),
  },
}

export { sharedQueries }
