package com.appcelerator.javascriptcore.testrunner;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.Toast;
import android.app.Activity;

import com.appcelerator.javascriptcore.JSVirtualMachineTest;
import com.appcelerator.javascriptcore.TestAPI;
import com.appcelerator.javascriptcore.R;

public class MainActivity extends Activity {
    
    private Handler handler = new Handler();
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        final ListView view = (ListView)this.findViewById(R.id.resultListView);
        final ProgressBar progress = (ProgressBar)this.findViewById(R.id.progressBar);
        
        final Activity context = this;
        
        final UnitTestResultListener listener = new UnitTestResultListener(this);
        view.setAdapter(listener.getAdapter());
        
        JUnitCore runner = new JUnitCore();
        runner.addListener(listener);
        
        AsyncTask<JUnitCore, Void, Result> task = new AsyncTask<JUnitCore, Void, Result>() {

            @Override
            protected Result doInBackground(JUnitCore... runner) {
                return runner[0].run(JSVirtualMachineTest.class, TestAPI.class);
            }
            
            @Override
            protected void onPostExecute(final Result result) {
                handler.post(new Runnable() {
                    @Override
                    public void run() {
                        progress.setVisibility(View.INVISIBLE);
                        listener.getAdapter().notifyDataSetChanged();
                        Toast.makeText(context, String.format("%d tests %d failures in %d ms", 
                                result.getRunCount(), result.getFailureCount(), result.getRunTime()), Toast.LENGTH_LONG).show();
                    }
                });
            }
        };
        
        task.execute(runner);
    }
}
