import Head from 'next/head';
import useSWR from 'swr';
import styles from '../styles/Home.module.css';

function Profile() {
  const { data, error } = useSWR('/api/view');

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}

export default function Home() {
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

        <p className={styles.description}>
          Get started by messaging
          <a className={styles.code} href='https://t.me/supersimplestandupbot'>
            @SuperSimpleStandupBot
          </a>
        </p>

        <div className={styles.grid}>
          <a
            href='https://github.com/RusseII/telegram-standup-bot'
            className={styles.card}
          >
            <h2>Documentation &rarr;</h2>
            <p>
              Find in-depth information about SuperSimpleStandupBot features and
              API.
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
