import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as path from 'path';

let modifiedFiles: Set<string> = new Set();

export function watchDatabase() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const dbPath = path.join(workspacePath, 'database');

    // Configurar el observador de archivos
    const watcher = chokidar.watch(dbPath, { persistent: true });

    watcher.on('change', (filePath) => {
        modifiedFiles.add(filePath);
        vscode.window.showInformationMessage(`Detected changes in ${filePath}. Run the command to create migration.`);
    });

    watcher.on('error', error => {
        vscode.window.showErrorMessage(`Watcher error: ${error.message}`);
    });

    vscode.window.showInformationMessage('Watching for changes in the database directory.');
}

export function getModifiedFiles() {
    return Array.from(modifiedFiles);
}

export function clearModifiedFiles() {
    modifiedFiles.clear();
}
