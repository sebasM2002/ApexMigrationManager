import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createMigration } from './createMigration';
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';

const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);

export async function detectChanges() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const dbPath = path.join(workspacePath, 'database');

    try {
        // Ensure we are in a git repository
        await git.cwd(workspacePath);

        // Fetch the status of the 'database' directory
        const status = await git.status();
        const changedFiles = status.modified.filter(file => file.startsWith('database/'));

        if (changedFiles.length === 0) {
            vscode.window.showInformationMessage('No changes detected in the database directory.' + status);
            return;
        }

        // Create a new migration for the detected changes
        createMigration();

        vscode.window.showInformationMessage(`Detected changes in ${changedFiles.length} files. Created new migration.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error detecting changes: ${error}`);
    }
}