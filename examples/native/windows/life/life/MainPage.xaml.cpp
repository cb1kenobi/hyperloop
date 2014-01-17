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
	FPS_INTERVAL = 30;

MainPage::MainPage()
{
	InitializeComponent();

	// get grid variables
	int w = this->universe->ActualWidth;
	int xSize = (Window::Current->Bounds.Width / CELL_SIZE),
		ySize = (Window::Current->Bounds.Height / CELL_SIZE);

	OutputDebugString(L"loading cells...\n");
	srand(time(NULL));
	vector<vector<Cell^>> cells(xSize, vector<Cell^>(ySize));
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
