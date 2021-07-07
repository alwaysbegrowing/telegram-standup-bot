import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import useSWR from 'swr';
import styles from '../styles/Home.module.css';
import TelegramLoginButton from 'react-telegram-login';

async function fetchWithToken(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export default function Home({ BOT_NAME }) {
  const [user, setUser] = useState({});
  const { data, error } = useSWR(['/api/view', user], fetchWithToken);

  useEffect(() => {
    const data = localStorage.getItem('telegram-user');

    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  const handleTelegramResponse = (response) => {
    localStorage.setItem('telegram-user', JSON.stringify(response));
    setUser(response);
  };

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Super Simple Standup Bot</title>
        <meta
          name='description'
          content='Super simple standup bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Super Simple Standup Bot</h1>

        {!user.photo_url && (
          <TelegramLoginButton
            dataOnauth={handleTelegramResponse}
            botName='stood_bot'
          />
        )}

        {user.photo_url && (
          <div>
            <Image src={user?.photo_url} width={40} height={40} alt='Avatar' />
            {user.first_name}

            <div>
              <h2>Groups you follow</h2>

              <ol>
                {data.groups.map((group, i) => {
                  return (
                    <li key={group.chatId}>
                      <h4>{group.title}</h4>
                      {group.members.map((m) => {
                        return (
                          <div key={m.about.first_name + m.chatId}>
                            <h5>{m.about.first_name}</h5>
                            <ul>
                              {m.updateArchive.map((u) => {
                                if (u.message)
                                  return (
                                    <li key={u.createdAt}>
                                      {u.createdAt} - {u.message}
                                    </li>
                                  );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        <p className={styles.description}>
          Get started by messaging{' '}
          <a className={styles.code} href={`https://t.me/${BOT_NAME}`}>
            @{BOT_NAME}
          </a>
        </p>

        <div className={styles.grid}>
          <a
            href='https://github.com/RusseII/telegram-standup-bot'
            className={styles.card}
          >
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about {BOT_NAME} features and API.</p>
          </a>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: { BOT_NAME: process.env.BOT_NAME },
  };
}
