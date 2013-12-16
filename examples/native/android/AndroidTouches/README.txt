To build and install:

Use:
android list targets
to find out which SDKs are installed on your system and what the 
corresponding target number id is.

Assuming you are in the same directory (.) that this README.txt is in, run:
android update project --target <id> --path .

Then you can use the standard ant technique for Android, e.g.
ant debug
or
ant debug install
(the latter if your device is connected and you want to build & install in one shot)

