package com.appcelerator.hyperloop;

import com.appcelerator.javascriptcore.jscexample.HyperloopActivity;

import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;

public class ViewOnTouchListener implements OnTouchListener {

    private final long thisObject;
    private final long onTouchFunc;
    
    public ViewOnTouchListener(long thisObject, long onTouchFunc) {
        this.thisObject  = thisObject;
        this.onTouchFunc = onTouchFunc;
    }
    
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        return NativeOnTouch(((HyperloopActivity)v.getContext()).getJSContext().p(), thisObject, onTouchFunc, v, event);
    }

    public native boolean NativeOnTouch(long jsContext, long thisObject, long onTouchFunc, View v, MotionEvent event);
}
