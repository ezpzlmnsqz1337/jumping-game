import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class Position extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
}

export class Rotation extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") w: number = 0;
}

export class Player extends Schema {
  @type(Position) position: Position = new Position();
  @type(Rotation) rotation: Rotation = new Rotation();
  @type("string") status: string = "in_lobby";
  @type("string") color: string = "blue";
  @type("boolean") collissionEnabled: boolean = true;
  @type("string") nickname: string = "player";
}

export class TimeEntry extends Schema {
  @type("string") nickname: string;
  @type("number") time: number;
  @type("string") timeStr: string;
  @type("number") checkpoints: number;
}

export class ChatMessage extends Schema {
  @type("string") nickname: string;
  @type("string") text: string;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([ TimeEntry ]) times = new ArraySchema<TimeEntry>();
  @type([ ChatMessage ]) chatMessages = new ArraySchema<ChatMessage>();
}
