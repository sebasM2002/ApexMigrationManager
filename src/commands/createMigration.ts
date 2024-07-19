import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function createMigration() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const migrationsPath = path.join(workspacePath, 'migrations', 'install');
    const rollbackPath = path.join(workspacePath, 'migrations', 'rollback');
    const changelogPath = path.join(workspacePath, 'migrations', 'changelogs', 'changelog.xml');

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const installFileName = `install_${timestamp}.sql`;
    const rollbackFileName = `rollback_${timestamp}.sql`;

    fs.writeFileSync(path.join(migrationsPath, installFileName), '-- SQL install script');
    fs.writeFileSync(path.join(rollbackPath, rollbackFileName), '-- SQL rollback script');

    const changelogEntry = `
    <changeSet id="${timestamp}" author="vscode-extension">
        <sqlFile path="../install/${installFileName}" />
        <rollback>
            <sqlFile path="../rollback/${rollbackFileName}" />
        </rollback>
    </changeSet>
    `;

    fs.appendFileSync(changelogPath, changelogEntry);

    vscode.window.showInformationMessage(`Created migration ${installFileName} and ${rollbackFileName}`);
}