import { calcEnergy } from './src/services/energy';

const testEvents = [
    { type: 'study', weight: 50, createdAt: new Date() }
];

console.log("Study energy:", calcEnergy(testEvents, 100));
