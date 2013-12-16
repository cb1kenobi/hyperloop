package com.example.androidperformance;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;

import android.app.ListActivity;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class ListViewReflectionActivity extends ListActivity
{

	private static Class<?> viewClass;
	private static Class<?> contextClass;
	private static Class<?> rlayoutClass;
	private static Class<?> rDrwawableClass;
	private static Class<?> layoutInflatorClass;
	private static Class<?> viewHolderClass;
	private static Class<?> rIdClass;
	private static Class<?> textViewClass;
	private static Class<?> imageViewClass;

	private static Method setTag;
	private static Method inflate;
	private static Method findViewById;
	private static Method getTag;
	private static Method setText;
	private static Method setImageBitmap;

	public static ArrayList<Long> getViewTimes = new ArrayList<Long>();
	
	static {
		try {
			viewClass = Class.forName("android.view.View");
			contextClass = Class.forName("android.content.Context");
			rlayoutClass = Class
				.forName("com.example.androidperformance.R$layout");
			rDrwawableClass = Class
				.forName("com.example.androidperformance.R$drawable");
			layoutInflatorClass = Class.forName("android.view.LayoutInflater");
			rIdClass = Class.forName("com.example.androidperformance.R$id");
			textViewClass = Class.forName("android.widget.TextView");
			imageViewClass = Class.forName("android.widget.ImageView");

			inflate = layoutInflatorClass.getMethod("inflate", int.class,
				Class.forName("android.view.ViewGroup"));
			findViewById = viewClass.getMethod("findViewById", int.class);
			setTag = viewClass.getMethod("setTag", Object.class);
			getTag = viewClass.getMethod("getTag", (Class[]) null);
			setText = textViewClass.getMethod("setText", Class.forName("java.lang.CharSequence"));
			setImageBitmap = imageViewClass.getMethod("setImageBitmap", Class.forName("android.graphics.Bitmap"));

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchMethodException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

		try {
			
			Class<?> efficientAdapterClass = Class.forName("com.example.androidperformance.ListViewReflectionActivity$EfficientAdapter");
			Constructor<?> efficientAdapterConstructor = efficientAdapterClass.getConstructor(contextClass);

			viewHolderClass = Class
					.forName("com.example.androidperformance.ListViewReflectionActivity$EfficientAdapter$ViewHolder");

			// setListAdapter(new EfficientAdapter(this));
			Class<?> listAdapterClass = Class.forName("android.widget.ListAdapter");
			Class<?> activityListClass = Class.forName("android.app.ListActivity");
			Method setContextView = activityListClass.getMethod("setListAdapter", listAdapterClass);
			setContextView.invoke(this, efficientAdapterConstructor.newInstance(this));

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
		} catch (InstantiationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }

    private static class EfficientAdapter extends BaseAdapter {
        private LayoutInflater mInflater;
        private Bitmap mIcon1;
        private Bitmap mIcon2;

		public EfficientAdapter(Context context)
		{
			// Constructor logic for EfficientAdapter()
			// mInflater = LayoutInflater.from(context);
			try {

				Method layoutInflator = layoutInflatorClass.getMethod("from",
					contextClass);
				mInflater = (LayoutInflater) layoutInflator.invoke(null,
					context);

				// mIcon1 = BitmapFactory.decodeResource(context.getResources(), R.drawable.icon48x48_1);
				// mIcon2 = BitmapFactory.decodeResource(context.getResources(), R.drawable.icon48x48_2);
				Class<?> bitmapFactoryClass = Class
					.forName("android.graphics.BitmapFactory");
				Class<?> resourcesClass = Class
					.forName("android.content.res.Resources");
				Method getResources = contextClass.getMethod("getResources",
					(Class[]) null);
				Method decodeResource = bitmapFactoryClass.getMethod(
					"decodeResource", resourcesClass, int.class);
				Object resources = getResources
					.invoke(context, (Object[]) null);
				mIcon1 = (Bitmap) decodeResource.invoke(null, resources,
					rDrwawableClass.getField("icon48x48_1").get(null));

				mIcon2 = (Bitmap) decodeResource.invoke(null, resources,
					rDrwawableClass.getField("icon48x48_2").get(null));
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
			} catch (NoSuchMethodException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (ClassNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

        /**
         * The number of items in the list is determined by the number of speeches
         * in our array.
         *
         * @see android.widget.ListAdapter#getCount()
         */
        public int getCount() {
            return DATA.length;
        }

        /**
         * Since the data comes from an array, just returning the index is
         * sufficent to get at the data. If we were using a more complex data
         * structure, we would return whatever object represents one row in the
         * list.
         *
         * @see android.widget.ListAdapter#getItem(int)
         */
        public Object getItem(int position) {
            return position;
        }

        /**
         * Use the array index as a unique id.
         *
         * @see android.widget.ListAdapter#getItemId(int)
         */
        public long getItemId(int position) {
            return position;
        }

        /**
         * Make a view to hold each row.
         *
         * @see android.widget.ListAdapter#getView(int, android.view.View,
         *      android.view.ViewGroup)
         */
		public View getView(int position, View convertView, ViewGroup parent)
		{
			long start = System.nanoTime();
			Object holder;
			try {

				if (convertView == null) {

					// convertView = mInflater.inflate(R.layout.list_item_icon_text, null);
					convertView = (View) inflate.invoke(mInflater,
						rlayoutClass.getField("list_item_icon_text").get(null), null);

					// holder = new ViewHolder();
					holder = (ViewHolder) viewHolderClass.newInstance();

					// holder.text = (TextView) convertView.findViewById(R.id.text);
					// holder.icon = (ImageView) convertView.findViewById(R.id.icon);
					Object textView = findViewById.invoke(convertView, rIdClass
						.getField("text").get(null));
					Field textField = viewHolderClass.getDeclaredField("text");
					textField.set(holder, textView);

					Object imageView = findViewById.invoke(convertView,
						rIdClass.getField("icon").get(null));
					Field iconField = viewHolderClass.getDeclaredField("icon");
					iconField.set(holder, imageView);

					// convertView.setTag(holder);
					setTag.invoke(convertView, holder);

				} else {
					// holder = (ViewHolder) convertView.getTag();
					holder = getTag.invoke(convertView, (Object[]) null);
				}

				// holder.text.setText(DATA[position]);
				Object textField = viewHolderClass.getDeclaredField("text").get(holder);
				setText.invoke(textField, DATA[(Integer) position]);

				// holder.icon.setImageBitmap((position & 1) == 1 ? mIcon1 : mIcon2);
				Object imageField = viewHolderClass.getDeclaredField("icon")
					.get(holder);
				setImageBitmap.invoke(imageField,
					((Integer) position & 1) == 1 ? mIcon1 : mIcon2);

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
			} catch (InstantiationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			ListViewReflectionActivity.getViewTimes.add(System.nanoTime() - start);
			return convertView;
		}

        static class ViewHolder {
            TextView text;
            ImageView icon;
        }
    }

	@Override
	protected void onStop()
	{
		int size = getViewTimes.size();
		if (size > 0) {
			int sum = 0;
			for (int i = 0; i < size - 1; i++) {
				sum += getViewTimes.get(i);
			}
			Log.d("Reflection Test",
				"List View with Reflection - Average time: " + (sum / size)
					+ " ns over " + size + " iterations");
		}
		getViewTimes.clear();
		super.onStop();
	}

	private static final String[] DATA = MainActivity.sCheeseStrings;

}
