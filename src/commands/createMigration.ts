import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { getLastSequence } from '../utils/sequenceUtils';
import { updateChangelog } from '../utils/changelogUtils';

export async function createMigration() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;

    // Solicitar información adicional al usuario
    const axosoftCaseNumber = await vscode.window.showInputBox({
        prompt: 'Enter the Axosoft case number',
        placeHolder: 'Axosoft Case Number'
    });

    if (!axosoftCaseNumber) {
        vscode.window.showErrorMessage('Axosoft case number is required.');
        return;
    }

    const username = process.env['USERNAME'] || process.env['USER'] || os.userInfo().username;

    // Leer el archivo project.json
    const projectFilePath = path.join(workspacePath, 'project.json');
    let projectName = 'PROJECT';
    try {
        const projectData = fs.readFileSync(projectFilePath, 'utf8');
        const projectJson = JSON.parse(projectData);
        projectName = projectJson.code || 'PROJECT';
    } catch (error) {
        vscode.window.showErrorMessage(`Error reading project.json: ${error}`);
    }
    //Confirmacion de los datos
    const confirm = await vscode.window.showInformationMessage(
        `Please confirm the details:\n\nAxosoft Case Number: ${axosoftCaseNumber}\nEmployee Number: ${username}\nProject: ${projectName}`,
    { modal: true },
        'Confirm'
    );

    if (confirm !== 'Confirm') {
        vscode.window.showInformationMessage('Migration creation cancelled');
        return;
    }

    const installMigrationsPath = path.join(workspacePath, 'migrations', 'install');
    const rollbackMigrationsPath = path.join(workspacePath, 'migrations', 'rollback');

    const installSequence = getLastSequence(installMigrationsPath, axosoftCaseNumber);
    const rollbackSequence = getLastSequence(rollbackMigrationsPath, axosoftCaseNumber);

    // Crear archivo de migración en blanco
    const installFileName = `${axosoftCaseNumber}-${installSequence}-${username}-${projectName}-INSTALL.sql`;
    const rollbackFileName = `${axosoftCaseNumber}-${rollbackSequence}-${username}-${projectName}-ROLLBACK.sql`;

    const installFilePath = path.join(installMigrationsPath, installFileName);
    const rollbackFilePath = path.join(rollbackMigrationsPath, rollbackFileName);

    fs.writeFileSync(installFilePath, `-- New migration script for ${installFileName}\n`);
    fs.writeFileSync(rollbackFilePath, `-- Rollback script for ${installFileName}\n`);

    updateChangelog(workspacePath,axosoftCaseNumber, installFileName, rollbackFileName);  

    vscode.window.showInformationMessage(`Created new migration scripts:\n- ${installFileName}\n- ${rollbackFileName}`);
}
