import * as fs from 'fs';
import * as path from 'path';

export function getLastSequence(directory: string, axosoftCaseNumber: string): string {
    const files = fs.readdirSync(directory);

    const regex = new RegExp(`^${axosoftCaseNumber}-(\\d{4})-.*\\.(sql|sql)$`);
    let highestSequence = 0;

    files.forEach(file => {
        const match = file.match(regex);
        if (match) {
            const sequence = parseInt(match[1], 10);
            if (sequence > highestSequence) {
                highestSequence = sequence;
            }
        }
    });

    const newSequence = (highestSequence + 1).toString().padStart(4, '0');
    return newSequence;
}
