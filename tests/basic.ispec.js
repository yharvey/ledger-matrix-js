import MatrixApp from 'index.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

test('get version', async () => {
    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const version = await app.getVersion();
    console.log(version);
});

test('get address', async () => {
    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const response = await app.getAddress(0, 0, 0);

    expect(response.pubKey)
        .toEqual(
            '0491c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d7'
            + '585f3fdd3d697185b9cd78a5d571281d7d96225042aa4bf26fec7b32d130416e7',
        );

    expect(response.address)
        .toEqual('MAN.cUTaQZsmCAdpshzWnFiatff8QZHv');
});

test('show address', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const response = await app.getAddress(0, 0, 0, true);

    expect(response.pubKey)
        .toEqual(
            '0491c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d7'
            + '585f3fdd3d697185b9cd78a5d571281d7d96225042aa4bf26fec7b32d130416e7',
        );

    expect(response.address)
        .toEqual('MAN.cUTaQZsmCAdpshzWnFiatff8QZHv');
});

// TODO: Sign+Verify
