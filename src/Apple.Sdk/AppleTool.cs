using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using DotNet.Mobile.Shared;

namespace Apple.Sdk {
    public static class AppleTool {
        public static List<DeviceData> PhysicalDevicesFast() {
            var profiler = PathUtils.SystemProfilerTool();
            var devices = new List<DeviceData>();
            var regex = new Regex(@"(iPhone:)[^,]*?Version:\s+(?<ver>\d+.\d+)[^,]*?Serial\sNumber:\s+(?<id>\S+)");

            ProcessResult result = new ProcessRunner(profiler, new ProcessArgumentBuilder()
                .Append("SPUSBDataType"))
                .WaitForExit();
            var output = string.Join(Environment.NewLine, result.StandardOutput);

            foreach (Match match in regex.Matches(output)) {
                var version = match.Groups["ver"].Value;
                var serial = match.Groups["id"].Value.Insert(8, "-");

                devices.Add(new DeviceData {
                    IsEmulator = false,
                    IsRunning = true,
                    Name = $"iPhone {version}",
                    Details = "iPhone",
                    Platform = Platform.iOS,
                    Serial = serial
                });
            }
            return devices;
        }

        public static List<DeviceData> SimulatorsFast() {
            var devices = new List<DeviceData>();
            var path = PathUtils.SimulatorsLocation();

            foreach (string directory in Directory.GetDirectories(path)) {
                var plist = Path.Combine(directory, "device.plist");

                if (!File.Exists(plist))
                    continue;

                var extractor = PropertyExtractor.FromFile(plist);

                if (extractor.ExtractBoolean("isDeleted"))
                    continue;

                var runtime = extractor.Extract("runtime");
                var osVersion = "Unknown";

                if (runtime?.Contains("SimRuntime.iOS") != true)
                    continue;

                var tokens = runtime.Split('.').Last().Split('-');

                if (tokens.Length > 1)
                    osVersion = $"{tokens[0]} {string.Join('.', tokens.Skip(1))}";

                devices.Add(new DeviceData {
                    IsEmulator = true,
                    IsRunning = extractor.Extract("state", "integer")?.Equals("3") == true,
                    Name = extractor.Extract("name") ?? "Unknown",
                    Details = "iPhoneSimulator",
                    Platform = Platform.iOS,
                    OSVersion = osVersion,
                    Serial = extractor.Extract("UDID")
                });
                extractor.Free();
            }

            return devices;
        }

        public static List<DeviceData> AllDevices() {
            var devices = new List<DeviceData>();
            devices.AddRange(PhysicalDevicesFast().OrderBy(x => x.Name));
            devices.AddRange(SimulatorsFast().OrderBy(x => x.Name));
            return devices;
        }
    }
}