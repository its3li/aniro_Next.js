package com.aniro.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.app.AlarmManager;
import android.os.Build;

import com.batoulapps.adhan.CalculationMethod;
import com.batoulapps.adhan.CalculationParameters;
import com.batoulapps.adhan.Coordinates;
import com.batoulapps.adhan.Prayer;
import com.batoulapps.adhan.PrayerTimes;
import com.batoulapps.adhan.data.DateComponents;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DailyPrayersWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "WidgetData";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction()) || 
            "com.aniro.app.UPDATE_PRAYER_WIDGET".equals(intent.getAction()) ||
            "com.aniro.app.SCHEDULED_UPDATE".equals(intent.getAction())) {
            
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisAppWidget = new ComponentName(context.getPackageName(), DailyPrayersWidgetProvider.class.getName());
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidget);
            onUpdate(context, appWidgetManager, appWidgetIds);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        double latitude = prefs.getFloat("latitude", 21.4225f);
        double longitude = prefs.getFloat("longitude", 39.8262f);
        String methodStr = prefs.getString("calculationMethod", "muslim_world_league");
        int prayerOffset = prefs.getInt("prayerOffset", 0);
        String widgetBackgroundColor = prefs.getString("widgetBackgroundColor", "#24252B");
        boolean useSystemWidgetColor = prefs.getBoolean("useSystemWidgetColor", false);
        String language = prefs.getString("language", "ar");

        Coordinates coordinates = new Coordinates(latitude, longitude);
        CalculationParameters params = getCalculationMethod(methodStr);
        Date now = new Date();
        DateComponents dateComponents = DateComponents.from(now);
        PrayerTimes prayerTimes = new PrayerTimes(coordinates, dateComponents, params);
        
        Prayer nextPrayer = prayerTimes.nextPrayer();
        Date nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);
        
        if (nextPrayer == Prayer.NONE) {
            nextPrayer = Prayer.FAJR;
             Date tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
             DateComponents tomorrowComponents = DateComponents.from(tomorrow);
             PrayerTimes tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrowComponents, params);
             nextPrayerTime = tomorrowPrayerTimes.fajr;
        }

        if (nextPrayerTime != null && prayerOffset != 0) {
            nextPrayerTime = new Date(nextPrayerTime.getTime() + prayerOffset * 60 * 60 * 1000);
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.daily_prayers_widget);

        // Apply Background Color
        int fillColor;
        int borderColor;
        
        if (useSystemWidgetColor && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            fillColor = context.getColor(android.R.color.system_accent1_100);
            borderColor = context.getColor(android.R.color.system_accent1_600);
        } else {
            try {
                fillColor = android.graphics.Color.parseColor(widgetBackgroundColor);
            } catch (Exception e) {
                fillColor = android.graphics.Color.parseColor("#24252B");
            }
            borderColor = adjustColorBrightness(fillColor);
        }
        
        views.setInt(R.id.widget_background_fill, "setColorFilter", fillColor);
        views.setInt(R.id.widget_background_border, "setColorFilter", borderColor);

        // Dynamic text color based on background brightness
        int textColor = isColorLight(fillColor) ? 0xFF222222 : 0xFFFFFFFF;
        int labelColor = isColorLight(fillColor) ? 0xFF666666 : 0xFFAAAAAA;
        int accentColor = isColorLight(fillColor) ? 0xFFB08D25 : 0xFFD4AF37;
        
        views.setTextColor(R.id.widget_prayer_name, textColor);
        views.setTextColor(R.id.widget_next_prayer_label, labelColor);
        views.setTextColor(R.id.widget_countdown, accentColor);

        if (nextPrayerTime != null) {
            views.setChronometer(R.id.widget_countdown, android.os.SystemClock.elapsedRealtime() + (nextPrayerTime.getTime() - System.currentTimeMillis()), null, true);
            views.setChronometerCountDown(R.id.widget_countdown, true);
            
            SimpleDateFormat formatter = new SimpleDateFormat("h:mm a", Locale.getDefault());
            views.setTextViewText(R.id.widget_next_prayer_label, "at " + formatter.format(nextPrayerTime));
        }
        
        String nextPrayerName = getPrayerName(nextPrayer, language.equals("ar"));
        views.setTextViewText(R.id.widget_prayer_name, nextPrayerName);

        boolean isArabic = language.equals("ar");
        // Update List Items using unique IDs
        updatePrayerItem(views, R.id.fajr_name, R.id.fajr_time, R.id.fajr_icon, R.id.fajr_icon_fill, R.id.fajr_icon_border, isArabic ? "الفجر" : "Fajr", prayerTimes.fajr, nextPrayer == Prayer.FAJR, prayerOffset, context, fillColor, borderColor);
        updatePrayerItem(views, R.id.dhuhr_name, R.id.dhuhr_time, R.id.dhuhr_icon, R.id.dhuhr_icon_fill, R.id.dhuhr_icon_border, isArabic ? "الظهر" : "Dhuhr", prayerTimes.dhuhr, nextPrayer == Prayer.DHUHR, prayerOffset, context, fillColor, borderColor);
        updatePrayerItem(views, R.id.asr_name, R.id.asr_time, R.id.asr_icon, R.id.asr_icon_fill, R.id.asr_icon_border, isArabic ? "العصر" : "Asr", prayerTimes.asr, nextPrayer == Prayer.ASR, prayerOffset, context, fillColor, borderColor);
        updatePrayerItem(views, R.id.maghrib_name, R.id.maghrib_time, R.id.maghrib_icon, R.id.maghrib_icon_fill, R.id.maghrib_icon_border, isArabic ? "المغرب" : "Maghrib", prayerTimes.maghrib, nextPrayer == Prayer.MAGHRIB, prayerOffset, context, fillColor, borderColor);
        updatePrayerItem(views, R.id.isha_name, R.id.isha_time, R.id.isha_icon, R.id.isha_icon_fill, R.id.isha_icon_border, isArabic ? "العشاء" : "Isha", prayerTimes.isha, nextPrayer == Prayer.ISHA, prayerOffset, context, fillColor, borderColor);

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);

        // Schedule next update
        if (nextPrayerTime != null) {
            scheduleNextUpdate(context, nextPrayerTime);
        }
    }

    private static void scheduleNextUpdate(Context context, Date nextPrayerTime) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, DailyPrayersWidgetProvider.class);
        intent.setAction("com.aniro.app.SCHEDULED_UPDATE");
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        // Schedule 1 second after prayer time
        long triggerTime = nextPrayerTime.getTime() + 1000;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
        }
    }

    private static void updatePrayerItem(RemoteViews views, int nameId, int timeId, int iconId, int fillId, int borderId, String name, Date time, boolean isActive, int offset, Context context, int themeFillColor, int themeBorderColor) {
        if (time != null && offset != 0) {
            time = new Date(time.getTime() + offset * 60 * 60 * 1000);
        }
        
        views.setTextViewText(nameId, name);
        
        if (time != null) {
            SimpleDateFormat formatter = new SimpleDateFormat("h:mm", Locale.getDefault());
            views.setTextViewText(timeId, formatter.format(time));
        }

        if (isActive) {
            // Active: Use Theme Colors
            views.setInt(fillId, "setColorFilter", themeFillColor);
            views.setInt(borderId, "setColorFilter", themeBorderColor);
            
            // Icon tint (white or contrasting)
            views.setInt(iconId, "setColorFilter", android.graphics.Color.WHITE);
            
            views.setTextColor(nameId, 0xFFD4AF37); // Gold
            views.setTextColor(timeId, 0xFFD4AF37); // Gold
        } else {
            // Inactive: Dark Gray / Light Gray
            views.setInt(fillId, "setColorFilter", 0xFF2A2A2A);
            views.setInt(borderId, "setColorFilter", 0xFF444444);
            
            // Icon tint (gray)
            views.setInt(iconId, "setColorFilter", 0xFFAAAAAA);

            views.setTextColor(nameId, 0xFFAAAAAA); // Gray
            views.setTextColor(timeId, 0xFFAAAAAA); // Gray
        }
    }
    
    private static int adjustColorBrightness(int color) {
        float[] hsv = new float[3];
        android.graphics.Color.colorToHSV(color, hsv);
        if (hsv[2] > 0.7f) {
            hsv[2] *= 0.7f; // Darken if bright
        } else {
            hsv[2] = Math.min(1.0f, hsv[2] * 1.3f); // Lighten if dark, cap at 1.0
             if (hsv[2] < 0.2f) hsv[2] = 0.2f; // Ensure at least some brightness if black
        }
        return android.graphics.Color.HSVToColor(hsv);
    }

    private static boolean isColorLight(int color) {
        double darkness = 1 - (0.299 * android.graphics.Color.red(color) + 0.587 * android.graphics.Color.green(color) + 0.114 * android.graphics.Color.blue(color)) / 255;
        return darkness < 0.5;
    }
    
     private static CalculationParameters getCalculationMethod(String method) {
        switch (method) {
            case "muslim_world_league": return CalculationMethod.MUSLIM_WORLD_LEAGUE.getParameters();
            case "egyptian": return CalculationMethod.EGYPTIAN.getParameters();
            case "karachi": return CalculationMethod.KARACHI.getParameters();
            case "umm_al_qura": return CalculationMethod.UMM_AL_QURA.getParameters();
            case "dubai": return CalculationMethod.DUBAI.getParameters();
            case "qatar": return CalculationMethod.QATAR.getParameters();
            case "kuwait": return CalculationMethod.KUWAIT.getParameters();
            case "singapore": return CalculationMethod.SINGAPORE.getParameters();
            case "north_america": return CalculationMethod.NORTH_AMERICA.getParameters();
            default: return CalculationMethod.MUSLIM_WORLD_LEAGUE.getParameters();
        }
    }

    private static String getPrayerName(Prayer prayer, boolean isArabic) {
        switch (prayer) {
            case FAJR: return isArabic ? "الفجر" : "Fajr";
            case SUNRISE: return isArabic ? "الشروق" : "Sunrise";
            case DHUHR: return isArabic ? "الظهر" : "Dhuhr";
            case ASR: return isArabic ? "العصر" : "Asr";
            case MAGHRIB: return isArabic ? "المغرب" : "Maghrib";
            case ISHA: return isArabic ? "العشاء" : "Isha";
            default: return "";
        }
    }
}
