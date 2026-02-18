package com.aniro.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "AzanBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "Device booted - Azan alarms will be rescheduled when app opens");
            // The @capacitor/local-notifications plugin handles restoration
            // User must open the app once after boot to reschedule alarms
            // For a fully automatic solution, a foreground service would be needed
        }
    }
}
