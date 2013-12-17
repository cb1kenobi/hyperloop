package com.appcelerator.javascriptcore.testrunner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

import android.app.Activity;
import android.util.Log;

public class UnitTestResultListener extends RunListener {
    
    private UnitTestResultAdapter adapter;
    private List<UnitTestResultItem> results = new ArrayList<UnitTestResultItem>();
    private HashMap<String, Boolean> failureCache   = new HashMap<String, Boolean>();
    private HashMap<String, Long>    durationCache = new HashMap<String, Long>();
    
    public UnitTestResultListener(Activity context) {
        this.adapter = new UnitTestResultAdapter(context, results);
    }
    
    public UnitTestResultAdapter getAdapter() {
        return this.adapter;
    }
    
    public void testFailure(Failure failure) {
        failureCache.put(failure.getDescription().getMethodName(), false);
    }

    public void testStarted(Description description) {
        durationCache.put(description.getMethodName(), System.currentTimeMillis());
    }
    
    public void testFinished(Description description) {
        String methodName = description.getMethodName();
        long duration = System.currentTimeMillis() - durationCache.get(methodName);
        if (failureCache.containsKey(methodName)) {
            results.add(new UnitTestResultItem(methodName, duration, false));
        } else {
            results.add(new UnitTestResultItem(methodName, duration, true));
        }
    }
}
