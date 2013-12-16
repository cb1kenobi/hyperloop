package com.example.androidperformance;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ViewGroup.LayoutParams;

public class ReflectionActivity extends Activity
{

	ArrayList<Long> list = new ArrayList<Long>();
	private static Class<?> viewClass;
	private static Class<?> motionEventClass;
	private static Class<?> marginLayoutParamsClass;
	private static Method getAction;
	private static Method getRawY; 
	private static Method getRawX; 
	private static Method getHeight;
	private static Method getWidth;
	private static Method setLayoutParams; 
	private static Method getLayoutParams;
	private static Field topMargin; 
	private static Field leftMargin; 
	private static Field actionMove;
	private static Field actionUp;

	static {
		try {
			viewClass = Class.forName("android.view.View");
			motionEventClass = Class.forName("android.view.MotionEvent");
			marginLayoutParamsClass = Class.forName("android.view.ViewGroup$MarginLayoutParams");
			getAction = motionEventClass.getMethod("getAction", (Class[]) null);
			getRawY = motionEventClass.getMethod("getRawY", (Class[]) null);
			getRawX = motionEventClass.getMethod("getRawX", (Class[]) null);
			getHeight = viewClass.getMethod("getHeight", (Class[]) null);
			getWidth = viewClass.getMethod("getWidth", (Class[]) null);
			setLayoutParams = viewClass.getMethod("setLayoutParams", Class.forName("android.view.ViewGroup$LayoutParams"));
			getLayoutParams = viewClass.getMethod("getLayoutParams", (Class[]) null);
			topMargin = marginLayoutParamsClass.getField("topMargin");
			leftMargin = marginLayoutParamsClass.getField("leftMargin");
			actionMove = motionEventClass.getField("ACTION_MOVE");
			actionUp = motionEventClass.getField("ACTION_UP");

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchMethodException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@SuppressWarnings("rawtypes")
	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		
		try {
			
			InvocationHandler handler = new InvocationHandler()
			{
				@Override
				public Object invoke(Object proxy, Method method, Object[] args)
					throws Throwable
				{
					// Should always be the case since there is only one method in the interface
					if(method.getName().equals("onTouch")){
						long start = System.nanoTime();
						// 	LayoutParams params = (LayoutParams) v.getLayoutParams(); 
						Object params = getLayoutParams.invoke(args[0], (Object[]) null);
						Object currentAction = getAction.invoke(args[1], (Object[]) null);
						// if (event.getAction() == MotionEvent.ACTION_MOVE || event.getAction() == MotionEvent.ACTION_UP) {
						if ((currentAction.equals(actionMove.get(null)))
							|| (currentAction.equals(actionUp.get(null)))) {

							// params.topMargin = (int)event.getRawY() - (v.getHeight());
							topMargin.set(params, (int) ((Float) getRawY.invoke(args[1], (Object[]) null) - (Integer) getHeight.invoke(args[0], (Object[]) null)) );

							// params.leftMargin = (int)event.getRawX() - (v.getWidth()/2);
							leftMargin.set(params, (int) ((Float) getRawX.invoke(args[1], (Object[]) null) - ((Integer) getWidth.invoke(args[0], (Object[]) null)/2)));

							//	v.setLayoutParams(params); 
							setLayoutParams.invoke(args[0], (LayoutParams) params);
						}
						long end = System.nanoTime();
						list.add(end - start);
						
						//if drag ends, calculate average time and reset list
						if (currentAction.equals(MotionEvent.ACTION_UP)) {
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

					return null;
				}
			};

			// OnTouchListener drag = new OnTouchListener() {
			Class onTouchListenerClass = Class.forName("android.view.View$OnTouchListener");
			Object drag = Proxy.newProxyInstance(getClassLoader(),
				new Class[] { onTouchListenerClass }, handler);

			// setContentView(R.layout.activity_main);
			Class activityClass = Class.forName("android.app.Activity");
			Method setContextView = activityClass.getMethod("setContentView", int.class);
			setContextView.invoke(this, Class.forName("com.example.androidperformance.R$layout").getField("activity_main").get(null));

			Class RidClass = Class.forName("com.example.androidperformance.R$id");
			Method findViewById = activityClass.getMethod("findViewById", int.class);
			Method setOnTouchListener = viewClass.getMethod("setOnTouchListener", onTouchListenerClass);
			
			// findViewById(R.id.magenta).setOnTouchListener((OnTouchListener) drag);
			Object mView = findViewById.invoke(this, RidClass.getField("magenta").get(null));
			setOnTouchListener.invoke(mView, drag);

			// findViewById(R.id.yellow).setOnTouchListener((OnTouchListener) drag);
			Object yView = findViewById.invoke(this, RidClass.getField("yellow").get(null));
			setOnTouchListener.invoke(yView, drag);

			// findViewById(R.id.cyan).setOnTouchListener((OnTouchListener) drag);
			Object cView = findViewById.invoke(this, RidClass.getField("cyan").get(null));
			setOnTouchListener.invoke(cView, drag);
			
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchMethodException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
