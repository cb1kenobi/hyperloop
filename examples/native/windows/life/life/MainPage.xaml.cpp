//
// MainPage.xaml.cpp
// Implementation of the MainPage class.
//

#include "pch.h"
#include "MainPage.xaml.h"
#include "Cell.h"
#include <time.h>
#include <vector>

using namespace life;
using namespace Platform;
using namespace Windows::Foundation;
using namespace Windows::Foundation::Collections;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Controls;
using namespace Windows::UI::Xaml::Controls::Primitives;
using namespace Windows::UI::Xaml::Data;
using namespace Windows::UI::Xaml::Input;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml::Navigation;
using namespace Windows::UI;

using std::vector;

int CELL_SIZE = 10, 
	FPS_INTERVAL = 15,
	xSize, ySize, ctr = 0;
vector<vector<Cell^>> cells;
TextBlock^ label;
clock_t lastReport;

MainPage::MainPage()
{
	InitializeComponent();

	// get grid variables
	xSize = (Window::Current->Bounds.Width / CELL_SIZE),
	ySize = (Window::Current->Bounds.Height / CELL_SIZE);

	// create the grid
	OutputDebugString(L"loading cells...\n");
	srand(time(NULL));
	cells.assign(xSize, vector<Cell^>(ySize));
	for (int x = 0; x < xSize; x++) {
		for (int y = 0; y < ySize; y++) {
			// is this cell alive?
			bool alive = ((double)rand() / RAND_MAX) > 0.5 ? true : false;

			// create the cell
			Canvas^ cell = ref new Canvas();
			cell->Height = CELL_SIZE;
			cell->Width = CELL_SIZE;
			cell->Background = ref new SolidColorBrush(Colors::White);
			Canvas::SetLeft(cell, x * CELL_SIZE);
			Canvas::SetTop(cell, y * CELL_SIZE);
			cell->Visibility = alive ? Windows::UI::Xaml::Visibility::Visible : Windows::UI::Xaml::Visibility::Collapsed; 

			// save the cell
			cells[x][y] = ref new Cell(cell, alive, alive);

			// all cell to universe
			this->universe->Children->Append(cell);
		}
	}
	OutputDebugString(L"done loading cells.\n");

	// setup FPS label
	label = ref new TextBlock();
	label->Text = "Loading, please wait.";
	label->TextAlignment = TextAlignment::Right;
	label->VerticalAlignment = Windows::UI::Xaml::VerticalAlignment::Top;
	label->HorizontalAlignment = Windows::UI::Xaml::HorizontalAlignment::Right;
	label->FontSize = 60;
	label->Foreground = ref new SolidColorBrush(Colors::RosyBrown);
	this->universe->Children->Append(label);

	// start the timer
	lastReport = clock();
	auto timer = ref new DispatcherTimer();
	TimeSpan ts;
	ts.Duration = 100000; // 100/s, but it won't process that fast
	timer->Interval = ts;
	timer->Start();
	timer->Tick += ref new EventHandler<Object^>(this,&MainPage::OnTick);

}

void MainPage::OnTick(Object^ sender, Object^ e) {
    int x, y; 
	Cell^ cell;

    // render current generation
    for (x = 0; x < xSize; x++) {
        for (y = 0; y < ySize; y++) {
            cell = cells[x][y];

            // minimize number of times we need to modify the proxy object
            if (cell->alive != cell->lastAlive) {
                cell->canvas->Visibility = cell->alive ? Windows::UI::Xaml::Visibility::Visible : Windows::UI::Xaml::Visibility::Collapsed;
            }

            // save the state
            cell->lastAlive = cell->alive;
        }
    }

    // build next generation
    for (x = 0; x < xSize; x++) {
        for (y = 0; y < ySize; y++) {
            cell = cells[x][y];
            cell->alive = this->getNextState(x, y, cell->lastAlive);
        }
    }

	// show the average FPS
    if (++ctr % FPS_INTERVAL == 0) {
        ctr = 1;

		clock_t currentReport;
		currentReport = clock();
		double fps = 1.0f / (currentReport - lastReport);
		label->Text = "FPS: " + floor(fps * (double)FPS_INTERVAL * 1000);
		lastReport = currentReport;
    }
}

bool MainPage::getNextState(int x, int y, bool alive) {
	int count = 0,
        xm1 = x > 0,
        xp1 = x+1 < xSize,
        ym1 = y > 0,
        yp1 = y+1 < ySize;

    if (xm1) {
        if (ym1 && cells[x-1][y-1]->lastAlive) { count++; }
        if (cells[x-1][y]->lastAlive) { count++; }
        if (yp1 && cells[x-1][y+1]->lastAlive) { count++; }
    }
    if (xp1) {
        if (ym1 && cells[x+1][y-1]->lastAlive) { count++; }
        if (cells[x+1][y]->lastAlive) { count++; }
        if (yp1 && cells[x+1][y+1]->lastAlive) { count++; }
    }
    if (ym1 && cells[x][y-1]->lastAlive) { count++; }
    if (yp1 && cells[x][y+1]->lastAlive) { count++; }

    return (alive && (count == 2 || count == 3)) || (!alive && count == 3);
}

/// <summary>
/// Invoked when this page is about to be displayed in a Frame.
/// </summary>
/// <param name="e">Event data that describes how this page was reached.  The Parameter
/// property is typically used to configure the page.</param>
void MainPage::OnNavigatedTo(NavigationEventArgs^ e)
{
	(void) e;	// Unused parameter
}
