// Node.js Server Beispiel
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 443 });

const worldInstances = new Map();

wss.on('connection', (ws) => {
    const player = {
        id: generateId(),
        position: {x: 0, y: 0},
        world: 'forest'
    };

    // Weltinstanz verwalten
    if(!worldInstances.has(player.world)) {
        worldInstances.set(player.world, {
            players: new Map(),
            enemies: []
        });
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'movement':
                updatePlayerPosition(player, data);
                broadcastWorldState(player.world);
                break;
            case 'combat':
                resolveCombat(data);
                break;
        }
    });

    ws.on('close', () => {
        worldInstances.get(player.world).players.delete(player.id);
    });
});

function broadcastWorldState(worldId) {
    const world = worldInstances.get(worldId);
    const players = Array.from(world.players.values());
    
    players.forEach(player => {
        player.ws.send(JSON.stringify({
            type: 'worldState',
            players: players,
            enemies: world.enemies
        }));
    });
}
