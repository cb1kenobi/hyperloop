package com.appcelerator.example.jscandroidbenchmark;

import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup.LayoutParams;
import android.widget.Button;
import android.widget.LinearLayout;
import android.app.Activity;
import android.content.Intent;

public class MainActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
        LinearLayout vg = new LinearLayout(this);

        Button javaButton = new Button(this);
        javaButton.setLayoutParams(new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
        javaButton.setText("JavaScriptCore Java");
        javaButton.setOnClickListener(new OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                Intent intent = new Intent(getApplicationContext(), JavaScriptCoreJavaActivity.class);
                startActivity(intent);
            }
        });
        
        Button javaCButton = new Button(this);
        javaCButton.setLayoutParams(new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
        javaCButton.setText("Java/C hybrid");
        javaCButton.setOnClickListener(new OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                Intent intent = new Intent(getApplicationContext(), JavaScriptCoreCHybridActivity.class);
                startActivity(intent);
            }
        });
        
        vg.addView(javaButton);
        vg.addView(javaCButton);
        vg.setOrientation(LinearLayout.VERTICAL);
        vg.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT));
        
        setContentView(vg);
	}

}
