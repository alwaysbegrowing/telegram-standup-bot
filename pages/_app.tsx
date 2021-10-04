import React, { useCallback, useEffect, useState } from 'react';

import { GeistProvider, CssBaseline } from '@geist-ui/react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { PrefersContext, themes, ThemeType, UserType } from '@/lib/use-prefers';
import Menu from '@/components/navigation/menu';
import Footer from '@/components/footer';

TimeAgo.addDefaultLocale(en);

const StoodBotApp = ({ Component, pageProps }: AppProps) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [userInfo, setUserInfo] = useState<UserType>();

  const switchTheme = useCallback((theme: ThemeType) => {
    setThemeType(theme);
    if (typeof window !== 'undefined' && window.localStorage)
      window.localStorage.setItem('theme', theme);
  }, []);

  const setUserDetails = useCallback((user: UserType) => {
    setUserInfo(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem('telegram-user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('telegram-user');
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');

    const theme = window.localStorage.getItem('theme') as ThemeType;
    if (themes.includes(theme)) setThemeType(theme);

    const user = window.localStorage.getItem('telegram-user') as string;
    if (user && user.includes('hash')) setUserInfo(JSON.parse(user));

    if (pageProps.TELEGRAM_USER && !user) {
      try {
        const deets = JSON.parse(pageProps.TELEGRAM_USER);
        setUserDetails(deets);
      } catch (e) {}
    }
  }, [pageProps.TELEGRAM_USER, setUserDetails]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <title>Stood Bot - Telegram daily updates</title>
        <meta
          name="description"
          content="Stood Bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time."
        />
        <meta name="og:title" content="Stood Bot - Telegram daily updates" />
        <meta
          name="og:description"
          content="Stood Bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time."
        />
        <meta
          name="description"
          content="Stood Bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GeistProvider themeType={themeType}>
        <CssBaseline />
        <PrefersContext.Provider
          value={{
            BOT_NAME: pageProps.BOT_NAME,
            userInfo,
            setUserDetails,
            themeType,
            switchTheme,
          }}
        >
          <Menu />
          <Component {...pageProps} />
          <Footer />
        </PrefersContext.Provider>
      </GeistProvider>
    </>
  );
};

export async function getStaticProps() {
  return {
    props: {
      BOT_NAME: process.env.BOT_NAME,
      TELEGRAM_USER: process.env.TELEGRAM_USER,
    },
  };
}

export default StoodBotApp;
