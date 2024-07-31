import * as fs from 'fs';
import * as path from 'path';

// Crear y actualizar el archivo changelog específico para el número de caso
export function updateChangelog(workspacePath: string, axosoftCaseNumber: string, installFileName: string, rollbackFileName: string) {
    const migrationsDir = path.join(workspacePath, 'migrations');
    const changelogDir = path.join(migrationsDir, 'changelogs');
    const changelogFilePath = path.join(changelogDir, `changelog-${axosoftCaseNumber}.xml`);
    const changelogFilePathMain = path.join(changelogDir, 'changelog.xml');

    // Asegurarse de que el directorio exista
    if (!fs.existsSync(changelogDir)) {
        fs.mkdirSync(changelogDir, { recursive: true });
    }

    // Crear o actualizar el changelog específico para el caso de Axosoft
    let changelogContent = '';
    if (fs.existsSync(changelogFilePath)) {
        changelogContent = fs.readFileSync(changelogFilePath, 'utf8');
    } else {
        changelogContent = '<?xml version="1.0" encoding="UTF-8"?>\n<databaseChangeLog>\n</databaseChangeLog>';
    }

    // Obtener la secuencia del archivo de instalación o retroceso más reciente
    const sequence = getNextSequence(changelogContent, axosoftCaseNumber);
    
    // Crear un ID único basado en axosoftCaseNumber y la secuencia
    const changesetId = `OT-${axosoftCaseNumber}-${sequence}`;

    // Agregar el nuevo changeset al changelog con un tag
    const changesetEntry = `
<changeSet author="username" id="${changesetId}" file="${installFileName}">
    <sqlFile path="${installFileName}" />
    <rollback>
        <sqlFile path="${rollbackFileName}" />
    </rollback>
    <tagDatabase tag="OT-${axosoftCaseNumber}" />
</changeSet>
`;

    // Append changeset to the specific changelog
    changelogContent = changelogContent.replace('</databaseChangeLog>', `${changesetEntry}</databaseChangeLog>`);
    fs.writeFileSync(changelogFilePath, changelogContent, 'utf8');

    // Agregar una referencia de inclusión al changelog específico en el changelog principal
    if (fs.existsSync(changelogFilePathMain)) {
        let mainChangelogContent = fs.readFileSync(changelogFilePathMain, 'utf8');
        const includeEntry = `<include file="database/changelog-${axosoftCaseNumber}.xml" />\n`;
        if (!mainChangelogContent.includes(includeEntry)) {
            mainChangelogContent = mainChangelogContent.replace('</databaseChangeLog>', `${includeEntry}</databaseChangeLog>`);
            fs.writeFileSync(changelogFilePathMain, mainChangelogContent, 'utf8');
        }
    } else {
        // Crear changelog principal si no existe
        const mainChangelogContent = `<?xml version="1.0" encoding="UTF-8"?>\n<databaseChangeLog>\n<include file="database/changelog-${axosoftCaseNumber}.xml" />\n</databaseChangeLog>`;
        fs.writeFileSync(changelogFilePathMain, mainChangelogContent, 'utf8');
    }
}

// Función para obtener la siguiente secuencia basada en el contenido del changelog
function getNextSequence(changelogContent: string, axosoftCaseNumber: string): string {
    const regex = new RegExp(`<changeSet[^>]*id="OT-${axosoftCaseNumber}-(\\d{4})"`, 'g');
    let maxSequence = 0;
    let match;
    while ((match = regex.exec(changelogContent)) !== null) {
        const sequence = parseInt(match[1], 10);
        if (sequence > maxSequence) {
            maxSequence = sequence;
        }
    }
    const nextSequence = maxSequence + 1;
    return nextSequence.toString().padStart(4, '0');
}
