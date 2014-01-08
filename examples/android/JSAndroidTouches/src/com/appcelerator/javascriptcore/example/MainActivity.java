package com.appcelerator.javascriptcore.example;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup.LayoutParams;
import android.widget.Button;
import android.widget.LinearLayout;

public class MainActivity extends Activity {

    @Override 
    public void onCreate(Bundle savedInstanceState) 
    { 
        super.onCreate(savedInstanceState);
        LinearLayout vg = new LinearLayout(this);

        Button normalNoXML = new Button(this);
        normalNoXML.setLayoutParams(new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
        normalNoXML.setText("Normal No XML Test");
        normalNoXML.setOnClickListener(new OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                Intent intent = new Intent(getApplicationContext(), NormalNoXMLActivity.class);
                startActivity(intent);
            }
        });
        vg.addView(normalNoXML);
        vg.setOrientation(LinearLayout.VERTICAL);
        vg.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT));
        
        setContentView(vg);
    }



}
