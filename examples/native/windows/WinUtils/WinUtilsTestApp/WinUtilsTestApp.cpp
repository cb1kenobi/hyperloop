/*
* Simple console app to test and develop the WinUtils libray. 
*
* Russ
*/

#include <Windows.h>
#include <iostream>

#include "Counters.h"

using namespace std;
using namespace WinUtils;

#define ARRAY_LENGTH 10

int main()
{
	char outbuf[1024];
	void *arr[ARRAY_LENGTH];
	COUNTERS_PROCESS_MEMORY cpm;
	ZeroMemory(&cpm,sizeof(cpm));

	for (int i = 0; i < ARRAY_LENGTH; i++) {
		Counters::GetProcessMemoryCounters(&cpm);
		
		sprintf_s(outbuf, "Physical Memory Used by Process - %d\n",
			      cpm.WorkingSetSize);

		OutputDebugStringA(outbuf);
		printf_s(outbuf);

		arr[i] = malloc(10000000);

		Sleep(2000);
	}

	for (int i = 0; i < ARRAY_LENGTH; i++) {
		Counters::GetProcessMemoryCounters(&cpm);
		
		sprintf_s(outbuf, "Physical Memory Used by Process - %d\n",
			      cpm.WorkingSetSize);

		OutputDebugStringA(outbuf);
		printf_s(outbuf);

		free(arr[i]);

		Sleep(2000);
	}
 
    return 0;
}
