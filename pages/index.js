import ReactTimeAgo from 'react-time-ago';
import ReactMarkdown from 'react-markdown';
import { Note, Loading, Tooltip, Image, useTheme, Grid } from '@geist-ui/react';
import useSWR from 'swr';
import gfm from 'remark-gfm';
import Heading from '@/components/heading';
import Project from '@/components/project';
import { usePrefers } from '../lib/use-prefers';
import HomePage from './home';

async function fetchWithToken(url) {
  const user = localStorage.getItem('telegram-user');
  if (!user) throw new Error('user not found');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: user,
  });

  if (res.status !== 200) throw new Error(res.statusText);

  return res.json();
}

const TooltipContainer = ({ verboseDate, children, ...rest }) => (
  <Tooltip text={verboseDate}>{children}</Tooltip>
);

const TGVideo = ({ u }) => (
  <video
    controls={u.type !== 'animation'}
    autoPlay={u.type === 'animation'}
    loop
  >
    <source src={u.file_path} />
  </video>
);

const TGPhoto = ({ u }) => (
  <Image src={u.file_path} alt="Submission" width={300} height={200} />
);

const TGFile = ({ u }) => {
  if (!u.file_path) return null;
  if (['voice', 'video', 'animation', 'audio', 'video_note'].includes(u.type)) {
    return <TGVideo u={u} />;
  } else if (u.type === 'photo') {
    return <TGPhoto u={u} />;
  }
};
function Pager({ initialData: data }) {
  const formattedData = (data || [])
    .filter((u) => {
      return u.message || u.file_path || u.locked;
    })
    .map((u) => {
      return {
        ...u,
        createdAt: (
          <ReactTimeAgo
            wrapperComponent={TooltipContainer}
            tooltip={false}
            date={u.createdAt}
            locale="en-US"
          />
        ),
        message: (() => {
          if (!u.message) return;

          if (!u?.entities) {
            return <span style={{ whiteSpace: 'pre-wrap' }}>{u.message}</span>;
          }

          return (
            <ReactMarkdown remarkPlugins={[gfm]}>{u.message}</ReactMarkdown>
          );
        })(),
        file_path: (() => {
          if (!u.groupId) {
            return <TGFile u={u} />;
          }

          if (u.groupId) {
            const groupMedia = u.archive.filter((b) => b.groupId === u.groupId);
            if (groupMedia?.length) {
              return (
                <Grid.Container gap={1} justify="center">
                  <Grid key={u.createdAt} md={6} xs={12}>
                    <TGFile u={u} />
                  </Grid>
                  {groupMedia.map((b) => (
                    <Grid key={b.createdAt} md={6} xs={24} sm={12}>
                      <TGFile u={b} />
                    </Grid>
                  ))}
                </Grid.Container>
              );
            }
          }
        })(),
      };
    });

  return formattedData.map((user) => <Project key={user.id} {...user} />);
}

export default function Home() {
  const prefers = usePrefers();
  const theme = useTheme();

  const { data: initialData, error: initialDataError } = useSWR(
    [`/api/updates`],
    fetchWithToken
  );

  const { data: groups, error: groupsError } = useSWR(
    [`/api/groups`],
    fetchWithToken
  );

  if (!prefers?.userInfo) {
    return <HomePage />;
  }

  return (
    <>
      <Heading
        user={{
          ...prefers.userInfo,
          role: 'User',
          groups: Array.isArray(groups) ? groups.join(', ') : null,
        }}
      />

      <div className="page__wrapper">
        <div className="page__content">
          <div className="projects">
            {prefers?.userInfo?.photo_url && (
              <div>
                {prefers?.userInfo && initialDataError && (
                  <Note type="info">
                    This bot has not been setup yet! Please wait for some
                    updates to get posted first.
                  </Note>
                )}

                {prefers?.userInfo && !initialDataError && !initialData && (
                  <Loading>loading...</Loading>
                )}

                <Pager initialData={initialData} />
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .page__wrapper {
          background-color: ${theme.palette.accents_1};
        }
        .page__content {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: 0 ${theme.layout.pageMargin};
          transform: translateY(-35px);
          box-sizing: border-box;
        }
        .projects {
          flex: 1;
          width: 540px;
          max-width: 100%;
        }
        .projects :global(.project__wrapper):not(:last-of-type) {
          margin-bottom: calc(1.5 * ${theme.layout.gap});
        }
        .page__content :global(.view-all) {
          font-size: 0.875rem;
          font-weight: 700;
          margin: calc(1.5 * ${theme.layout.gap}) 0;
          text-align: center;
        }
        @media (max-width: ${theme.breakpoints.sm.max}) {
          .page__content {
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
          }
          .projects {
            width: 100%;
            margin-right: unset;
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: { BOT_NAME: process.env.BOT_NAME },
  };
}
