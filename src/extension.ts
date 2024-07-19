import * as vscode from 'vscode';
import { createMigration } from './commands/createMigration';
import { detectChanges } from './commands/detectChanges';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "my-liquibase-extension" is now active!');

    let createMigrationCommand = vscode.commands.registerCommand('apexmigrationmanager.createMigration', () => {
        createMigration();
    });

    let detectChangesCommand = vscode.commands.registerCommand('apexmigrationmanager.detectChanges', () => {
        detectChanges();
    });

    context.subscriptions.push(createMigrationCommand);
    context.subscriptions.push(detectChangesCommand);

    // Create a new status bar item that we can manage
    let statusBarItemCreate = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItemCreate.command = 'apexmigrationmanager.createMigration';
    statusBarItemCreate.text = '$(plus) Create Migration';
    statusBarItemCreate.tooltip = 'Create Liquibase Migration';
    statusBarItemCreate.show();
    context.subscriptions.push(statusBarItemCreate);

    let statusBarItemDetect = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItemDetect.command = 'apexmigrationmanager.detectChanges';
    statusBarItemDetect.text = '$(search) Detect Changes';
    statusBarItemDetect.tooltip = 'Detect Changes and Create Migration';
    statusBarItemDetect.show();
    context.subscriptions.push(statusBarItemDetect);
}

export function deactivate() {}
