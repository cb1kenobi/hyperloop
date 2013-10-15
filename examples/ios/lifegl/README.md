# Conway's Game of Life

## What is it?

[http://en.wikipedia.org/wiki/Conway's_Game_of_Life](http://en.wikipedia.org/wiki/Conway's_Game_of_Life)

## Run

```bash
hyperloop package --platform=ios --src=examples/lifegl --dest=build/lifegl --name=lifegl --appid=com.lifegl --launch --jsengine=jsc --clean --debug --hl-small
```

## build options

* `--hl-small` - Use 4x4 cells. 10x10 is the default.
* `--hl-xsmall` - Use 2x2 cells. 10x10 is the default.
* `--hl-xxsmall` - Use 1x1 cells. 10x10 is the default.

