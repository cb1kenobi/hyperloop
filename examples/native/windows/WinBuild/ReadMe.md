
How to Build C++/CX Application From Command-Line
=================================================

This sample shows how to build and deploy a Windows Store (Metro) Application using Microsoft command-line tools. A Node.JS script wraps several tools that will compile, link, sign and and deploy the generate APPX package.

Prerequisites Before Running Build
----------------------------------

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


Current Sample Limitations
--------------------------

- Only compiling Main.cpp

- Incremental building has not been enable

- Need to process Include and Library path 

