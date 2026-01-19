import { CustomizationSettings } from "@/components/settings/customization-settings";
import { GeneralSettings } from "@/components/settings/general-settings";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 animate-fade-slide-in">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <GeneralSettings />
      <CustomizationSettings />
    </div>
  );
}
