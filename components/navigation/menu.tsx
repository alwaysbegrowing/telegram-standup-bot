import type React from 'react';
import TelegramLoginButton from 'react-telegram-login';
import { Avatar, Button, useTheme, Popover } from '@geist-ui/react';
import { Sun, Moon } from '@geist-ui/react-icons';
import UserSettings from '@/components/navigation/user-settings';
import { usePrefers } from '@/lib/use-prefers';
import Submenu from '@/components/navigation/submenu';

const Menu: React.FC = () => {
  const theme = useTheme();
  const prefers = usePrefers();
  const handleTelegramResponse = (response) => {
    prefers.setUserDetails(response);
  };

  return (
    <>
      <nav className="menu-nav">
        <h1 className="menu-nav__title">Stood Bot for Telegram</h1>
        <div>
          <Button
            aria-label="Toggle Dark mode"
            className="theme-button"
            auto
            type="abort"
            onClick={() =>
              prefers.switchTheme(theme.type === 'dark' ? 'light' : 'dark')
            }
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {theme.type === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          {prefers?.userInfo && (
            <Popover
              placement="bottomEnd"
              portalClassName="user-settings__popover"
            >
              <button className="user-settings__button">
                <Avatar src={prefers?.userInfo?.photo_url} text="SB" />
              </button>
            </Popover>
          )}

          {!prefers?.userInfo && (
            <TelegramLoginButton
              dataOnauth={handleTelegramResponse}
              botName={process.env.NEXT_PUBLIC_BOT_NAME}
            />
          )}
        </div>
      </nav>
      <Submenu />
      <style>{`
        .menu-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: 0 ${theme.layout.pageMargin};
          background-color: ${theme.palette.background};
          font-size: 16px;
          height: 54px;
          box-sizing: border-box;
        }
        .menu-nav__title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          letter-spacing: 0;
        }
        .menu-nav > div {
          display: flex;
          align-items: center;
        }
        .menu-nav :global(.theme-button) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          padding: 0;
          margin: 0 ${theme.layout.gapHalf};
        }
        .user-settings__button {
          border: none;
          background: none;
          padding: 0;
          margin: 0;
          appearance: none;
          cursor: pointer;
        }
        :global(.user-settings__popover) {
          width: 180px !important;
        }
      `}</style>
    </>
  );
};

export default Menu;
