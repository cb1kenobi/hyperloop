package com.appcelerator.javascriptcore.jscexample;

public class NormalNoXMLActivity extends HyperloopActivity {

    @Override
    protected String getScript() {
        return createStringWithContentsOfFile("/com/appcelerator/javascriptcore/jscexample/NormalNoXMLActivity.js");
    }

}
