import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import List from './List';

@Table({
  tableName: 'boards',
  timestamps: true,
})
class Board extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @HasMany(() => List)
  lists?: List[];
}

export default Board;
