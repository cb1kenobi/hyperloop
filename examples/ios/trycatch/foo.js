
function addToView(view, str){
	// do something bad that should generate a native Exception
	// we should be able to catch the native exception as a JS Exception
	view.addSubview(str);
}

function throwAnException() {
	var view = new UIView();
	var str = NSString.stringWithFormat("%@","hello");
	addToView(view,str);
}


exports.throwAnException = throwAnException;
