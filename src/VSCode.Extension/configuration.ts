import { Project, Device } from "./models"
import { Interface } from './interface';
import { DebuggerUtils } from "./bridge";
import * as vscode from 'vscode';


export enum Target {
    Debug = "Debug",
    Release = "Release"
}

export class Configuration {
    public static workspaceProjects: Project[] = [];
    public static mobileDevices: Device[] = [];

    public static selectedProject: Project | undefined;
    public static selectedDevice: Device | undefined;
    public static selectedTarget: Target | undefined;

    public static performSelectProject(item: Project) {
        Configuration.selectedProject = item;
        Interface.updateProjectsStatusItem();
    }
    public static performSelectTarget(target: Target) {
        Configuration.selectedTarget = target;
        Interface.updateTargetStatusItem();
    }
    public static performSelectDevice(item: Device) {
        Configuration.selectedDevice = item;
        Interface.updateDeviceStatusItem();
    }
    public static performSelectDefaults() {
        Configuration.performSelectProject(Configuration.workspaceProjects[0]);
        Configuration.performSelectTarget(Target.Debug);
        Configuration.performSelectDevice(Configuration.mobileDevices[0]);
    }

    public static fetchWorkspace() {
        const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
        Configuration.workspaceProjects = DebuggerUtils.findProjects(workspacePath);
    }
    public static fetchDevices() {
        const androidDevices = DebuggerUtils.androidDevices();
        const appleDevices = DebuggerUtils.appleDevices();
        Configuration.mobileDevices = androidDevices.concat(appleDevices);
    }
} 