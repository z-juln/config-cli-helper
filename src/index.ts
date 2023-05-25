import cac from "cac";
import Configstore from "configstore";
import TtyTable from "tty-table";
import type { CAC } from "cac";

export interface ParamsDescription {
  key: string;
  value?: string;
  description?: string;
}

const getConfigStore = (cliName: string, defaultConfigStore?: Record<string, string>) => new Configstore(`config-cli__${cliName}`, defaultConfigStore);

const getConfigCli = ({
  cliName,
  configStore: _configStore,
  paramsDescriptions = [],
} : {
  cliName: string;
  configStore?: Configstore;
  paramsDescriptions?: ParamsDescription[];
}): CAC => {
  const configStore = _configStore ?? getConfigStore(cliName);
  const configOptsTable = TtyTable(
    // @ts-ignore
    [{ value: 'key' }, { value: 'value' }, { value: 'description' }],
    paramsDescriptions.map<ParamsDescription>(p => ({ key: p.key, value: p.value ?? '-----', description: p.value ?? '-----' })),
    [],
    // @ts-ignore
    { headerAlign: 'center' },
  ).render();
  const configCli = cac(`${cliName} config`);
  configCli.command('set <item> [...otherItems]')
    .action((item: string, otherItems: string[] = []) => {
      const appendedConfig = [item, ...otherItems].reduce((cfg, item) => {
        const [key, value] = item.split('=');
        return { ...cfg, [key]: value };
      }, {});
      const oldConfig = configStore.get('config');
      configStore.set('config', { ...oldConfig, ...appendedConfig });
    });
  configCli.command('get <key> [...otherKeys]')
    .action((key: string, otherKeys: string[] = []) => {
      const keys = [key, ...otherKeys];
      const config = configStore.get('config');
      if (keys.length > 1) {
        keys.forEach(key => console.log(`${key}=${config[key]}`));
      } else {
        console.log(config[key]);
      }
    });
  configCli.command('del <key> [...otherKeys]')
    .action((key: string, otherKeys: string[] = []) => {
      const keys = [key, ...otherKeys];
      const config = configStore.get('config');
      keys.forEach(key => delete config[key]);
      config.set('config', config);
    });
  configCli.command('ls')
    .option('--json', '')
    .action(({ json }) => {
      const config = Object.assign({}, configStore.get('config') ?? {});
      if (json) {
        console.log(JSON.stringify(config, null,2));
      } else {
        Object.entries(config).forEach(([key, value]) => console.log(`${key}=${value}`));
      }
    });
  configCli.command('reset')
    .action(() => configStore.clear());
  configCli.help(() => {
    return ([
      { body: 'Manage the npm2cjs configuration files' },
      {
        title: 'Usage',
        body: `\
npm2cjs config set <key>=<value> [<key>=<value> ...]
npm2cjs config get [<key> [<key> ...]]
npm2cjs config del <key> [<key> ...]
npm2cjs config ls [--json]
npm2cjs config reset`,
      },
      paramsDescriptions.length ? {
        title: 'ConfigOptions',
        body: configOptsTable,
      } : (null as any),
      { title: 'Options', body: '  -h, --help  Display this message ' }
    ]).filter(Boolean);
  });
  return configCli;
};

const cacHelpWithConfigCli = (cliName: string) => (sections: { title?: string; body: string; }[]) => {
  const Commands = sections.find(section => section.title === 'Commands');
  const ForMoreInfo = sections.find(section => section.title?.includes('For more info'));
  if (Commands) {
    Commands.body += '\n  config  修改全局配置项';
  }
  if (ForMoreInfo) {
    ForMoreInfo.body += `\n  $ ${cliName} config --help`;
  }
  return sections;
};

export {
  getConfigStore,
  getConfigCli,
  cacHelpWithConfigCli,
};
