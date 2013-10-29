
#include <Windows.h>
#include <Psapi.h>
#include "Counters.h"

namespace WinUtils
{
    void Counters::GetProcessMemoryCounters(COUNTERS_PROCESS_MEMORY* pcpm)
    {
		HANDLE hProcess = GetCurrentProcess();
		PROCESS_MEMORY_COUNTERS pmc;
		ZeroMemory(&pmc,sizeof(pmc));
		GetProcessMemoryInfo(hProcess, &pmc, sizeof(pmc));
		pcpm->PageFaultCount = pmc.PageFaultCount;
		pcpm->PeakWorkingSetSize = pmc.PeakWorkingSetSize     ;
		pcpm->WorkingSetSize = pmc.WorkingSetSize;
		pcpm->QuotaPeakPagedPoolUsage = pmc.QuotaPeakPagedPoolUsage ;
		pcpm->QuotaPagedPoolUsage = pmc.QuotaPagedPoolUsage;
		pcpm->QuotaPeakNonPagedPoolUsage = pmc.QuotaPeakNonPagedPoolUsage;
		pcpm->QuotaNonPagedPoolUsage = pmc.QuotaNonPagedPoolUsage;
		pcpm->PagefileUsage = pmc.PagefileUsage;
		pcpm->PeakPagefileUsage = pmc.PeakPagefileUsage;
	}

	void GetGlobalMemoryCounters(COUNTERS_GLOBAL_MEMORY* pcgm)
    {
    MEMORYSTATUSEX msx;
    ZeroMemory(&msx,sizeof(msx));
    msx.dwLength = sizeof(msx);
    GlobalMemoryStatusEx(&msx);
    pcgm->dwMemoryLoad = msx.dwMemoryLoad;
    pcgm->ullTotalPhys = msx.ullTotalPhys;
    pcgm->ullAvailPhys = msx.ullAvailPhys;
    pcgm->ullTotalPageFile = msx.ullTotalPageFile;
    pcgm->ullAvailPageFile = msx.ullAvailPageFile;
    pcgm->ullTotalVirtual = msx.ullTotalVirtual;
    pcgm->ullAvailVirtual =  msx.ullAvailVirtual;
    pcgm->ullAvailExtendedVirtual = msx.ullAvailExtendedVirtual;
	}
}
