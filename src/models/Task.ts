import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import List from './List';

@Table({
  tableName: 'tasks',
  timestamps: true,
})
class Task extends Model {
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

  @ForeignKey(() => List)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  listId!: number;

  @BelongsTo(() => List)
  list!: List;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  taskOrder!: number;
}

export default Task;
