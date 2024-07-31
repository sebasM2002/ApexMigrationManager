import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function updateChangelog(workspacePath: string, axosoftCaseNumber: string, installFileName: string, rollbackFileName: string) {
    const changelogFilePath = path.join(workspacePath, 'database', 'changelog.xml');

    if (fs.existsSync(changelogFilePath)) {
        let changelogContent = fs.readFileSync(changelogFilePath, 'utf8');

        const installPath = `path/to/migrations/install/${installFileName}`;
        const rollbackPath = `path/to/migrations/rollback/${rollbackFileName}`;

        // Create a unique ID based on axosoftCaseNumber and file name
        const changesetId = `OT-${axosoftCaseNumber}-${installFileName.replace('.sql', '')}`;

        // Add new changeset to changelog
        const changesetEntry = `
<changeSet author="username" id="${installFileName.replace('.sql', '')}" file="${installPath}">
    <sqlFile path="${installPath}" />
    <rollback>
        <sqlFile path="${rollbackPath}" />
    </rollback>
</changeSet>
`;

        changelogContent = changelogContent.replace('</databaseChangeLog>', `${changesetEntry}</databaseChangeLog>`);
        fs.writeFileSync(changelogFilePath, changelogContent, 'utf8');
    } else {
        vscode.window.showErrorMessage('Changelog file not found.');
    }
}
