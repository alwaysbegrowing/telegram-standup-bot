import ReactTimeAgo from 'react-time-ago';
import NextLink from 'next/link';
import {
  Note,
  Loading,
  Tooltip,
  Image,
  Link,
  Text,
  useTheme,
} from '@geist-ui/react';
import useSWR from 'swr';
import Heading from '@/components/heading';
import Project from '@/components/project';
import EventListItem from '@/components/activity-event';
import { usePrefers } from '../lib/use-prefers';
import HomePage from './home';

async function fetchWithToken(url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: localStorage.getItem('telegram-user'),
  });

  if (res.status !== 200) throw new Error(res.statusText);

  return res.json();
}

const TooltipContainer = ({ verboseDate, children, ...rest }) => (
  <Tooltip text={verboseDate}>{children}</Tooltip>
);

function Pager({ initialData: data }) {
  const formattedData = (data || [])
    .filter((u) => {
      return u.message || u.file_path;
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
        message: u.message ? (
          <span style={{ whiteSpace: 'pre-wrap' }}>{u.message}</span>
        ) : (
          ''
        ),
        file_path: () => {
          if (!u.file_path) return;
          if (
            ['voice', 'video', 'animation', 'audio', 'video_note'].includes(
              u.type
            )
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
            return <Image src={u.file_path} alt="Submission" height={200} />;
          }
        },
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
          <div className="recent-activity">
            <Text h2 className="recent-activity__title">
              Recent Activity
            </Text>
            <EventListItem
              username={prefers?.userInfo?.first_name}
              avatar="//via.placeholder.com/30"
              createdAt="4m"
            >
              Sample activity item in <b>production</b>
            </EventListItem>
            <NextLink href="/activity" passHref>
              <Link className="view-all" color underline>
                View All Activity
              </Link>
            </NextLink>
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
          width: 540px;
          max-width: 100%;
          margin-right: calc(4 * ${theme.layout.gap});
        }
        .projects :global(.project__wrapper):not(:last-of-type) {
          margin-bottom: calc(1.5 * ${theme.layout.gap});
        }
        .recent-activity {
          flex: 1;
        }
        .recent-activity :global(.recent-activity__title) {
          font-size: 0.875rem;
          font-weight: 700;
          margin: 0 0 calc(3 * ${theme.layout.gapHalf});
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
