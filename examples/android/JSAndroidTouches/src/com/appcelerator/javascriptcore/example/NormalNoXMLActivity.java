package com.appcelerator.javascriptcore.example;

public class NormalNoXMLActivity extends JavaScriptActivity {
    protected String getScript() {
        return createStringWithContentsOfFile("/com/appcelerator/javascriptcore/example/NormalNoXMLActivity.js");
    }
}
