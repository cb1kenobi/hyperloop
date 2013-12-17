package com.appcelerator.javascriptcore.testrunner;

public class UnitTestResultItem {
    
    private final String name;
    private final long duration;
    private final boolean ok;
    
    public UnitTestResultItem(String name, long duration, boolean ok) {
        this.name = name;
        this.duration = duration;
        this.ok = ok;
    }
    
    public String getName() {
        return name;
    }
    public long getDuration() {
        return duration;
    }
    public boolean isOK() {
        return ok;
    }
}
