import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'userActionLogs',
  timestamps: true,
})
class UserActionLogs extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;
}

export default UserActionLogs;
