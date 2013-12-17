package com.appcelerator.javascriptcore.testrunner;

import java.util.List;

import com.appcelerator.javascriptcore.R;

import android.app.Activity;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class UnitTestResultAdapter extends ArrayAdapter<UnitTestResultItem> {
    
    private Activity context;
    private List<UnitTestResultItem> data;

    public UnitTestResultAdapter(Activity context, List<UnitTestResultItem> data) {
        super(context, R.layout.list_item, data);
        this.context = context;
        this.data    = data;
    }

    @Override
    public View getView(int position, View view, ViewGroup parent) {
        LayoutInflater inflater = context.getLayoutInflater();
        View rowView= inflater.inflate(R.layout.list_item, null, true);
        
        UnitTestResultItem item = data.get(position);
        
        TextView nameLabel = (TextView) rowView.findViewById(R.id.nameLabel);
        nameLabel.setText(item.getName());
        
        TextView durationLabel = (TextView) rowView.findViewById(R.id.durationLabel);
        durationLabel.setText(String.format("%.3fs", (item.getDuration() / 1000.0f)));
        
        TextView resultLabel = (TextView) rowView.findViewById(R.id.resultLabel);
        resultLabel.setText(item.isOK() ? "passed" : "failed");
        resultLabel.setTextColor(item.isOK() ? Color.GREEN : Color.RED);
        return rowView;
    }
}
