// pseudo imports
var FrameLayout = android.widget.FrameLayout;
var LayoutParams = android.widget.FrameLayout.LayoutParams;
var Gravity = android.view.Gravity;
var Log = android.util.Log;
var Color = android.graphics.Color;
var View = android.view.View;
var OnTouchListener = android.view.View.OnTouchListener;
var MotionEvent = android.view.MotionEvent;
/*
 * Activity#onCreate. 'this' should point to current activity
 */
function onCreate(savedInstanceState) {
    Log.d("JavaScriptCore", "onCreate from NormalNoXMLActivity.js");
    
    var drag = new OnTouchListener({onTouch:function(v, event) {
        // start timer for iteration
        var params = v.getLayoutParams();
        var action = event.getAction();
        if (action == MotionEvent.ACTION_MOVE || action == MotionEvent.ACTION_UP) {
            params.topMargin = event.getRawY() - v.getHeight();
            params.leftMargin = event.getRawX() - (v.getWidth() / 2);
            v.setLayoutParams(params);
        }
        return true;
    }});
    
    var main = new FrameLayout(this);
    var mainParams = new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT, Gravity.TOP);
    main.setLayoutParams(mainParams);
    
    var red = new View(this);
    red.setBackgroundColor(Color.RED);
    var redParams = new LayoutParams(200, 200, Gravity.TOP);
    red.setLayoutParams(redParams);
    red.setOnTouchListener(drag);
    
    var blue = new View(this);
    blue.setBackgroundColor(Color.BLUE);
    var blueParams = new LayoutParams(200, 200, Gravity.TOP);
    blueParams.setMargins(0, 300, 0, 0);
    blue.setLayoutParams(blueParams);
    blue.setOnTouchListener(drag);

    var yellow = new View(this);
    yellow.setBackgroundColor(Color.YELLOW);
    var yellowParams = new LayoutParams(200, 200, Gravity.TOP);
    yellowParams.setMargins(0, 600, 0, 0);
    yellow.setLayoutParams(yellowParams);
    yellow.setOnTouchListener(drag);
    
    main.addView(yellow);
    main.addView(blue);
    main.addView(red);
    
    this.setContentView(main);
}

