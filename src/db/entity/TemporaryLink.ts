import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BreadUser} from "./BreadUser";

@Entity()
export class TemporaryLink {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  secret: string

  @Column()
  userId: string

  @Column()
  channelId: string

  @Column()
  guildId: string

  @Column()
  expirationTime: number
}