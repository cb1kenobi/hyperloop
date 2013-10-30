WinUtils Library
----------------

This sample creates a Win32 static library to check both process memory and global memory usage. The numbers returned are similar to what is returned using Windows Task Manager. The library is designed to be a wrapper around the Windows system calls GetProcessMemoryInfo and GlobalMemoryStatusEx. WinUtils currently only supports tracking memory but a longer term goal is to add more counters and low level system calls to enable better application/process profiling.

Building and Running Sample
---------------------------

Included in the sample is WinUtils.sln Visual Studio Solution file. The solution builds the WinUtils.lib and contains a console based test application to load and use the library. To use the library in a Windows Store application make sure both the library and the Counter.h is available to app. To run the test app make sure to set the WinUtilsTestApp project to be the "Start Up" application.

References
----------

Some good references about Microsoft Memory Management.

- http://stackoverflow.com/questions/63166/how-to-determine-cpu-and-memory-consumption-from-inside-a-process
- http://blogs.technet.com/b/markrussinovich/archive/2008/11/17/3155406.aspx