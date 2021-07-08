import { useState, useEffect } from 'react';
import {
  Note,
  Loading,
  Row,
  Col,
  Display,
  Table,
  Image,
  Collapse,
  Page,
  Text,
  User,
} from '@geist-ui/react';
import Head from 'next/head';
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
    const userInfo = localStorage.getItem('telegram-user');

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const formattedData =
    data?.groupUpdates &&
    data.groupUpdates.map((d) => {
      return {
        ...d,
        updates: d.updates
          .filter((u) => {
            return u.message || u.caption || u.file_path;
          })
          .map((u) => {
            return {
              ...u,
              createdAt: new Date(u.createdAt).toDateString(),
              file_path: () => {
                if (!u.file_path) return;
                if (
                  [
                    'voice',
                    'video',
                    'animation',
                    'audio',
                    'video_note',
                  ].includes(u.type)
                ) {
                  return (
                    <video
                      controls={u.type !== 'animation'}
                      autoPlay={u.type === 'animation'}
                      loop
                    >
                      <source src={u.file_path} />
                    </video>
                  );
                } else if (u.type === 'photo') {
                  return (
                    <Image src={u.file_path} alt='Submission' height={200} />
                  );
                }
              },
            };
          }),
      };
    });

  const handleTelegramResponse = (response) => {
    localStorage.setItem('telegram-user', JSON.stringify(response));
    setUser(response);
  };

  return (
    <Page>
      <Head>
        <title>Super Simple Standup Bot</title>
        <meta
          name='description'
          content='Super simple standup bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Page.Header>
        <Row gap={0.8} align='middle' justify='space-around'>
          <Col span='auto'>
            <Text h2>Super Simple Standup Bot</Text>
          </Col>
          <Col span='auto'>
            {!user?.photo_url && (
              <TelegramLoginButton
                dataOnauth={handleTelegramResponse}
                botName='stood_bot'
              />
            )}

            {user && error && <Note type='error'>Could not load profile</Note>}
            {user && !data && <Loading>loading...</Loading>}

            {data && user.photo_url && (
              <User size='medium' src={user.photo_url} name={user.first_name}>
                {data.groups.join(', ')}
              </User>
            )}
          </Col>
        </Row>
      </Page.Header>

      <Page.Content>
        {data && user.photo_url ? (
          <div>
            <Text h3>Group updates</Text>

            {formattedData.map((u, i) => {
              return (
                <div key={i} style={{ marginBottom: 20 }}>
                  <Collapse
                    key={i}
                    shadow
                    title={u.name}
                    subtitle={
                      u.updates.slice(-1)[0]?.message || 'No updates yet...'
                    }
                  >
                    <Table data={u.updates}>
                      <Table.Column prop='createdAt' label='date' />
                      <Table.Column prop='message' label='message' />
                      <Table.Column prop='file_path' label='file' />
                    </Table>
                  </Collapse>
                </div>
              );
            })}
          </div>
        ) : (
          <>
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
                <p>
                  Find in-depth information about {BOT_NAME} features and API.
                </p>
              </a>
            </div>
          </>
        )}
      </Page.Content>
    </Page>
  );
}

export async function getStaticProps() {
  return {
    props: { BOT_NAME: process.env.BOT_NAME },
  };
}
