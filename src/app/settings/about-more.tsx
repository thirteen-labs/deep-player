import Constants from 'expo-constants';
import { InfoCircle, Settings } from 'iconoir-react-native';

import { AppButton, InfoRow, Screen, SectionCard, TopBar } from '@/components/ui';
import { env } from '@/config/env';
import { openAppSettings } from '@/lib/permissions';

export default function AboutMoreScreen() {
  return (
    <Screen header={<TopBar title="About & more" showBack />}>
      <SectionCard title="About" icon={InfoCircle} iconSize={20}>
        <InfoRow label="Name" value="Deep Player" icon={InfoCircle} iconSize={22} />
        <InfoRow
          label="Version"
          value={Constants.expoConfig?.version ?? '—'}
          valueColor="textSecondary"
          icon={Settings}
          iconSize={22}
        />
        <InfoRow label="Environment" value={env.appEnv} valueColor="textSecondary" icon={Settings} iconSize={22} />
        <InfoRow
          label="Icons"
          subtitle="Solar Icons by 480 Design (CC BY 4.0) · Iconoir"
          icon={InfoCircle}
          iconSize={22}
        />
      </SectionCard>

      <SectionCard title="More" icon={Settings} iconSize={20}>
        <AppButton
          label="System settings"
          icon={Settings}
          variant="ghost"
          size="small"
          onPress={() => void openAppSettings()}
        />
      </SectionCard>
    </Screen>
  );
}
