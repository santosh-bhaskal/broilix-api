import { EntitySchema } from "typeorm";

// A user can sign in on more than one phone, so tokens live in their own table.
export const PushTokenEntity = new EntitySchema({
  name: "PushToken",
  tableName: "tbl_pushToken",
  columns: {
    id: { name: "Id", type: "int", primary: true, generated: true },
    userId: { name: "UserId", type: "int" },
    token: { name: "Token", type: "text", unique: true },
    deviceId: { name: "DeviceId", type: "text", nullable: true },
    platform: { name: "Platform", type: "varchar", length: 20, nullable: true },
    createdAt: { name: "CreatedAt", type: "timestamptz", createDate: true },
    updatedAt: { name: "UpdatedAt", type: "timestamptz", updateDate: true },
  },
  indices: [
    {
      name: "IDX_pushToken_user",
      columns: ["userId"],
    },
  ],
  relations: {
    user: { type: "many-to-one", target: "User", joinColumn: { name: "UserId" }, onDelete: "CASCADE" },
  },
});

export default PushTokenEntity;
