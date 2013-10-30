/*
* WinUtils.lib is a wrapper library to allow Windows Store apps to get low level process and debugger info.
*
* Russ
*/

typedef struct _COUNTERS_PROCESS_MEMORY {
    DWORD PageFaultCount;
    SIZE_T PeakWorkingSetSize;
    SIZE_T WorkingSetSize;
    SIZE_T QuotaPeakPagedPoolUsage;
    SIZE_T QuotaPagedPoolUsage;
    SIZE_T QuotaPeakNonPagedPoolUsage;
    SIZE_T QuotaNonPagedPoolUsage;
    SIZE_T PagefileUsage;
    SIZE_T PeakPagefileUsage;
} COUNTERS_PROCESS_MEMORY;

typedef struct _COUNTERS_GLOBAL_MEMORY {
    DWORD dwMemoryLoad;
    DWORDLONG ullTotalPhys;
    DWORDLONG ullAvailPhys;
    DWORDLONG ullTotalPageFile;
    DWORDLONG ullAvailPageFile;
    DWORDLONG ullTotalVirtual;
    DWORDLONG ullAvailVirtual;
    DWORDLONG ullAvailExtendedVirtual;
} COUNTERS_GLOBAL_MEMORY;

namespace WinUtils
{
    class Counters
    {
    public:
        static void GetProcessMemoryCounters(/*out*/COUNTERS_PROCESS_MEMORY* pcpm);
		static void GetGlobalMemoryCounters(/*out*/COUNTERS_GLOBAL_MEMORY* pcgm);
    };
}


