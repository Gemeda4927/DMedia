'use client';

import { NotificationProvider } from '../lib/notifications';

export default function NotificationProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

