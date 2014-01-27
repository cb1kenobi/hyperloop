#pragma once

#include <wrl.h>

// Helper class for basic timing.
class BasicTimer sealed
{
public:
	// Initializes internal timer values.
	BasicTimer();
	
	// Reset the timer to initial values.
	void Reset();
	
	// Update the timer's internal values.
	void Update();
	
	// Duration in seconds between the last call to Reset() and the last call to Update().
	float Total();
	
	// Duration in seconds between the previous two calls to Update().
	float Delta();

private:
	LARGE_INTEGER m_frequency;
	LARGE_INTEGER m_currentTime;
	LARGE_INTEGER m_startTime;
	LARGE_INTEGER m_lastTime;
	float m_total;
	float m_delta;
};
