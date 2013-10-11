# Conway's Game of Life

## What is it?

[http://en.wikipedia.org/wiki/Conway's_Game_of_Life](http://en.wikipedia.org/wiki/Conway's_Game_of_Life)

## Run

```bash
hyperloop package --platform=ios --src=examples/life --dest=build/life --name=life --appid=com.life --launch --jsengine=jsc --clean --debug --hl-small
```

## build options

* `--hl-link` - Use CADisplayLink instead of NSTimer for the rendering loop. NSTimer will be used by default.
* `--hl-small` - Use 4x4 cells. 20x20 is the default.
* `--hl-xsmall` - Use 1x1 cells. 20x20 is the default.

## Demo Video

[https://vimeo.com/75241456](https://vimeo.com/75241456)