const usersQueries = {
  select: {
    usersPublicData: "SELECT username, createdAt FROM users",
    usersFullDataAdmin: "SELECT * FROM users",

    userPublicData: (id: number) => ({
      text: "SELECT username, createdAt FROM users WHERE id=$1",
      values: [id],
    }),
    userFullDataAdmin: (id: number) => ({
      text: "SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id=$1",
      values: [id],
    }),
  },
  update: {
    /**
     * TODO: write a generic builder for such entries into SQL spread
     * @param id -- user's to update id
     * @param entries -- should be filtered on service level
     */
    userData: (
      id: number,
      entries: [key: string, value: string | number][],
    ) => {
      const valuesPlaceholders = entries
        .map(([key], i) => `${key}=$${i + 2}`)
        .join(",")
      const returnPlaceholders = entries.map(([key]) => key).join(",")
      const values = entries.map(([, value]) => value)
      return {
        text: `UPDATE users SET ${valuesPlaceholders} WHERE id=$1 RETURNING ${returnPlaceholders}`,
        values: [id, ...values],
      }
    },
  },

  delete: {
    user: (id: number) => ({
      text: "DELETE FROM users WHERE id=$1 RETURNING id",
      values: [id],
    }),
  },

  insert: {},
} as const
export { usersQueries }
