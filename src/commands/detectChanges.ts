import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';

import { createMigration } from './createMigration';

export function detectChanges() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const dbPath = path.join(workspacePath, 'database');

    // Configurar el observador de archivos
    const watcher = chokidar.watch(dbPath, { persistent: true });

    watcher.on('change', async (filePath) => {
        vscode.window.showInformationMessage(`Detected changes in ${filePath}. Creating new migration.`);

        // Leer el contenido del archivo modificado
        let fileContent: string;
        try {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading file ${filePath}: ${error}`);
            return;
        }

        const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const migrationsPath = path.join(workspacePath, 'migrations', 'install');
        const rollbackPath = path.join(workspacePath, 'migrations', 'rollback');
        const changelogPath = path.join(workspacePath, 'migrations', 'changelogs', 'changelog.xml');

        // Solicitar información adicional al usuario
        const axosoftCaseNumber = await vscode.window.showInputBox({
            prompt: 'Enter the Axosoft case number',
            placeHolder: 'Axosoft Case Number'
        });

        if (!axosoftCaseNumber) {
            vscode.window.showErrorMessage('Axosoft case number is required.');
            return;
        }

        const employeeNumber = await vscode.window.showInputBox({
            prompt: 'Enter your employee number',
            placeHolder: 'Employee Number'
        });

        if (!employeeNumber) {
            vscode.window.showErrorMessage('Employee number is required.');
            return;
        }
        const projectFilePath = path.join(workspacePath, 'project.json');

        // Leer el archivo project.json
        let projectName = 'PROJECT';
        try {
            const projectData = fs.readFileSync(projectFilePath, 'utf8');
            const projectJson = JSON.parse(projectData);
            projectName = projectJson.code || 'PROJECT';
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading project.json: ${error}`);
        }

        const username = process.env['USERNAME'] || process.env['USER'] || 'unknown_user';

        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const sequence = '001';  // Esto debería generarse de manera adecuada, aquí está como ejemplo.
        const installFileName = `${axosoftCaseNumber}-${sequence}-${username}-${projectName}-INSTALL.sql`;
        const rollbackFileName = `${axosoftCaseNumber}-${sequence}-${username}-${projectName}-ROLLBACK.sql`;

        // Crear el archivo de migración
        const installFilePath = path.join(migrationsPath, installFileName);
        const rollbackFilePath = path.join(rollbackPath, rollbackFileName);

        fs.writeFileSync(installFilePath, fileContent);
        fs.writeFileSync(rollbackFilePath, `-- Rollback for ${installFileName}`);

        // Actualizar changelog de Liquibase
        const changelogEntry = `
        <changeSet id="${timestamp}" author="${username}">
            <sqlFile path="../install/${installFileName}" />
            <rollback>
                <sqlFile path="../rollback/${rollbackFileName}" />
            </rollback>
        </changeSet>
        `;

        fs.appendFileSync(changelogPath, changelogEntry);

        vscode.window.showInformationMessage(`Created migration ${installFileName} and ${rollbackFileName}`);
    });

    watcher.on('error', error => {
        vscode.window.showErrorMessage(`Watcher error: ${error.message}`);
    });

    vscode.window.showInformationMessage('Watching for changes in the database directory.');
}
