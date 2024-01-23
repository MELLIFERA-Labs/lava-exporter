import Prometheus from "prom-client";
import toml from "toml";
import { Command } from 'commander';
import fs from 'fs'
import { fetchWithTimeoutAndFallback, urlResolve } from "./helper";
const program = new Command();
const freezedProviders = new Prometheus.Gauge({
  name: 'provider_frozen',
  help: 'Freezed status of a provider. 1 for frozen, 0 can be not frozen or not found in providers response.',
  labelNames: ['chain'],
});
type Config = {
  lava_rest_api: string[],
  chains: string[],
  lava_provider_address: string,
}
async function getFrozenChains(config: Config) {
  const frozenChains = []; 
  const latestBlockUrl = config.lava_rest_api.map((url) => urlResolve(url, '/cosmos/base/tendermint/v1beta1/blocks/latest'));
  const latestBlockResponse = await fetchWithTimeoutAndFallback(latestBlockUrl, 5000) as any;
  const latestHeight = latestBlockResponse.block.header.height;
  for (const chain of config.chains) {
    const providerStatusUrl = config.lava_rest_api.map((url) => urlResolve(url, `/lavanet/lava/pairing/providers/${chain}?showFrozen=true`));
    const providerStatusResponse = await fetchWithTimeoutAndFallback(providerStatusUrl, 5000) as any;
    const frozenTotal = providerStatusResponse.stakeEntry.filter((provider: { stake_applied_block: string; }) => Number(provider.stake_applied_block) > Number(latestHeight))
    const frozenProvider = frozenTotal.find((provider: { address: string; }) => config.lava_provider_address === provider.address);
    if (frozenProvider) {
      frozenChains.push(chain);    
    }
  }
  return frozenChains;
}

program
  .name('cosmos-exporter')
  .description('Prometheus lava exporter')
  .version('1.0.0');

program.command('start')
  .description('run exporter')
  .option('--config <config>', 'Path to config file', './config.toml')
  .option('-p, --port <port>', 'port', '5000')
  .action(async (opt) => {
    const tomlConfig = toml.parse(fs.readFileSync(opt.config, "utf-8")) as Config;
        
    Bun.serve({
      port: opt.port,
      async fetch(req) {
        const frozenChains = await getFrozenChains(tomlConfig);
        tomlConfig.chains.forEach((chain) => {
          freezedProviders.labels({ chain }).set(0);
        });
        frozenChains.forEach((chain) => {
          freezedProviders.labels({ chain }).set(1);
        });
        req.headers.set('Content-Type', Prometheus.register.contentType);
        const metrics = await Prometheus.register.metrics();
        return new Response(metrics)
      },
    });
    console.log('RUN WITH CONFIG:')
    console.log(tomlConfig)
    console.log('listening on port ' + opt.port)
  })

program.parse(process.argv);
