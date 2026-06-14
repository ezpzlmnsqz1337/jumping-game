import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";
import { after, before, beforeEach, describe, it } from "mocha";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { MyRoomState } from "../src/rooms/schema/MyRoomState";
import { MyRoom } from "../src/rooms/MyRoom";
import { Player, TimeEntry } from "../src/rooms/schema/MyRoomState";

function createTimeEntry(nickname: string, checkpoints: number, time: number, timeStr: string): TimeEntry {
  const entry = new TimeEntry();
  entry.nickname = nickname;
  entry.checkpoints = checkpoints;
  entry.time = time;
  entry.timeStr = timeStr;
  return entry;
}

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("connecting into a room", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<MyRoomState>("my_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);

    // make your assertions
    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

    // wait for state sync
    await room.waitForNextPatch();

    const syncedState = (client1.state as unknown as { toJSON: () => Record<string, unknown> }).toJSON() as {
      players: Record<string, { nickname: string }>;
      times: unknown[];
      chatMessages: unknown[];
    };
    assert.ok(syncedState.players[client1.sessionId]);
    assert.strictEqual(syncedState.players[client1.sessionId].nickname, "player");
    assert.strictEqual(Array.isArray(syncedState.times), true);
    assert.strictEqual(Array.isArray(syncedState.chatMessages), true);
  });
});

describe("MyRoom unit behavior", () => {
  it("sorts times by checkpoints and then by time", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    room.addTime(createTimeEntry("A", 10, 2000, "00:02.000"));
    room.addTime(createTimeEntry("B", 8, 3000, "00:03.000"));
    room.addTime(createTimeEntry("C", 10, 1500, "00:01.500"));

    assert.strictEqual(room.state.times[0].nickname, "B");
    assert.strictEqual(room.state.times[1].nickname, "C");
    assert.strictEqual(room.state.times[2].nickname, "A");
  });

  it("updates player transform and profile within speed limit", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    const existing = new Player();
    room.state.players.set("p1", existing);
    room.playerLastUpdate.set("p1", Date.now() - 100); // 100ms ago

    const incoming = new Player();
    // Move 10 units in 0.1 seconds = 100 units/second (under 250 units/second limit)
    incoming.position.x = 10;
    incoming.position.y = 2;
    incoming.position.z = 3;
    incoming.rotation.x = 4;
    incoming.rotation.y = 5;
    incoming.rotation.z = 6;
    incoming.rotation.w = 7;
    incoming.nickname = "runner";
    incoming.collisionEnabled = false;
    incoming.color = "red";
    incoming.status = "in_game";

    room.updatePlayerInfo({ sessionId: "p1", send: () => {} } as never, incoming as never);

    const updated = room.state.players.get("p1");
    assert.strictEqual(updated.position.x, 10);
    assert.strictEqual(updated.position.y, 2);
    assert.strictEqual(updated.position.z, 3);
    assert.strictEqual(updated.rotation.x, 4);
    assert.strictEqual(updated.rotation.y, 5);
    assert.strictEqual(updated.rotation.z, 6);
    assert.strictEqual(updated.rotation.w, 7);
    assert.strictEqual(updated.nickname, "runner");
    assert.strictEqual(updated.collisionEnabled, false);
    assert.strictEqual(updated.color, "red");
    assert.strictEqual(updated.status, "in_game");
  });

  it("rejects fast movement and sends correction", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    const existing = new Player();
    existing.position.x = 0;
    existing.position.y = 0;
    existing.position.z = 0;
    room.state.players.set("p1", existing);
    
    // Simulate previous update exactly 100ms ago to control delta
    room.playerLastUpdate.set("p1", Date.now() - 100);

    const incoming = new Player();
    incoming.position.x = 50; // Move 50 units in 0.1s = 500 units/sec (limit is 250)
    incoming.position.y = 0;
    incoming.position.z = 0;

    let sentCorrection = false;
    room.updatePlayerInfo({ 
      sessionId: "p1", 
      send: (type: string, data: never) => {
        if (type === 'player:correction') {
          sentCorrection = true;
          assert.strictEqual((data as { position: { x: number } }).position.x, 0);
        }
      } 
    } as never, incoming as never);

    const updated = room.state.players.get("p1");
    // Position should NOT have been updated to 50
    assert.strictEqual(updated.position.x, 0);
    assert.strictEqual(sentCorrection, true);
  });

  it("allows fast movement when teleport flag is present", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    const existing = new Player();
    room.state.players.set("p1", existing);
    room.playerLastUpdate.set("p1", Date.now() - 100);

    const incoming = new Player();
    incoming.position.x = 50; // Move 50 units in 0.1s = 500 units/sec

    let sentCorrection = false;
    
    // We only send it ONCE WITH the flag, no need to send it without the flag first (which triggers the correction that isn't cleared)
    (incoming as never as { teleported: boolean }).teleported = true;
    
    room.updatePlayerInfo({ 
      sessionId: "p1", 
      send: (type: string) => {
        if (type === 'player:correction') sentCorrection = true;
      } 
    } as never, incoming as never);

    const updated = room.state.players.get("p1");
    assert.strictEqual(updated.position.x, 50); // Allowed because of teleport flag
    assert.strictEqual(sentCorrection, false);
  });

  it("adds chat message and broadcasts player message", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    const player = new Player();
    player.nickname = "chat-user";
    player.color = "green";
    room.state.players.set("p1", player);

    const broadcasts: Array<{ type: string; payload: unknown }> = [];
    (room as unknown as { broadcast: (type: string, payload: unknown) => void }).broadcast = (
      type,
      payload
    ) => broadcasts.push({ type, payload });

    room.handleChatMessage("p1", "hello world");

    assert.strictEqual(room.state.chatMessages.length, 1);
    assert.strictEqual(room.state.chatMessages[0].nickname, "chat-user");
    assert.strictEqual(room.state.chatMessages[0].text, "hello world");
    assert.strictEqual(broadcasts.length, 1);
    assert.strictEqual(broadcasts[0].type, "chat:update");
    assert.deepStrictEqual(broadcasts[0].payload, {
      playerId: "p1",
      nickname: "chat-user",
      color: "green",
      text: "hello world",
    });
  });

  it("removes player and emits disconnect plus server chat message on leave", () => {
    const room = new MyRoom();
    room.setState(new MyRoomState());

    const player = new Player();
    player.nickname = "leaver";
    room.state.players.set("p1", player);

    const broadcasts: Array<{ type: string; payload: unknown }> = [];
    (room as unknown as { broadcast: (type: string, payload: unknown) => void }).broadcast = (
      type,
      payload
    ) => broadcasts.push({ type, payload });

    room.onLeave({ sessionId: "p1" } as never, true);

    assert.strictEqual(room.state.players.has("p1"), false);
    assert.strictEqual(broadcasts.length, 2);
    assert.deepStrictEqual(broadcasts[0], {
      type: "player:disconnected",
      payload: "p1",
    });
    assert.deepStrictEqual(broadcasts[1], {
      type: "chat:update",
      payload: {
        playerId: "server",
        nickname: "Server",
        color: "gray",
        text: "Player leaver disconnected.",
      },
    });
  });
});
