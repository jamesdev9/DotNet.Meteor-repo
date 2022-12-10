import * as vscode from 'vscode';
import { Target, Project, ProjectItem, Device, DeviceItem, Icon } from "./models"
import { Configuration } from './configuration';
import { CommandLine } from "./bridge";
import { Command } from './constants';


export class Controller {
    public static projectStatusItem: vscode.StatusBarItem;
    public static targetStatusItem: vscode.StatusBarItem;
    public static deviceStatusItem: vscode.StatusBarItem;
    public static workspaceProjects: Project[];
    public static mobileDevices: Device[];

    
    public static activate() {
        this.projectStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.targetStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
        this.deviceStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 80);

        this.projectStatusItem.command = Command.selectProject;
        this.targetStatusItem.command = Command.selectTarget;
        this.deviceStatusItem.command = Command.selectDevice;
    }
    public static deactivate() {
        this.projectStatusItem.dispose();
        this.targetStatusItem.dispose();
        this.deviceStatusItem.dispose();
    }


    public static performSelectProject(item: Project) {
        Configuration.selectedProject = item;
        this.projectStatusItem.text = `${Icon.project} ${Configuration.selectedProject?.name}`;
        Controller.workspaceProjects.length === 1 ? this.projectStatusItem.hide() : this.projectStatusItem.show();
    }
    public static performSelectTarget(target: Target) {
        Configuration.selectedTarget = target;
        this.targetStatusItem.text = `${Icon.target} ${Configuration.selectedTarget} | Any CPU`;
        this.targetStatusItem.show();
    }
    public static performSelectDevice(item: Device) {
        Configuration.selectedDevice = item;
        this.deviceStatusItem.text = `${Icon.device} ${Configuration.selectedDevice?.name}`;
        this.deviceStatusItem.show();
    }


    public static async showQuickPickProject() {
        const selectedItem = await vscode.window.showQuickPick(
            Controller.workspaceProjects.map(project => new ProjectItem(project)), 
            { placeHolder: "Select active project" }
        );

        if (selectedItem !== undefined) 
        Controller.performSelectProject(selectedItem.item);
    }
    public static async showQuickPickTarget() {
        const selectedItem = await vscode.window.showQuickPick(
            [ Target.Debug, Target.Release ], 
            { placeHolder: "Select configuration" }
        );
        
        if (selectedItem !== undefined)
            Controller.performSelectTarget(selectedItem as Target);
    }
    public static async showQuickPickDevice() {
        const picker = vscode.window.createQuickPick();
        picker.placeholder = "Fetching devices...";
        picker.canSelectMany = false;
        picker.busy = true;
        picker.show();

        picker.onDidAccept(() => {
            if (picker.selectedItems !== undefined) {
                const selectedItem = (picker.selectedItems[0] as DeviceItem).item;
                Controller.performSelectDevice(selectedItem);
            }
            picker.hide();
        });

        CommandLine.mobileDevicesAsync(items => {
            Controller.mobileDevices = items;
            picker.items = items.map(device => new DeviceItem(device));
            picker.placeholder = "Select device";
            picker.busy = false;
        });
    }
}