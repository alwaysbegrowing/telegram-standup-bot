import React from 'react';
import Image from 'next/image';
import { Text, Link, useTheme } from '@geist-ui/react';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <footer>
        <div>
          <div style={{ display: 'inline-block' }}>
            <Text>Powered by </Text>
          </div>
          <div style={{ display: 'inline-block' }}>
            
            <Link
              href="https://vercel.com?utm_source=alwaysbegrowing&utm_campaign=oss"
              target="_blank"
              rel="noopener"
              underline
            >
              <Image
                alt="Vercel Logo"
                height={15}
                width={70}
                src={`/logos/vercel-logotype-${
                  theme.type === 'dark' ? 'light' : 'dark'
                }.svg`}
              />
            </Link>
             <Link
              href="http://www.bugsnag.com/"
              target="_blank"
              rel="noopener"
              underline
            >
              <Image
                alt="Bugsnag Logo"
                height={15}
                width={70}
                src="https://images.typeform.com/images/QKuaAssrFCq7/image/default-firstframe.png"
              />
            </Link>
          </div>
        </div>
      </footer>
      <style jsx>{`
        footer {
          border-top: 1px solid ${theme.palette.border};
          padding: ${theme.layout.gapQuarter} ${theme.layout.gap};
          text-align: center;
        }
      `}</style>
    </>
  );
};

export default Footer;
