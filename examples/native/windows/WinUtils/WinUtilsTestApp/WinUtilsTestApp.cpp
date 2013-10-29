

#include <Windows.h>
#include <iostream>

#include "Counters.h"

using namespace std;
using namespace WinUtils;

int main()
{
	char outbuf[1024];
	COUNTERS_PROCESS_MEMORY cpm;
	ZeroMemory(&cpm,sizeof(cpm));

	for (int i = 0; i < 10; i++) {
		Counters::GetProcessMemoryCounters(&cpm);
		
		sprintf_s(outbuf, "Physical Memory used by process - %d\n",
			      cpm.WorkingSetSize);

		OutputDebugStringA(outbuf);
		printf_s(outbuf);

		void* b = malloc(10000000);

		Sleep(2000);
	}
 
    return 0;
}
