#pragma once

using namespace Windows::UI::Xaml::Controls;

namespace life
{
	public ref class Cell sealed
	{
	public:
		Cell(Canvas^ canvas, bool lastAlive, bool alive);

		property Canvas^ canvas;
		property bool lastAlive;
		property bool alive;
	};
}
