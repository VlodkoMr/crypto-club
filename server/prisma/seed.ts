const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rooms = [{
        symbol: 'xrp',
        title: 'Ripple',
        price_pct: 0
    }, {
        symbol: 'btc',
        title: 'Bitcoin',
        price_pct: 0
    }, {
        symbol: 'eth',
        title: 'Ethereum',
        price_pct: 0
    }, {
        symbol: 'doge',
        title: 'Dogecoin',
        price_pct: 0
    }];

    await prisma.rooms.createMany({
        data: rooms
    });
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })