import * as vscode from 'vscode';
import { createMigration } from './commands/createMigration';
import { watchDatabase } from './commands/watchDatabase';
import { createMigrationFromChanges } from './commands/createMigrationFromChanges';
import { detectChanges } from './commands/detectChanges';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "my-liquibase-extension" is now active!');

    let createMigrationCommand = vscode.commands.registerCommand('apexmigrationmanager.createMigration', () => {
        createMigration();
    });

    let watchDatabaseCommand = vscode.commands.registerCommand('apexmigrationmanager.watchDatabase', () => {
        watchDatabase();
    });

    let createMigrationFromChangesCommand = vscode.commands.registerCommand('apexmigrationmanager.createMigrationFromChanges', () => {
        createMigrationFromChanges();
    });

    let detectChangesCommand = vscode.commands.registerCommand('apexmigrationmanager.detectChanges', () => {
        detectChanges();
    });

    context.subscriptions.push(createMigrationCommand);
    context.subscriptions.push(watchDatabaseCommand);
    context.subscriptions.push(createMigrationFromChangesCommand);
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

    let statusBarItemWatch = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItemWatch.command = 'apexmigrationmanager.watchDatabase';
    statusBarItemWatch.text = '$(search) Watch Changes';
    statusBarItemWatch.tooltip = 'Watch for Database Changes';
    statusBarItemWatch.show();
    context.subscriptions.push(statusBarItemWatch);

    let statusBarItemCreateChange = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItemCreateChange.command = 'apexmigrationmanager.createMigrationFromChanges';
    statusBarItemCreateChange.text = '$(search) Create from Changes';
    statusBarItemCreateChange.tooltip = 'Create Migration from Detected Changes';
    statusBarItemCreateChange.show();
    context.subscriptions.push(statusBarItemCreateChange);
}


export function deactivate() {}
