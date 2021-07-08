import { useState, useEffect } from 'react';
import {
  Note,
  Loading,
  Row,
  Col,
  Table,
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

            {data.groupUpdates.map((u, i) => {
              return (
                <div style={{ marginBottom: 20 }}>
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
