# config-cli-helper

Helper for quickly writing commands such as `npm config ls`、 `npm config get`、 `npm config set` ...

cmd list:
- `you-cli config -h`
- `you-cli config set <key>=<value> [<key>=<value> ...]`
- `you-cli config get [<key> [<key> ...]]`
- `you-cli config del <key> [<key> ...]`
- `you-cli config ls [--json]`
- `you-cli config reset`

## install

`npm i config-cli-helper` or `yarn add config-cli-helper`

## use

```typescript
import cac from 'cac';
import { getConfigStore, getConfigCli, cacHelpWithConfigCli, ParamsDescription } from 'config-cli-helper';

const cliName = 'you-cli';
const defaultConfigStore = {
  cwd: './',
};
const paramsDescription: ParamsDescription = [
  { key: 'cwd'; value: string; description: string; },
];
const configStore = getConfigStore(cliName, defaultConfigStore);

// For example, this cmd: `you-cli config ls`
if (process.argv[2] === 'config') {
  const configCli = getConfigCli({
    cliName,
    configStore, // If you want to customize 'configStore', you can pass in this parameter. Otherwise, it will generate a "configStore" for you by default
    paramsDescription,
  });
  configCli.parse(process.argv.slice(1));
  process.exit();
}

console.log('config: ', configStore.get('config')); // { cwd: './' }

// Other cmd. For example, this cmd: `you-cli -h`
const cli = cac(cliName);
cli.help(
  cacHelpWithConfigCli(cliName)
);

```
