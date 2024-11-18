import { MonoDebugConfigurationProvider } from './providers/monoDebugConfigurationProvider';
import { DotNetTaskProvider } from './providers/dotnetTaskProvider';
import { ConfigurationController } from './controllers/configurationController';
import { StatusBarController } from './controllers/statusbarController';
import { Interop } from './interop/interop';
import { StateController } from './controllers/stateController';
import { PublicExports } from './publicExports';
import { ModulesView } from './features/modulesView';
import { MauiEssentials } from './features/mauiEssentials';
import { ExternalTypeResolver } from './features/externalTypeResolver';
import { RemoteHostProvider } from './features/removeHostProvider';
import * as res from './resources/constants';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext): PublicExports | undefined {
	Interop.initialize(context.extensionPath);

	if (vscode.workspace.workspaceFolders === undefined) 
		return undefined;

	const exports = new PublicExports();
	
	ConfigurationController.activate(context);
	StateController.activate(context);
	StatusBarController.activate(context);
	StatusBarController.update();

	ModulesView.feature.activate(context);
	MauiEssentials.feature.activate(context);
	ExternalTypeResolver.feature.activate(context);
	RemoteHostProvider.feature.activate(context);
	
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdSelectActiveProject, StatusBarController.showQuickPickProject));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdSelectActiveConfiguration, StatusBarController.showQuickPickConfiguration));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdSelectActiveDevice, StatusBarController.showQuickPickDevice));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdActiveTargetFramework, () => ConfigurationController.getTargetFramework()));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdActiveConfiguration, () => ConfigurationController.configuration));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdActiveProjectPath, () => ConfigurationController.project?.path));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdActiveDeviceName, () => ConfigurationController.device?.name));
	context.subscriptions.push(vscode.commands.registerCommand(res.commandIdActiveDeviceSerial, () => ConfigurationController.device?.serial));

	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(res.debuggerMeteorId, new MonoDebugConfigurationProvider()));
	context.subscriptions.push(vscode.tasks.registerTaskProvider(res.taskDefinitionId, new DotNetTaskProvider()));

	return exports;
}

export function deactivate() {
	StateController.deactivate();
}