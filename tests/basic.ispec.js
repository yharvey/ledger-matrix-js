import MatrixAIApp from 'index.js';
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

test('example integration test', async () => {
    const transport = await TransportNodeHid.create(1000);
    const app = new MatrixAIApp(transport);

    let version = await app.getVersion();
    console.log(version);
});
