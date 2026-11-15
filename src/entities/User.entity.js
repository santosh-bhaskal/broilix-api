import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema({
  name: "User",
  tableName: "tbl_user",
  columns: {
    id: {
      name: "Id",
      type: "int",
      primary: true,
      generated: true,
    },
    firstName: {
      name: "FirstName",
      type: "text",
    },
    lastName: {
      name: "LastName",
      type: "text",
    },
    email: {
      name: "Email",
      type: "text",
    },
    password: {
      name: "Password",
      type: "text",
    },
  },
  relations: {
    batches: {
      type: "one-to-many",
      target: "Batch",
      inverseSide: "user",
    },
  },
});

export default UserEntity;
