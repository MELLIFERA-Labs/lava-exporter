# lava-exporter
> Simple exporter to check your lava provider is frozen or not 

## Install  

### Download exporter: 
```bash 
wget https://github.com/MELLIFERA-Labs/lava-exporter/releases/download/v1.0.0/lava-exporter-linux-v1.0.0-amd64
```
### Or build from source: 
1. Install bun(JavaScript runtime) https://bun.sh
2. Clone this repo
3. Install dependencies:
```bash
bun install
```
4. build binary:
```bash
bun build ./index.ts --compile --outfile lava-exporter  
```
## Usage 
### Config example 
```toml
lava_rest_api = ['https://rest-public-rpc.lavanet.xyz']
chains = ['EVMOST', 'EVMOS', 'AXELAR', 'AXELART']
lava_provider_address = 'lava@1rgs6cp3vleue3vwffrvttjtl4laqhk8fthu466' 
```
Look at [config.example.toml](config.example.toml) for more details
### Run
```bash
./lava-exporter start --config config.toml --port 3440 
```

### Metrics expose example 
```
# HELP provider_frozen Freezed status of a provider. 1 for frozen, 0 can be (not frozen) or (not found) in the provider's response.
# TYPE provider_frozen gauge
provider_frozen{chain="EVMOST"} 0
provider_frozen{chain="EVMOS"} 0
provider_frozen{chain="AXELAR"} 0
provider_frozen{chain="AXELART"} 0
```
