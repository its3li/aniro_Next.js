package com.aniro.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetData")
public class WidgetDataPlugin extends Plugin {

    private static final String PREFS_NAME = "WidgetData";

    @PluginMethod
    public void updateData(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            // Save all data passed from JS
            if (call.hasOption("latitude")) {
                editor.putFloat("latitude", call.getFloat("latitude"));
            }
            if (call.hasOption("longitude")) {
                editor.putFloat("longitude", call.getFloat("longitude"));
            }
            if (call.hasOption("calculationMethod")) {
                editor.putString("calculationMethod", call.getString("calculationMethod"));
            }
            if (call.hasOption("asrMethod")) {
                editor.putString("asrMethod", call.getString("asrMethod"));
            }
            if (call.hasOption("prayerOffset")) {
                editor.putInt("prayerOffset", call.getInt("prayerOffset"));
            }
            if (call.hasOption("dstMode")) {
                editor.putString("dstMode", call.getString("dstMode"));
            }
            if (call.hasOption("widgetBackgroundColor")) {
                editor.putString("widgetBackgroundColor", call.getString("widgetBackgroundColor"));
            }
            if (call.hasOption("useSystemWidgetColor")) {
                editor.putBoolean("useSystemWidgetColor", call.getBoolean("useSystemWidgetColor"));
            }
            if (call.hasOption("language")) {
                editor.putString("language", call.getString("language"));
            }
            
            // Commit changes
            editor.apply();

            // Trigger Widget Update (Existing)
            Intent intent = new Intent(context, PrayerWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, PrayerWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);

            // Trigger Daily Prayers Widget Update
            Intent intentDaily = new Intent(context, DailyPrayersWidgetProvider.class);
            intentDaily.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            ComponentName dailyWidget = new ComponentName(context, DailyPrayersWidgetProvider.class);
            int[] dailyWidgetIds = appWidgetManager.getAppWidgetIds(dailyWidget);
            intentDaily.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, dailyWidgetIds);
            context.sendBroadcast(intentDaily);

            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to update widget data", e);
        }
    }
}
