import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Task from './Task';
import Board from './Board';

@Table({ tableName: 'list', timestamps: true })
class List extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @ForeignKey(() => Board)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  boardId!: number;

  @BelongsTo(() => Board)
  board!: Board;

  @HasMany(() => Task)
  tasks!: Task[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  listOrder!: number;
}

export default List;
