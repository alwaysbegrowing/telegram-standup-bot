import React from 'react';
import { Popover, Link } from '@geist-ui/react';
import { usePrefers } from '@/lib/use-prefers';

const UserSettings = () => {
  const prefers = usePrefers();
  const logout = () => {
    prefers.setUserDetails(null);
  };

  return (
    <>
      <Popover.Item title>
        <span>User Settings</span>
      </Popover.Item>
      <Popover.Item>
        <Link
          href="https://github.com/alwaysbegrowing/telegram-standup-bot"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          GitHub
        </Link>
      </Popover.Item>
      <Popover.Item line />
      <Popover.Item>
        <Link
          href="#"
          onClick={logout}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Logout
        </Link>
      </Popover.Item>
    </>
  );
};

export default UserSettings;
