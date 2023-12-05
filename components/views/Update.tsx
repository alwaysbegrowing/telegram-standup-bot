import ReactTimeAgo from 'react-time-ago';
import ReactMarkdown from 'react-markdown';
import { Note, Loading, Tooltip, useTheme, Grid } from '@geist-ui/react';
import gfm from 'remark-gfm';
import Project from '@/components/project';
import { usePrefers } from '../../lib/use-prefers';
import TGFile from './../../components/views/File';

const TooltipContainer = ({ verboseDate, children }) => (
  <Tooltip text={verboseDate}>{children}</Tooltip>
);

export const Pager = ({ initialData: data }) => {
  const formattedData = (data || [])
    .filter((u) => {
      return u.message || u.file_id || u.locked;
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
          if (!u.locked && !u.message) return;

          if (!u?.entities) {
            return <span style={{ whiteSpace: 'pre-wrap' }}>{u.message}</span>;
          }

          return (
            <ReactMarkdown remarkPlugins={[gfm]}>{u.message}</ReactMarkdown>
          );
        })(),
        file_id: (() => {
          if (!u.file_id) return;

          if (!u.groupId) {
            return <TGFile u={u} />;
          }

          if (u.groupId) {
            const groupMedia = u?.archive?.filter(
              (b) => b.groupId === u.groupId,
            );
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
};

const Update = ({ initialData, initialDataError }) => {
  const prefers = usePrefers();
  const theme = useTheme();

  return (
    <>
      <div className="page__wrapper">
        <div className="page__content">
          <div className="projects">
            {prefers?.userInfo?.first_name && (
              <div>
                {prefers?.userInfo && initialDataError && (
                  <Note>
                    This bot has not been setup yet! Please wait for some
                    updates to get posted first.
                  </Note>
                )}

                {prefers?.userInfo && !initialDataError && !initialData && (
                  <Loading>loading...</Loading>
                )}

                {Array.isArray(initialData) && (
                  <Pager initialData={initialData} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .page__wrapper {
          background-color: ${theme.palette.accents_1};
          margin-bottom: 60px;
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
};

export default Update;
