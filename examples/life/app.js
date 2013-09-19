@import('Foundation/NSTimer');
@import('UIKit/UIApplication');
@import('UIKit/UIColor');
@import('UIKit/UIScreen');
@import('UIKit/UIView');
@import('CoreGraphics/CGRectMake');

const TARGET_FPS = 60,
	CELL_SIZE = 4,
	screenSize = UIScreen.mainScreen().bounds.size,
	height = screenSize.height,
	width = screenSize.width,
	xSize = width / CELL_SIZE,
	ySize = height / CELL_SIZE;

// calculate the next state of each cell
function getNextState(x, y, alive) {
	var count = 0,
		xm1 = x > 0,
		xp1 = x+1 < xSize,
		ym1 = y > 0,
		yp1 = y+1 < ySize;

	if (xm1) {
		if (ym1 && cells[x-1][y-1].lastAlive) { count++; }
		if (cells[x-1][y].lastAlive) { count++; }
		if (yp1 && cells[x-1][y+1].lastAlive) { count++; }
	}
	if (xp1) {
		if (ym1 && cells[x+1][y-1].lastAlive) { count++; }
		if (cells[x+1][y].lastAlive) { count++; }
		if (yp1 && cells[x+1][y+1].lastAlive) { count++; }
	}
	if (ym1 && cells[x][y-1].lastAlive) { count++; }
	if (yp1 && cells[x][y+1].lastAlive) { count++; }

	return (alive && (count === 2 || count === 3)) || (!alive && count === 3);
}

// configure main window
var keyWindow = UIApplication.sharedApplication().keyWindow;
keyWindow.backgroundColor = UIColor.blackColor();

// seed the grid
var cells = [];
for (var x = 0; x < xSize; x++) {

	cells[x] = [];
	for (var y = 0; y < ySize; y++) {
		// determine whether or not this cell is alive
		var alive = Math.random() >= 0.5;

		// create a native UIView
		var cellProxy = new UIView();
		cellProxy.frame = CGRectMake(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
		cellProxy.backgroundColor = UIColor.whiteColor();
		cellProxy.setHidden(!alive);

		// save the cell
		cells[x][y] = {
			proxy: cellProxy,
			lastAlive: alive,
			alive: alive
		};

		// add the cell to the window
		keyWindow.addSubview(cellProxy);
	}
}

// the render function
function update() {
	var x, y, cell;

	// render current generation
	for (x = 0; x < xSize; x++) {
		for (y = 0; y < ySize; y++) {
			cell = cells[x][y];

			// minimze number of times we need to modify the proxy object
			if (cell.alive !== cell.lastAlive) {
				cell.proxy.setHidden(!cell.alive);
			}

			// save the state
			cell.lastAlive = cell.alive;
		}
	}

	// build next generation
	for (x = 0; x < xSize; x++) {
		for (y = 0; y < ySize; y++) {
			cell = cells[x][y];
			cell.alive = getNextState(x, y, cell.lastAlive);
		}
	}
}

// Implement a class for our NSTimer call
@class('TimerCallback', NSObject, [], [
	{
		name: 'update',
		returnType: 'void',
		arguments: [{type:'id',name:'sender'}],
		action: update
	}
]);

// launch timer with TimerCallback as its target/selector
var timer = NSTimer.scheduledTimerWithTimeInterval(
	1.0/TARGET_FPS, new TimerCallback(), 'update:', null, true);

