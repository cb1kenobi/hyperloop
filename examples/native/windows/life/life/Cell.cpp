#include "pch.h"
#include "Cell.h"

using namespace life;
using namespace Windows::UI::Xaml::Controls;

Cell::Cell(Canvas^ canvas, bool lastAlive, bool alive) {
	this->canvas = canvas;
	this->lastAlive = lastAlive;
	this->alive = alive;
}