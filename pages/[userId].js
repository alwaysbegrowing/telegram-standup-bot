import { Loading } from '@geist-ui/react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Update from '../components/views/Update';
import { fetchWithToken } from '../lib/helpers';
import { usePrefers } from '../lib/use-prefers';
import styles from '../styles/Home.module.css';

const UserPage = () => {
  const prefers = usePrefers();
  const router = useRouter();
  const { userId } = router.query;

  const { data: initialData, error: initialDataError } = useSWR(
    [`/api/updates/?userId=${userId}`],
    fetchWithToken
  );

  return (
    <>
      <main className={styles.main}>
        {prefers?.userInfo && !initialDataError && !initialData && (
          <Loading>loading...</Loading>
        )}

        {Array.isArray(initialData) && (
          <Update
            initialDataError={initialDataError}
            initialData={initialData}
          />
        )}

        {Array.isArray(initialData?.[0]?.archive) && (
          <Update
            initialDataError={initialDataError}
            initialData={initialData?.[0]?.archive}
          />
        )}
      </main>
    </>
  );
};

export default UserPage;
