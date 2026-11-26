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
      unique: true,
    },
    password: {
      name: "Password",
      type: "text",
    },
    isActive: {
      name: "IsActive",
      type: "boolean",
      default: true,
    },
    createdAt: {
      name: "CreatedAt",
      type: "timestamptz",
      createDate: true,
    },
    updatedAt: {
      name: "UpdatedAt",
      type: "timestamptz",
      updateDate: true,
    },
  },
  relations: {
    batches: {
      type: "one-to-many",
      target: "Batch",
      inverseSide: "user",
    },
    pushTokens: {
      type: "one-to-many",
      target: "PushToken",
      inverseSide: "user",
    },
  },
});

export default UserEntity;
