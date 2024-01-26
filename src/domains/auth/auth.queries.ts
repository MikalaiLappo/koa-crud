const authQueries = {
  select: {
    getSignInUser: (usernameOrEmail: string) => ({
      text: "SELECT id, username, role, password FROM users WHERE username=$1 OR email=$1",
      values: [usernameOrEmail],
    }),
    getVerificationUser: (id: number) => ({
      text: "SELECT id, role FROM users WHERE id=$1",
      values: [id],
    }),
  },
  update: {},
} as const
export { authQueries }
