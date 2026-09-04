import * as React from 'react';
import { AppProvider, type Session } from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';

type AccountSignedInProps = {
  session?: Session | null;
  signIn: () => void;
  signOut: () => void;
};

export default function AccountSignedIn({ session, signIn, signOut }: AccountSignedInProps) {
  const authentication = React.useMemo(() => {
    return {
      signIn: signIn,
      signOut: signOut,
    };
  }, [signIn, signOut]);

  return (
    <AppProvider authentication={authentication} session={session}>
      <Account />
    </AppProvider>
  );
}
