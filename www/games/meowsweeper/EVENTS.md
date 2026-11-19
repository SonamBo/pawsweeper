# Meowsweeper events

Sent with `host.track`. The shell's own events are in `docs/ANALYTICS.md`.

## The board

| Event | When | Params |
|---|---|---|
| `board_start` | a fresh board is dealt | `level`, `cols`, `rows`, `cats`, `hard` |
| `special_start` | a special board starts (shape, lantern night, cat nap) | `level`, `type` |
| `heart_lost` | a cat is woken | `level`, `hearts` (left) |
| `heart_offer` | the out-of-hearts card opens | `level`, `k` (1st or 2nd extra), `price`, `coins`, `buy`, `ad` |
| `heart_buy_coins` | Get coins is tapped on that card | `level`, `k`, `short` (coins missing) |
| `extra_heart` | an extra heart is bought or earned by ad | `level`, `n` (1 or 2), `how` (`coins`, `ad`), `price` |
| `booster_used` | a booster is used | `level`, `booster` (`hint`, `sniff`, `scan`, `catnip`) |
| `coach_step` | a tutorial pointer shows | `step` (1, 2, `diary`, `stars`) |
| `replay_start` | an old level is replayed for its stars | `level` |
| `replay_win` | a replayed level is won | `level`, `stars`, `gained` (new stars) |
| `daily_start` | the puzzle of the day starts | — |
| `daily_win` | the puzzle of the day is solved | `ms`, `hearts`, `streak` |

## Whiskerwood Manor

| Event | When | Params |
|---|---|---|
| `restore_offer` | the "decorate now?" card shows after a win | `room` |
| `restore_offer_go` | Decorate is tapped on it | `room` |
| `decorate` | an object is placed in a room | `room`, `obj` (1–6), `style` (`cottage`, `pastel`, `royal`), `round`, `cost` |
| `room_complete` | the sixth object of a room is placed | `room`, `round` |
| `room_open` | the next room opens (10 levels won and six objects placed) | `room`, `chapter` (rooms opened so far), `level` |
| `keepsake_found` | a keepsake rises from a cushion | `room`, `n` (1 or 2) |
| `letter_read` | the Duchess's letter is first read | — |
| `friend_level` | a cat's friendship goes up a level | `cat`, `level` |
| `share_room` | a room is shared as a before-and-after picture | `room`, `objects` |
| `settings_change` | a game setting is switched | `key` (`cb`, `left`, `vib`), `on` |
