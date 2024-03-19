import { Button, Fieldset, Grid, Page, Spacer } from '@geist-ui/react';
import { useRouter } from 'next/router';

const SettingsPage = () => {
  const router = useRouter();
  const { user } = router.query;

  return (
    <>
      <Page>
        <Grid.Container gap={1} alignItems="stretch" alignContent="stretch">
          <Grid md={4} xs={12} alignContent="flex-start" direction="column">
            <span>General</span>
            <Spacer />
            <span>Groups</span>
          </Grid>

          <Grid xs>
            <Fieldset style={{ width: '100%' }}>
              <Fieldset.Title>Pause Reminders</Fieldset.Title>
              <Fieldset.Subtitle>
                Stop the bot from sending you a reminder in the morning.
              </Fieldset.Subtitle>
              <Fieldset.Footer>
                {' '}
                <Button
                  auto
                  scale={1 / 3}
                  type="error"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  Pause Reminders
                </Button>
              </Fieldset.Footer>
            </Fieldset>
          </Grid>
        </Grid.Container>
      </Page>
    </>
  );
};

export default SettingsPage;
