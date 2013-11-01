/*
* A simple script to build and deploy an APPX (Windows Store) package using Microsoft command-line build tools.
*
* Russ
*/      

var exec = require('child_process').exec,
    os = require('os'),
    path = require('path'),
    util = require('../../../../lib/utils'),
    fs = require('fs'),
    wrench = require('wrench'),
    default_vs_bin_dir = '"C:\\Program Files (x86)\\Microsoft Visual Studio 11.0\\VC\\bin"',
    default_target = 'local',
    default_publisher_name = 'TempCA',
    default_app_name = 'MyApp',
    default_platform = 'x86',
    default_version = '1.0.0.0',
    default_simulator_dir = '"C:\\Program Files (x86)\\Common Files\\Microsoft Shared\\Windows Simulator\\11.0"';

var renderTemplate = function(template, props) {
    return template.replace(/\$\{([^\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key, format) {
        var parts = key.trim().split('|').map(function (s) { return s.trim(); });
        key = parts[0];
        var value = '' + (props.hasOwnProperty(key) ? props[key] : 'null');
        if (parts.length > 1) {
            parts[1].split(',').forEach(function (cmd) {
                if (cmd == 'h') {
                    value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                } else if (cmd == 'trim') {
                    value = value.trim();
                } else if (cmd == 'jsQuoteEscapeFilter') {
                    value = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                }
            });
        }
        return value;
    });
}

var runCommandFromArray = function(commandArray, showCommand, callback) {
    var len = commandArray.length;
    var command = '';
    for (i = 0; i < len; i++) {
        command += commandArray[i]  + ' ';
    }

    if (showCommand === true) {
        console.log('[Command] :' + command);
    }

    exec(command, function(err, stdout, stderr) {

        callback(err, stdout);
        if (showCommand === true) {
            if (err != null) {
                util.puts(err);
            }
            if (stderr != null) {
                util.puts(stderr);
            }
            if (stdout != null) {
                util.puts(stdout.trim());
            }
        }
    }); 
}

var getArgValue = function(value, array) {
    if (array.indexOf(value) > -1) {
        return array[array.indexOf(value) + 1];
    } 
    else {
        return false;
    }
}

var  doBuild = function() {   
     var oldPath = process.cwd() 

    var vs_bin_dir = getArgValue('--vs_bin_dir',  process.argv) || default_vs_bin_dir;
    var target = getArgValue('--target',  process.argv) || default_target;
    var publisher_name = getArgValue('--publisher_name',  process.argv) || default_publisher_name;
    var app_name = getArgValue('--app_name',  process.argv) || default_app_name;
    var app_display_name = getArgValue('--app_display_name',  process.argv) || default_app_name;
    var platform = getArgValue('--platform',  process.argv) || default_platform;
    var version = getArgValue('--version',  process.argv) || default_version;
    var src_dir = getArgValue('--src_dir',  process.argv) || process.cwd();
    var output_dir = getArgValue('--output_dir',  process.argv) || path.join(src_dir, 'out');
    var thumbprint = getArgValue('--thumbprint',  process.argv);
    var simulator_dir = getArgValue('--simulator_dir',  process.argv) || default_simulator_dir;

    process.chdir(src_dir);

    var buildEnv;
    if (platform === 'x64') {
        buildEnv = path.join(vs_bin_dir, 'x86_amd64', 'vcvarsx86_amd64.bat');
    }
    else if (platform === 'arm') {
        buildEnv = path.join(vs_bin_dir, 'x86_arm', 'vcvarsx86_arm.bat');
    }
    else {
    	buildEnv = path.join(vs_bin_dir, 'vcvars32.bat');
    }

    // Compile - cl.exe /c /ZW /ZI /EHsc Main.cpp
    var command = [buildEnv, '&&', 'cl.exe', '/c', '/ZW', '/ZI', '/EHsc', 'Main.cpp'];
    runCommandFromArray(command, showCmd = true, function() { 

        // Link - link.exe Main.obj vccorlib.lib runtimeobject.lib ole32.lib /APPCONTAINER  /SUBSYSTEM:WINDOWS
        if (!fs.existsSync(output_dir)) {
            fs.mkdirSync(output_dir);
        }
        var outFile = path.join(output_dir, app_name + '.exe'); 
        command = [buildEnv, '&&', 'link.exe', 'Main.obj', 'vccorlib.lib', 'runtimeobject.lib', 'ole32.lib', '/APPCONTAINER', '/SUBSYSTEM:WINDOWS',
                        '/OUT:' + outFile];
        runCommandFromArray(command, showCmd = true, function() { 
            
            // Render the APPX manifest file
            var appxManifestTmpl = path.join(oldPath, 'Templates', 'AppxManifest.xml' );
            var appxManifest = path.join(output_dir, 'AppxManifest.xml' )
            fs.writeFileSync(appxManifest, renderTemplate(fs.readFileSync(appxManifestTmpl).toString().trim(), {
                tapp_name: app_name,
                tpublisher_name: publisher_name,
                tversion: version,
                tplatform: platform,
                tapp_display_name: app_display_name           
            }));

            // Create the APPX package - makeappx.exe pack /d <PACKAGE_DIRECTORY> /p <APP_NAME>.appx 
            wrench.copyDirSyncRecursive(path.join(oldPath,'Resources'), path.join(output_dir,'Resources'), {forceDelete: false});
            var appxFile = path.join(src_dir,  app_name + '.appx')
            if (fs.existsSync(appxFile)) {
                fs.unlinkSync(appxFile);
            }
            command = [buildEnv, '&&', 'makeappx.exe', 'pack', '/d', output_dir, '/p', app_name + '.appx'];
            runCommandFromArray(command, showCmd = true, function() {

                // Sign the package  - signtool.exe sign /sm /fd sha256 /sha1 <THUMB_PRINT> <APP_NAME>.appx
                command = [buildEnv, '&&', 'signtool.exe', 'sign', '/sm', '/fd', 'sha256', '/sha1', thumbprint, path.join(src_dir, app_name + '.appx')];
                runCommandFromArray(command, showCmd = true, function() { 

                    // Remove the package if it exists - powershell Get-AppxPackage
                    command = [buildEnv, '&&', 'powershell', 'Get-AppxPackage'];
                    var removePkgCmd = '';
                    runCommandFromArray(command, showCmd = false, function(err, stdout) { 
            
                        // Get the installed package id so we can remove it before the package install if it exists
                        var apps = stdout.split(/\r\n|\r|\n/g);

                        for(var i = 0; i < apps.length; i++) {
                            var item = apps[i].split(':');
                            var key = item[0];
                            var value = item[1];
                            if (key.trim() === 'PackageFullName') {
                                if (value.trim().indexOf(app_name) > -1) {
                                    console.log('Found Package: ' + value.trim());
                                    removePkgCmd = ['powershell', 'Remove-AppxPackage', value.trim()];
                                }
                            }
                        }

                        // Install the package  - powershell Add-AppxPackage <APP_NAME>.appx
                        command = [buildEnv, '&&'];
                        var addPkgCmd = ['powershell', 'Add-AppxPackage', appxFile];
                        if (removePkgCmd.length > 0) {
                            command = command.concat(removePkgCmd);
                            command.push('&&');
                            command = command.concat(addPkgCmd);
                        }
                        else {
                            command = command.concat(addPkgCmd); 
                        }
                        runCommandFromArray(command, showCmd = true, function() {

                        	if (target === 'local') {

	                            // Launch the application package - powershell -command "import-module AppLauncher.ps1; Get-MetroApp |? entrypoint -match <APP_NAME> |Start-MetroApp"
	                            var appLaunchScript = 'import-module ' + path.join(oldPath, 'AppLauncher.ps1') + '; Get-MetroApp |? entrypoint -match ' + app_name + ' |Start-MetroApp'; 
	                            command = [buildEnv, '&&', 'powershell', '-command', '"' + appLaunchScript + '"']; 
	                            runCommandFromArray(command, showCmd = false, function() {  

	                            }); // end of app launch
	                        }
	                        else {

	                        	// Launch the MS Simulator
	                        	command = [buildEnv, '&&', path.join(simulator_dir, 'Microsoft.Windows.Simulator.exe')]; 
	                        	runCommandFromArray(command, showCmd = false, function() {  

	                        	}); // end of simulator launch
	                        }

	                        process.chdir(oldPath);
	                        // finished!
                        }); // end of package install
                    }); // end of check to see if package exists
                }); // end of package signing
            }); // end of create APPX command  
         }); // end of link command  
    }); // end of compile command   
}

// parse command-line args
try {
    if (process.argv.length < 2 || process.argv[2] === '-?') {
        throw("");
    }

    if (!getArgValue('--thumbprint',  process.argv)) {
        throw('error: --thumbprint is not optional');
    }

    doBuild();
}
catch(e) {
    console.log( e + '\nUsage:\n\n' 
                 + ' --vs_bin_dir <path>                Path to the Visual Studio bin folder\n'
                 + ' --target <device|simulator|local>  Target for the build\n'
                 + ' --publisher_name <x509name>        Certificate subject name\n'
                 + ' --app_name <name>                  Application package name\n'
                 + ' --app_display_name <name>          Pretty application name\n'
                 + ' --platform <x86|x64|x64> 			Platform build target\n'
                 + ' --thumbprint <hex-number>          Thumbprint value used for package signing (mandatory)\n'
                 + ' --version <version>                Version of package being built <1.0.0.0>\n'
                 + ' --src_dir <path>                   Path to the source files.\n'
                 + ' --output_dir <path>                Path to the output files.\n'
                 + ' --simulator_dir <path>             Path to the MS Simulator.\n'
                );
    process.exit(2);
}
