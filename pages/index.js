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

function updateList(data) {}

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

        {data && user.photo_url && (
          <div>
            <Image src={user.photo_url} width={40} height={40} alt='Avatar' />
            {user.first_name}

            <div>
              <h2>Your Groups</h2>

              <ol>
                {data.groups.map((title, i) => {
                  return <li key={i}>{title}</li>;
                })}
              </ol>
              <div>
                <h2>Group Updates</h2>

                {data.groupUpdates.map((u, i) => {
                  return (
                    <div key={i}>
                      <h5>{u.about.first_name}</h5>
                      <ul>
                        {u.updateArchive.map((b) => {
                          if (b.message)
                            return (
                              <li key={b.createdAt}>
                                {b.createdAt} - {b.message}
                              </li>
                            );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
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

      <footer className={styles.footer}>
        {!user?.photo_url && (
          <TelegramLoginButton
            dataOnauth={handleTelegramResponse}
            botName='stood_bot'
          />
        )}

        {user && error && <div>failed to load</div>}
        {user && !data && <div>loading...</div>}
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: { BOT_NAME: process.env.BOT_NAME },
  };
}
