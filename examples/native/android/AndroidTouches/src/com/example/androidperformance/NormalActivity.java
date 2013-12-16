package com.example.androidperformance;

import java.util.ArrayList;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.widget.FrameLayout.LayoutParams;

public class NormalActivity extends Activity
{

	ArrayList<Long> list = new ArrayList<Long>();

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);

		OnTouchListener drag = new OnTouchListener()
		{

			@Override 
			public boolean onTouch(View v, MotionEvent event) 
			{ 
				//start timer for iteration
				long start = System.nanoTime();
				LayoutParams params = (LayoutParams) v.getLayoutParams();
				int action = event.getAction();
				if (action == MotionEvent.ACTION_MOVE || action == MotionEvent.ACTION_UP) {
					params.topMargin = (int) event.getRawY() - (v.getHeight());
					params.leftMargin = (int) event.getRawX()
						- (v.getWidth() / 2);
					v.setLayoutParams(params);
				}
				//end timer and add value to list
				long end = System.nanoTime();
				list.add(end-start);
				
				//if drag ends, calculate average time and reset list
				if (action == MotionEvent.ACTION_UP) {
					long sum = 0;
					int size = list.size();
					for (int i = 0; i < size; ++i) {
						sum += list.get(i);
					}

					if (size  > 0) {
						Log.d("Reflection Test", "Average time: " + (sum / size) + " ns over " + size + " iterations");
					}
					list.clear();
				}
				return true;
			}
		};

		setContentView(R.layout.activity_main);
		findViewById(R.id.magenta).setOnTouchListener(drag);
		findViewById(R.id.yellow).setOnTouchListener(drag);
		findViewById(R.id.cyan).setOnTouchListener(drag);
	}

}
