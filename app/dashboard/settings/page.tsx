import TopBar from '@/components/layout/TopBar';
import SettingsManager from './SettingsManager';

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <SettingsManager />
    </>
  );
}
