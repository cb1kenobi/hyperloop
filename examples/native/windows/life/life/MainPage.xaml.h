//
// MainPage.xaml.h
// Declaration of the MainPage class.
//

#pragma once

#include "MainPage.g.h"

namespace life
{
	public ref class MainPage sealed
	{
	public:
		MainPage();

	private:
		bool getNextState(int x, int y, bool alive);
		void OnTick(Object^ sender, Object^ e);

	protected:
		virtual void OnNavigatedTo(Windows::UI::Xaml::Navigation::NavigationEventArgs^ e) override;
	};
}
