import MatrixApp from 'index.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import polycrc from 'polycrc';
import bs58 from 'bs58';

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

test('get HD addresses, check CRC', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    const app = new MatrixApp(transport);

    for (let i = 0; i < 20; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const response = await app.getAddress(0, 0, i);
        console.log(response.address);

        const crc8 = polycrc.crc(8, 0x07, 0x00, 0x00, false);
        const crcByte = crc8(response.address.slice(0, -1));
        const crcChar = bs58.encode(Buffer.from([crcByte % 58]));

        expect(crcChar).toEqual(response.address.slice(-1));
    }
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
