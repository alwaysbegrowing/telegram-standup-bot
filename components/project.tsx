import React from 'react';
import { Button, Text, Link, Card, Dot, Tag, useTheme } from '@geist-ui/react';
import * as Icons from 'react-feather';

interface Props {
  name: string;
  file_path: string;
  message: string;
  createdAt: string;
}

export type ProjectProps = Props;

const Project: React.FC<ProjectProps> = ({
  name,
  createdAt,
  file_path,
  message,
}) => {
  const theme = useTheme();

  return (
    <>
      <div className="project__wrapper">
        <Card className="project__card" shadow>
          <div className="project__title">
            <Text h3>{name}</Text>
            <Button className="project__visit-button" size="small" auto>
              More
            </Button>
          </div>
          <div>{message}</div>
          <div>{file_path}</div>
          <Card.Footer className="project__footer">
            <Icons.Calendar size={14} />
            <Text className="project__repo">{createdAt}</Text>
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
