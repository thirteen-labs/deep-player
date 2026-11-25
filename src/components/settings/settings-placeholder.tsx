import type { ReactNode } from 'react';

import { EmptyState, Screen, SectionCard, TopBar } from '@/components/ui';
import type { AppIcon } from '@/components/ui';

type SettingsPlaceholderProps = {
  title: string;
  icon: AppIcon;
  message: string;
  children?: ReactNode;
};

/** Consistent shell for settings destinations whose feature is not wired up yet. */
export function SettingsPlaceholder({ title, icon, message, children }: SettingsPlaceholderProps) {
  return (
    <Screen header={<TopBar title={title} showBack />}>
      <SectionCard title={title} icon={icon} iconSize={20}>
        <EmptyState icon={icon} message={message} />
      </SectionCard>
      {children}
    </Screen>
  );
}
