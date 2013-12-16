package com.example.androidperformance;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;

public class NormalNoXMLActivity extends Activity
{

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);

		OnTouchListener drag = new OnTouchListener()
		{

			@Override
			public boolean onTouch(View v, MotionEvent event)
			{
				// start timer for iteration
				LayoutParams params = (LayoutParams) v.getLayoutParams();
				int action = event.getAction();
				if (action == MotionEvent.ACTION_MOVE
					|| action == MotionEvent.ACTION_UP) {
					params.topMargin = (int) event.getRawY() - v.getHeight();
					params.leftMargin = (int) event.getRawX()
						- (v.getWidth() / 2);
					v.setLayoutParams(params);
				}

				return true;
			}
		};

		FrameLayout main = new FrameLayout(this);
		LayoutParams mainParams = new LayoutParams(LayoutParams.MATCH_PARENT,
			LayoutParams.MATCH_PARENT, Gravity.TOP);
		main.setLayoutParams(mainParams);

		View red = new View(this);
		red.setBackgroundColor(Color.RED);
		android.view.ViewGroup.MarginLayoutParams redParams = new LayoutParams(
			200, 200, Gravity.TOP);
		red.setLayoutParams(redParams);
		red.setOnTouchListener(drag);

		View blue = new View(this);
		blue.setBackgroundColor(Color.BLUE);
		android.view.ViewGroup.MarginLayoutParams blueParams = new LayoutParams(
			200, 200, Gravity.TOP);
		blueParams.setMargins(0, 300, 0, 0);
		blue.setLayoutParams(blueParams);
		blue.setOnTouchListener(drag);

		View yellow = new View(this);
		yellow.setBackgroundColor(Color.YELLOW);
		android.view.ViewGroup.MarginLayoutParams yellowParams = new LayoutParams(
			200, 200, Gravity.TOP);
		yellowParams.setMargins(0, 600, 0, 0);
		yellow.setLayoutParams(yellowParams);
		yellow.setOnTouchListener(drag);

		main.addView(yellow);
		main.addView(blue);
		main.addView(red);

		setContentView(main);
	}
}
