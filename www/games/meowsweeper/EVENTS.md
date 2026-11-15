# Meowsweeper events

Sent with `host.track`. The shell's own events are in `docs/ANALYTICS.md`.

| Event | When | Params |
|---|---|---|
| `board_start` | a fresh board is dealt | `level`, `cols`, `rows`, `cats`, `hard` |
| `heart_lost` | a cat is woken | `level`, `hearts` (left) |
| `extra_heart` | an extra heart is bought or earned by ad | `level`, `n` (1 or 2) |
| `booster_used` | a booster is used | `level`, `booster` (`sniff`, `scan`, `catnip`) |
