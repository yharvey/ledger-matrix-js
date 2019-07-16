<template>
  <div class="matrixLedger">
    <input
      id="webusb"
      v-model="transportChoice"
      type="radio"
      value="WebUSB"
    >
    <label for="webusb">WebUSB</label>
    <input
      id="u2f"
      v-model="transportChoice"
      type="radio"
      value="U2F"
    >
    <label for="u2f">U2F</label>
    <br>
    <!--
            Commands
        -->
    <button @click="getVersion">
      Get Version
    </button>
    <br>
    <button @click="getAddress">
      Get Address
    </button>
    <br>
    <button @click="showAddress">
      Show Address
    </button>
    <br>
    <button @click="signExampleTx">
      Sign Example TX
    </button>
    <!--
            Commands
        -->
    <ul id="ledger-status">
      <li
        v-for="item in ledgerStatus"
        :key="item.index"
      >
        {{ item.msg }}
      </li>
    </ul>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
// eslint-disable-next-line import/no-extraneous-dependencies
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import MatrixApp from '../../src';

export default {
    name: 'MatrixLedger',
    props: {},
    data() {
        return {
            deviceLog: [],
            transportChoice: 'WebUSB',
        };
    },
    computed: {
        ledgerStatus() {
            return this.deviceLog;
        },
    },
    methods: {
        log(msg) {
            this.deviceLog.push({
                index: this.deviceLog.length,
                msg,
            });
        },
        async getTransport() {
            let transport = null;

            this.log(`Trying to connect via ${this.transportChoice}...`);
            if (this.transportChoice === 'WebUSB') {
                try {
                    transport = await TransportWebUSB.create();
                } catch (e) {
                    this.log(e);
                    return;
                }
            }

            if (this.transportChoice === 'U2F') {
                try {
                    transport = await TransportU2F.create(10000);
                } catch (e) {
                    this.log(e);
                    return;
                }
            }

            return transport;
        },
        async getVersion() {
            this.deviceLog = [];

            // Given a transport (U2F/HIF/WebUSB) it is possible instantiate the app
            const transport = await this.getTransport();
            const app = new MatrixApp(transport);

            // now it is possible to access all commands in the app
            const response = await app.getVersion();
            if (response.return_code !== 0x9000) {
                this.log(`Error [${response.return_code}] ${response.error_message}`);
                return;
            }

            this.log('Response received!');
            this.log(
                `App Version ${response.major}.${response.minor}.${response.patch}`,
            );
            this.log(`Device Locked: ${response.device_locked}`);
            this.log(`Test mode: ${response.test_mode}`);
            this.log('Full response:');
            this.log(response);
        },
        async getAddress() {
            this.deviceLog = [];

            // Given a transport (U2F/HIF/WebUSB) it is possible instantiate the app
            const transport = await this.getTransport();
            const app = new MatrixApp(transport);

            // now it is possible to access all commands in the app
            const response = await app.getAddress(0, 0, 0, false);
            if (response.return_code !== 0x9000) {
                this.log(`Error [${response.return_code}] ${response.error_message}`);
                return;
            }

            this.log('Response received!');
            this.log('...');
            this.log(`PubKey ${response.pubKey}`);
            this.log(`Address: ${response.address}`);
            this.log('...');
            this.log('Full response:');
            this.log(response);
        },
        async showAddress() {
            this.deviceLog = [];

            // Given a transport (U2F/HIF/WebUSB) it is possible instantiate the app
            const transport = await this.getTransport();
            const app = new MatrixApp(transport);

            // now it is possible to access all commands in the app
            this.log('Please click in the device');
            const response = await app.getAddress(0, 0, 0, true);
            if (response.return_code !== 0x9000) {
                this.log(`Error [${response.return_code}] ${response.error_message}`);
                return;
            }

            this.log('Response received!');
            this.log('...');
            this.log(`PubKey ${response.pubKey}`);
            this.log(`Address: ${response.address}`);
            this.log('...');
            this.log('Full response:');
            this.log(response);
        },
        async signExampleTx() {
            this.deviceLog = [];

            // Given a transport (U2F/HIF/WebUSB) it is possible instantiate the app
            const transport = await this.getTransport();
            const app = new MatrixApp(transport);

            // now it is possible to access all commands in the app
            const txBlobStr = ''
                    + 'f8668710000000000045850430e2340083033450a04d414e2e576b62756a7478683759426e6b475638485'
                    + 'a767950514b336341507980a0746dd5858305e95c2ad24ac22658786012963590e683258ab1b0b073a131'
                    + 'adad038080808086016850894a0fc4c30480c0';

            const message = Buffer.from(txBlobStr, 'hex');
            const response = await app.sign(0, 0, 0, message);

            this.log('Response received!');
            this.log('...');
            this.log(`Signature: ${response.signature.toString('hex')}`);
            this.log('...');
            this.log('Full response:');
            this.log(response);
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }

    button {
        padding: 5px;
        font-weight: bold;
        font-size: medium;
    }

    ul {
        padding: 10px;
        text-align: left;
        alignment: left;
        list-style-type: none;
        background: black;
        font-weight: bold;
        color: greenyellow;
    }
</style>
