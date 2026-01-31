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
import com.batoulapps.adhan.Madhab;
import com.batoulapps.adhan.Prayer;
import com.batoulapps.adhan.PrayerTimes;
import com.batoulapps.adhan.data.DateComponents;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class PrayerWidgetProvider extends AppWidgetProvider {

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
            ComponentName thisAppWidget = new ComponentName(context.getPackageName(), PrayerWidgetProvider.class.getName());
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidget);
            onUpdate(context, appWidgetManager, appWidgetIds);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        // Default values (Mecca)
        double latitude = prefs.getFloat("latitude", 21.4225f);
        double longitude = prefs.getFloat("longitude", 39.8262f);
        String methodStr = prefs.getString("calculationMethod", "muslim_world_league");
        int prayerOffset = prefs.getInt("prayerOffset", 0);
        String dstMode = prefs.getString("dstMode", "auto");
        String widgetBackgroundColor = prefs.getString("widgetBackgroundColor", "#24252B");
        boolean useSystemWidgetColor = prefs.getBoolean("useSystemWidgetColor", false);
        String language = prefs.getString("language", "ar");

        // Calculate Prayer Times
        Coordinates coordinates = new Coordinates(latitude, longitude);
        CalculationParameters params = getCalculationMethod(methodStr);
        
        // Date components
        Date now = new Date();
        DateComponents dateComponents = DateComponents.from(now);

        PrayerTimes prayerTimes = new PrayerTimes(coordinates, dateComponents, params);
        
        // Determine Next Prayer
        Prayer nextPrayer = prayerTimes.nextPrayer();
        Date nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);
        
        // If no next prayer today (after Isha), get Fajr tomorrow
        if (nextPrayer == Prayer.NONE) {
            nextPrayer = Prayer.FAJR;
            // Simple logic: just show Fajr time for today (which is past) or handle tomorrow logic
            // For simplicity in widget, we'll re-calculate for tomorrow if needed, 
            // but adhan-java usually handles nextPrayer correctly if we provide correct date.
            // Actually adhan-java nextPrayer() returns NONE if all prayers passed.
            // We should check tomorrow.
             Date tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
             DateComponents tomorrowComponents = DateComponents.from(tomorrow);
             PrayerTimes tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrowComponents, params);
             nextPrayerTime = tomorrowPrayerTimes.fajr;
        }

        // Format Time
        // Apply offset if needed (Adhan returns times in UTC or local? It returns Date objects)
        // We need to format it to local time string
        
        // Apply manual offset from settings
        if (nextPrayerTime != null) {
            // DST adjustment logic is complex, usually handled by system timezone.
            // The 'dstMode' from settings might need manual application if 'on' or 'off' forces it.
            // For now, we assume system time zone is correct for the Date object.
            
            // Apply manual hour offset
            if (prayerOffset != 0) {
                nextPrayerTime = new Date(nextPrayerTime.getTime() + prayerOffset * 60 * 60 * 1000);
            }
        }

        String timeString = "--:--";
        String prayerName = "";
        
        if (nextPrayerTime != null) {
            SimpleDateFormat formatter = new SimpleDateFormat("h:mm a", Locale.getDefault());
            timeString = formatter.format(nextPrayerTime);
        }
        
        if (nextPrayer != Prayer.NONE) {
            prayerName = getPrayerName(nextPrayer, language.equals("ar"));
        }

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);
        
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
        
        views.setTextColor(R.id.widget_label, labelColor);
        views.setTextColor(R.id.widget_prayer_name, textColor);
        views.setTextColor(R.id.widget_time_remaining, accentColor);
        views.setInt(R.id.widget_icon, "setColorFilter", textColor);

        views.setTextViewText(R.id.widget_prayer_name, prayerName);
        
        // Update Chronometer
        if (nextPrayerTime != null) {
            views.setChronometer(R.id.widget_time_remaining, android.os.SystemClock.elapsedRealtime() + (nextPrayerTime.getTime() - System.currentTimeMillis()), null, true);
            views.setChronometerCountDown(R.id.widget_time_remaining, true);
        }
        
        views.setTextViewText(R.id.widget_label, language.equals("ar") ? "الصلاة القادمة" : "Next Prayer"); 

        // PendingIntent to launch app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        // Instruct the widget manager to update the widget
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
        
        // Schedule next update
        if (nextPrayerTime != null) {
            scheduleNextUpdate(context, nextPrayerTime);
        }
    }

    private static void scheduleNextUpdate(Context context, Date nextPrayerTime) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerWidgetProvider.class);
        intent.setAction("com.aniro.app.SCHEDULED_UPDATE");
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        // Schedule 1 second after prayer time to ensure it counts as "passed"
        long triggerTime = nextPrayerTime.getTime() + 1000;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
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
