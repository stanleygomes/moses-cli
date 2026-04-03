import { readConfig } from '../../utils/config-store.js';
import * as display from '../../utils/display.js';

export async function runListGitlabs(): Promise<void> {
  display.banner();

  try {
    const config = await readConfig();

    if (!config || config.gitlabs.length === 0) {
      display.warn('No GitLab instances configured.');
      display.info('Run "moses init" to add a new instance.');
      return;
    }

    display.section('📋 CONFIGURED GITLAB INSTANCES');

    config.gitlabs.forEach((gitlab) => {
      const isDefault = gitlab.name === config.defaultGitlab;
      const indicator = isDefault ? '⭐️ ' : '🔹 ';
      const label = isDefault ? ` (DEFAULT)` : '';

      display.info(`${indicator}${gitlab.name}${label}`);
      display.info(`   URL: ${gitlab.url}`);
      display.info(
        `   Token: ${gitlab.token.replace(/./g, '*').substring(0, 10)}... (last 4 chars: ${gitlab.token.slice(-4)})`,
      );
      console.log('');
    });

    display.info(`TIP: You can use "moses gitlab default" to change the default instance.`);
  } catch (error) {
    display.error('Could not load Moses configuration.');
    display.info('Run "moses init" if you haven\'t yet.');
    console.log(error);
  }
}
