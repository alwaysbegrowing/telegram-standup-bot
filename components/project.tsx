import React from 'react';
import {
  Button,
  User,
  Card,
  useTheme,
  Display,
  Tooltip,
} from '@geist-ui/react';
import { Calendar, Lock } from '@geist-ui/react-icons';
import timeUntil from 'time-until';
import { useRouter } from 'next/router';

interface Props {
  username: string;
  name: string;
  photo: string;
  file_id: () => React.ReactNode;
  message: () => React.ReactNode;
  locked: boolean;
  createdAt: string;
}

export type ProjectProps = Props;

const Project: React.FC<ProjectProps> = ({
  name,
  username,
  photo,
  locked,
  createdAt,
  file_id,
  message,
}) => {
  const theme = useTheme();
  const router = useRouter();

  if (!file_id && !message) return null;

  // Releases are at 4pm UTC every day
  const nextSubmit = new Date();
  nextSubmit.setUTCHours(15);
  nextSubmit.setUTCMinutes(8);
  nextSubmit.setUTCSeconds(0);

  var currentDate = new Date();
  // Set release date to tomorrow because release has passed
  if (currentDate.getTime() >= nextSubmit.getTime()) {
    nextSubmit.setUTCDate(nextSubmit.getUTCDate() + 1);
  }

  return (
    <>
      <div className="project__wrapper">
        <Card className="project__card" shadow>
          <div className="project__title">
            <User src={photo} name={name}>
              <User.Link href={`https://t.me/${username}`}>
                @{username}
              </User.Link>
            </User>
            <Button
              onClick={() => router.push(username)}
              className="project__visit-button"
              auto
            >
              More
            </Button>
          </div>
          <div className="content">
            {locked && (
              <Display
                caption={`This new update will be unlocked in ${
                  timeUntil(nextSubmit).string
                }`}
              >
                <Lock color="lightgray" size={150} />
              </Display>
            )}
            {!locked && (
              <>
                <div>{message}</div>
                <div>{file_id}</div>
              </>
            )}
          </div>
          <Card.Footer className="project__footer">
            <Calendar size={14} />
            {createdAt}
          </Card.Footer>
        </Card>
      </div>
      <style jsx>{`
        .project__wrapper :global(.project__card) {
          padding: 0 !important;
        }
        .project__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${theme.layout.gap};
        }
        .project__title :global(h3) {
          margin: 0;
        }
        .project__wrapper :global(.project__deployment) {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-top: ${theme.layout.gapQuarter};
        }
        .project__wrapper :global(.project__deployment) :global(.icon) {
          background-color: #50e3c2;
        }
        .project__wrapper :global(.project__deployment) :global(.label) {
          display: flex;
          align-items: center;
          flex: 1;
          overflow: hidden;
          text-transform: unset;
        }
        .project__wrapper :global(.project__deployment) :global(a) {
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .project__wrapper :global(.project__environment-tag) {
          color: ${theme.palette.foreground};
          background: ${theme.palette.accents_1};
          border-color: ${theme.palette.accents_2};
          border-radius: 1rem;
          padding: 2px 6px;
          height: unset;
          font-size: 0.75rem;
          font-weight: 500;
          margin-left: ${theme.layout.gapHalf};
        }
        .project__wrapper :global(.project__created-at) {
          color: ${theme.palette.accents_4};
          font-size: 0.875rem;
          text-align: right;
          margin: 0 0 0 ${theme.layout.gapHalf};
        }
        .project__wrapper :global(.project__footer) {
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        .project__wrapper :global(.project__repo) {
          font-size: 0.875rem;
          font-weight: 500;
          margin-left: ${theme.layout.gapQuarter};
        }
        @media (max-width: ${theme.breakpoints.xs.max}) {
          .project__wrapper :global(.project__visit-button) {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Project;
