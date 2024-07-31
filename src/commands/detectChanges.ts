import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { getLastSequence } from '../utils/sequenceUtils';
import { updateChangelog } from '../utils/changelogUtils';
export async function detectChanges() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const dbPath = path.join(workspacePath, 'database');

    exec(`git diff --name-only HEAD ${dbPath} && git ls-files --others --exclude-standard ${dbPath}`, { cwd: workspacePath }, async (err, stdout, stderr) => {
        if (err) {
            vscode.window.showErrorMessage(`Error executing git: ${stderr}`);
            return;
        }

        const modifiedFiles = stdout.split('\n').filter(file => file.trim() !== '');

        if (modifiedFiles.length === 0) {
            vscode.window.showInformationMessage('No changes detected in the database directory.');
            return;
        }

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
        const migrationsPath = path.join(workspacePath, 'migrations', 'install');
        const rollbackPath = path.join(workspacePath, 'migrations', 'rollback');
        const changelogPath = path.join(workspacePath, 'migrations', 'changelogs', 'changelog.xml');

        for (const filePath of modifiedFiles) {
            const installSequence = getLastSequence(migrationsPath, axosoftCaseNumber);
            const rollbackSequence = getLastSequence(rollbackPath, axosoftCaseNumber); 
            const fileContent = fs.readFileSync(path.join(workspacePath, filePath), 'utf8');
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const installFileName = `${axosoftCaseNumber}-${installSequence}-${timestamp}-${projectName}-INSTALL.sql`;
            const rollbackFileName = `${axosoftCaseNumber}-${rollbackSequence}-${timestamp}-${projectName}-ROLLBACK.sql`;

            // Crear el archivo de migración
            const installFilePath = path.join(migrationsPath, installFileName);
            const rollbackFilePath = path.join(rollbackPath, rollbackFileName);

            fs.writeFileSync(installFilePath, fileContent);
            fs.writeFileSync(rollbackFilePath, `-- Rollback for ${installFileName}`);
            updateChangelog(workspacePath, axosoftCaseNumber, installFileName, rollbackFileName);   
        }

        vscode.window.showInformationMessage('Created migrations and updated changelog.');
    });
}
