
Build C++/CX Application from Command-Line
------------------------------------------

This sample shows how to build and deploy a Windows Store (Metro) Application using Microsoft command-line tools. A Node.JS script wraps several tools that will compile, link, sign and and deploy the generate APPX package.

Prerequisites Prior to Running Build
------------------------------------

- Download and install VisualStudio Professional 2013. The download page is at  http://www.microsoft.com/visualstudio/eng/products/2013-editions#d-professional. VisualStudio Professional 2012 will also work.

- Download Node.JS. This sample uses Node to run various Windows build processes. For example, the compiler (cl.exe), linker (link.exe) and PowerShell helper utilities. The Node download is at http://nodejs.org/download/. The sample also use the "wrench" library to copy directories. Wrench can be installed by running "npm install wrench" at the command prompt after Node has been installed.

- During application development you will most likely want to test your app before publishing to the Microsoft Store. To test your application locally the application package will need to be signed. The following steps will walk you through creating "self signed" certificates that you then use to digitally sign your app package.

- From Command Prompt (run Command Prompt as admistrator):

- Create a self signed root certificate.

		makecert -a sha1 -n "CN=<PUBLISHER_NAME> -r -sv <PUBLISHER_NAME>.pvk <PUBLISHER_NAME>.cer -ss root -sr localmachine

- Create client cert. My is default personal store, leave as is.

		makecert -a sha1 -sk <PUBLISHER_NAME> -iv <PUBLISHER_NAME>.pvk -n "CN=<PUBLISHER_NAME>" -ic <PUBLISHER_NAME>.cer -sr localmachine -ss My

- Get the thumbprint. Remember the thumbprint it will be used during package signing.

		powershell dir cert:\LocalMachine\My

- Allow the launch app cmdlet to run.

		powershell Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

- Allow appx packages to be shared across machines.
		
		certutil.exe -addstore root <PUBLISHER_NAME>.cer

Run the Build and Deploy Script
-------------------------------

Once the prerequisites have been taken care you can build and deploy by running the following at the Command Prompt. The build script supports numerous command arguments -? will display the arguments. The only mandatory argument is --thumbprint. Included is a Test folder with a C++/CX file. In the --src_dir point to this folder as a way to test the build. 

	node build --thumbprint <THUMB_PRINT> --src_dir <SOURCE_FILE_DIR>

Commands in Node Script
-----------------------

To use MS command-line tools the build environment must be setup correctly. By running the appropriate vcvars bat file the platform specific version of cl.exe (Compiler) and link.exe (Linker) will be run. The follow scripts are in the default location from a Visual Studio 2012 installation.

- Target x86 (32 bit)

		C:\Program Files (x86)\Microsoft Visual Studio 11.0\VC\bin\vcvars32.bat

- Target Arm

		C:\Program Files (x86)\Microsoft Visual Studio 11.0\VC\bin\x86_arm\vcvarsx86_arm.bat

- Target x64

		C:\Program Files (x86)\Microsoft Visual Studio 11.0\VC\bin\x86_amd64\vcvarsx86_amd64.bat

- Compile

		cl.exe /c /ZW /ZI /EHsc Main.cpp

- Link
		
		link.exe Main.obj vccorlib.lib runtimeobject.lib ole32.lib /APPCONTAINER  /SUBSYSTEM:WINDOWS

- Package. The minimal APPX file will contain the executable, a AppxManifest file and the assets listed in the manifest.

		makeappx.exe pack /d . /p <APP_NAME>.appx

- Sign APPX Package

		signtool.exe sign /sm /fd sha256 /sha1 <THUMBPRINT> <APP_NAME>.appx

- Install Package:

		powershell Remove-AppxPackage <APP_FULL_NAME>
		powershell Add-AppxPackage <APP_NAME>.appx

- To start app:

		powershell -command "AppLauncher.ps1; Get-MetroApp |? entrypoint -match <APP_NAME> |Start-MetroApp"



Current Limitations
-------------------

- Only compiling Main.cpp

- Incremental building has not been enable

- Need to process Include and Library path

