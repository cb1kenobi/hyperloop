var Log = android.util.Log;

function onCreate(savedInstanceState) {
    Log.d("JavaScriptCore", "EmptyObject Creation Test");

    var loopCount = 10000;
    var objects = [];
    var benchmarkStart = +new Date();
    var benchmarkIn = benchmarkStart;
    for (var i = 0; i < loopCount; i++) {
    	if (i % 500 == 0) {
    		Log.d("JavaScriptCore", (+new Date() - benchmarkIn) + " msec for " + i + " new objects");
        	benchmarkIn = +new Date();
    	}
    	objects.push(new EmptyObject());
    }
    
	Log.d("JavaScriptCore", (+new Date() - benchmarkStart) + " msec total for " + i + " new object creation");
    
    for (var i = 0; i < loopCount; i++) {
    	if (i % 500 == 0) {
    		Log.d("JavaScriptCore", (+new Date() - benchmarkIn) + " msec for " + i + " objects method");
        	benchmarkIn = +new Date();
    	}
    	objects[i].toString();
   }
    
	Log.d("JavaScriptCore", (+new Date() - benchmarkStart) + " msec total for " + i + " call object method");
    
}