import { useRouter } from 'next/router';
import { Button, Fieldset, Grid, Link, Page, Spacer } from '@geist-ui/react';

const SettingsPage = () => {
  const router = useRouter();
  const { user } = router.query;

  return (
    <>
      <Page>
        <Page.Content>
          <Grid.Container gap={1} alignItems="stretch" alignContent="stretch">
            <Grid md={4} xs={12} alignContent="flex-start" direction="column">
              <span>General</span>
              <Spacer y={1} />
              <span>Groups</span>
            </Grid>

            <Grid xs>
              <Fieldset style={{ width: '100%' }}>
                <Fieldset.Title>Pause Reminders</Fieldset.Title>
                <Fieldset.Subtitle>
                  Stop the bot from sending you a reminder in the morning.
                </Fieldset.Subtitle>
                <Fieldset.Footer>
                  <Fieldset.Footer.Status />
                  <Fieldset.Footer.Actions>
                    <Button type="error" auto size="small">
                      Pause Reminders
                    </Button>
                  </Fieldset.Footer.Actions>
                </Fieldset.Footer>
              </Fieldset>
            </Grid>
          </Grid.Container>
        </Page.Content>
      </Page>
    </>
  );
};

export default SettingsPage;
