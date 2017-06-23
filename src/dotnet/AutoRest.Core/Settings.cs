﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using AutoRest.Core.Logging;
using AutoRest.Core.Properties;
using AutoRest.Core.Utilities;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static AutoRest.Core.Utilities.DependencyInjection;

namespace AutoRest.Core
{
    public interface IHost
    {
        Task<string> ReadFile(string filename);
        Task<T> GetValue<T>(string key);
        Task<string> GetValue(string key);
        Task<string[]> ListInputs();
    }

    public class NullHost : IHost
    {
        public Task<string> ReadFile(string filename) => string.Empty.AsResultTask();
        public Task<T> GetValue<T>(string key) => (default(T)).AsResultTask();
        public Task<string> GetValue(string key) => string.Empty.AsResultTask();
        public Task<string[]> ListInputs() => (new string[0]).AsResultTask();
    }
    public class Settings : IsSingleton<Settings>
    {
        public const string DefaultCodeGenerationHeader = @"Code generated by Microsoft (R) AutoRest Code Generator {0}
Changes may cause incorrect behavior and will be lost if the code is regenerated.";

        public const string DefaultCodeGenerationHeaderWithoutVersion = @"Code generated by Microsoft (R) AutoRest Code Generator.
Changes may cause incorrect behavior and will be lost if the code is regenerated.";

        public const string MicrosoftApacheLicenseHeader = @"Copyright (c) Microsoft and contributors.  All rights reserved.

Licensed under the Apache License, Version 2.0 (the ""License"");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an ""AS IS"" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
";

        public const string MicrosoftMitLicenseHeader = @"Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License. See License.txt in the project root for license information.
";

        public IHost Host = new NullHost();
        private string _header;

        public static string AutoRestFolder { get; set; }

        public Settings()
        {
            if (!Context.IsActive)
            {
                throw new Exception("A context must be active before creating settings.");
            }
            if (Singleton<Settings>.HasInstanceInCurrentActivation)
            {
                throw new Exception("The current context already has settings. (Did you mean to create a nested context?)");
            }

            // this instance of the settings object should be used for subsequent 
            // requests for settings.
            Singleton<Settings>.Instance = this;
        }

        /// <summary>
        /// Gets or sets the IFileSystem used by code generation.
        /// </summary>
        public IFileSystem FileSystemInput { get; set; }

        /// <summary>
        /// Gets the Uri for the path to the folder that contains the input specification file.
        /// </summary>
        public MemoryFileSystem FileSystemOutput { get; set; }

        /// <summary>
        /// Custom provider specific settings.
        /// </summary>
        public IDictionary<string, object> CustomSettings { get; private set; }

        // The CommandLineInfo attribute is reflected to display help.
        // Prefer to show required properties before optional.
        // Although not guaranteed by the Framework, the iteration order matches the
        // order of definition.

        #region ordered_properties

        /// <summary>
        /// Gets or sets the path to the input specification file.
        /// </summary>
        [SettingsInfo("The location of the input specification.", true)]
        [SettingsAlias("i")]
        [SettingsAlias("input")]
        public string Input { get; set; }

        /// <summary>
        /// Gets of sets the path to a previous version of the input specification file. This will cause
        /// Autorest to compare the two versions rather than generate code.
        /// </summary>
        public string Previous { get; set; }

        /// <summary>
        /// Gets or sets a name for the generated client models Namespace and Models output folder
        /// </summary>
        [SettingsInfo("Name to use for the generated client models namespace and folder name. Not supported by all code generators.")]
        [SettingsAlias("mname")]
        public string ModelsName { get; set; }

        /// <summary>
        /// Gets or sets a base namespace for generated code.
        /// </summary>
        [SettingsInfo("The namespace to use for generated code.")]
        [SettingsAlias("n")]
        public string Namespace { get; set; }

        /// <summary>
        /// Gets or sets the output directory for generated files. If not specified, uses 'Generated' as the default.
        /// </summary>
        [SettingsInfo("The location for generated files. If not specified, uses \"Generated\" as the default.")]
        [SettingsAlias("o")]
        [SettingsAlias("output")]
        public string OutputDirectory { get; set; }

        /// <summary>
        /// Gets or sets the code generation language.
        /// </summary>
        [SettingsInfo("The code generator language. If not specified, defaults to CSharp.")]
        [SettingsAlias("g")]
        public string CodeGenerator { get; set; }

        /// <summary>
        /// Gets or sets the modeler to use for processing the input specification.
        /// </summary>
        [SettingsInfo("The Modeler to use on the input. If not specified, defaults to Swagger.")]
        [SettingsAlias("m")]
        public string Modeler { get; set; }

        #endregion

        /// <summary>
        /// Gets or sets a name of the generated client type. If not specified, will use
        /// a value from the specification. For Swagger specifications,
        /// the value of the 'Title' field is used.
        /// </summary>
        [SettingsInfo("Name to use for the generated client type. By default, uses " +
                      "the value of the 'Title' field from the Swagger input.")]
        [SettingsAlias("name")]
        public string ClientName { get; set; }

        [SettingsInfo("Disables post-codegeneration simplifier")]
        public bool DisableSimplifier { get; set; }

        /// <summary>
        /// Gets or sets the maximum number of properties in the request body.
        /// If the number of properties in the request body is less than or
        /// equal to this value, then these properties will be represented as method arguments.
        /// </summary>
        [SettingsInfo("The maximum number of properties in the request body. " +
                      "If the number of properties in the request body is less " +
                      "than or equal to this value, these properties will " +
                      "be represented as method arguments.")]
        [SettingsAlias("ft")]
        public int PayloadFlatteningThreshold { get; set; }

        /// <summary>
        /// Gets or sets the code generation mode (Server or Client)
        /// If the CodeGenerationMode is Server, AutoRest generates the server code for given spec
        /// else generates (by default) the client code for spec
        /// </summary>
        [SettingsInfo("The code generation mode. " +
                      "Possible values: rest, rest-client, rest-server. " +
                      "Determines whether AutoRest generates " +
                      "the client or server side code for given spec.")]
        public string CodeGenerationMode { get; set; }

        /// <summary>
        /// Gets or sets a comment header to include in each generated file.
        /// </summary>
        [SettingsInfo("Text to include as a header comment in generated files. " +
                      "Use NONE to suppress the default header.")]
        [SettingsAlias("header")]
        public string Header
        {
            get { return _header; }
            set
            {
                if (value == "MICROSOFT_MIT")
                {
                    _header = MicrosoftMitLicenseHeader + Environment.NewLine + string.Format(CultureInfo.InvariantCulture, DefaultCodeGenerationHeader, AutoRestController.Version);
                }
                else if (value == "MICROSOFT_APACHE")
                {
                    _header = MicrosoftApacheLicenseHeader + Environment.NewLine + string.Format(CultureInfo.InvariantCulture, DefaultCodeGenerationHeader, AutoRestController.Version);
                }
                else if (value == "MICROSOFT_MIT_NO_VERSION")
                {
                    _header = MicrosoftMitLicenseHeader + Environment.NewLine + DefaultCodeGenerationHeaderWithoutVersion;
                }
                else if (value == "MICROSOFT_APACHE_NO_VERSION")
                {
                    _header = MicrosoftApacheLicenseHeader + Environment.NewLine + DefaultCodeGenerationHeaderWithoutVersion;
                }
                else if (value == "MICROSOFT_MIT_NO_CODEGEN")
                {
                    _header = MicrosoftMitLicenseHeader + Environment.NewLine + "Code generated by Microsoft (R) AutoRest Code Generator.";
                }
                else if (value == "NONE")
                {
                    _header = String.Empty;
                }
                else
                {
                    _header = value;
                }
            }
        }

        /// <summary>
        /// If set to true, generate client with a ServiceClientCredentials property and optional constructor parameter.
        /// </summary>
        [SettingsInfo(
            "If true, the generated client includes a ServiceClientCredentials property and constructor parameter. " +
            "Authentication behaviors are implemented by extending the ServiceClientCredentials type.")]
        public bool AddCredentials { get; set; }

        /// <summary>
        /// If set, will cause generated code to be output to a single file. Not supported by all code generators.
        /// </summary>
        [SettingsInfo(
            "If set, will cause generated code to be output to a single file. Not supported by all code generators.")]
        public string OutputFileName { get; set; }

        /// <summary>
        /// If set to true, print out help message.
        /// </summary>
        [SettingsAlias("?")]
        [SettingsAlias("h")]
        [SettingsAlias("help")]
        public bool ShowHelp { get; set; }

        /// <summary>
        /// If set to true, collect and print out more detailed messages.
        /// </summary>
        [SettingsAlias("verbose")]
        public bool Verbose { get; set; }

        /// <summary>
        /// If set to true, collect and print out validation messages as single JSON blob.
        /// </summary>
        [SettingsAlias("JsonValidationMessages")]
        public bool JsonValidationMessages { get; set; }

        /// <summary>
        /// If set to true, print out debug messages.
        /// </summary>
        [SettingsAlias("debug")]
        public bool Debug { get; set; }

        /// <summary>
        /// PackageName of then generated code package. Should be then names wanted for the package in then package manager.
        /// </summary>
        [SettingsAlias("pn")]
        [SettingsInfo("Package name of then generated code package. Should be then names wanted for the package in then package manager.")]
        public string PackageName { get; set; }

        /// <summary>
        /// PackageName of then generated code package. Should be then names wanted for the package in then package manager.
        /// </summary>
        [SettingsAlias("pv")]
        [SettingsInfo("Package version of then generated code package. Should be then version wanted for the package in then package manager.")]
        public string PackageVersion { get; set; }

        [SettingsAlias("cgs")]
        [SettingsInfo("The path for a json file containing code generation settings.")]
        public string CodeGenSettings { get; set; }

        /// <summary>
        /// The input validation severity level that will prevent code generation
        /// </summary>
        [SettingsAlias("vl")]
        [SettingsAlias("validation")]
        [SettingsInfo("The input validation severity level that will prevent code generation")]
        public Category ValidationLevel { get; set; }

        /// <summary>
        /// If set, preprocesses a swagger file by expanding and resolving some advanced convenience syntax.
        /// </summary>
        [SettingsAlias("preprocessor")]
        public bool Preprocessor { get; set; }

        private static Dictionary<string, object> ParseArgs(string[] arguments)
        {
            var argsDictionary = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            if (arguments != null && arguments.Length > 0)
            {
                string key = null;
                string value = null;
                for (int i = 0; i < arguments.Length; i++)
                {
                    string argument = arguments[i] ?? String.Empty;
                    argument = argument.Trim();

                    if (argument.StartsWith("-", StringComparison.OrdinalIgnoreCase))
                    {
                        if (key != null)
                        {
                            AddArgumentToDictionary(key, value, argsDictionary);
                            value = null;
                        }
                        key = argument.TrimStart('-');
                    }
                    else
                    {
                        value = argument;
                    }
                }
                if (key != null)
                {
                    AddArgumentToDictionary(key, value, argsDictionary);
                }
            }
            return argsDictionary;
        }

        /// <summary>
        /// Factory method to generate Settings from command line arguments.
        /// Matches dictionary keys to the settings properties.
        /// </summary>
        /// <param name="arguments">Command line arguments</param>
        /// <returns>Settings</returns>
        public static Settings Create(string[] arguments)
        {
            var argsDictionary = ParseArgs(arguments);
            if (argsDictionary.Count == 0)
            {
                argsDictionary["?"] = String.Empty;
            }

            return Create(argsDictionary);
        }

        private static void AddArgumentToDictionary(string key, string value, IDictionary<string, object> argsDictionary)
        {
            value = value ?? String.Empty;
            argsDictionary[key] = value;
        }

        /// <summary>
        /// Factory method to generate Settings from a dictionary. Matches dictionary
        /// keys to the settings properties.
        /// </summary>
        /// <param name="settings">Dictionary of settings</param>
        /// <returns>Settings</returns>
        public static Settings Create(IDictionary<string, object> settings)
        {
            var autoRestSettings = new Settings();
            if (settings == null || settings.Count == 0)
            {
                autoRestSettings.ShowHelp = true;
            }

            PopulateSettings(autoRestSettings, settings);

            autoRestSettings.CustomSettings = settings;
            if (!string.IsNullOrEmpty(autoRestSettings.CodeGenSettings))
            {
                var settingsContent = autoRestSettings.FileSystemInput.ReadAllText(autoRestSettings.CodeGenSettings);
                var codeGenSettingsDictionary =
                    JsonConvert.DeserializeObject<Dictionary<string, object>>(settingsContent);
                foreach (var pair in codeGenSettingsDictionary)
                {
                    autoRestSettings.CustomSettings[pair.Key] = pair.Value;
                }
            }

            return autoRestSettings;
        }

        /// <summary>
        /// Sets object properties from the dictionary matching keys to property names or aliases.
        /// </summary>
        /// <param name="entityToPopulate">Object to populate from dictionary.</param>
        /// <param name="settings">Dictionary of settings.Settings that are populated get removed from the dictionary.</param>
        /// <returns>Dictionary of settings that were not matched.</returns>
        public static void PopulateSettings(object entityToPopulate, IDictionary<string, object> settings)
        {
            if (entityToPopulate == null)
            {
                throw new ArgumentNullException("entityToPopulate");
            }

            if (settings != null && settings.Count > 0)
            {
                // Setting property value from dictionary
                foreach (var setting in settings.ToArray())
                {
                    PropertyInfo property = entityToPopulate.GetType().GetProperties()
                        .FirstOrDefault(p => setting.Key.EqualsIgnoreCase(p.Name) ||
                                             p.GetCustomAttributes<SettingsAliasAttribute>()
                                                .Any(a => setting.Key.EqualsIgnoreCase(a.Alias)));

                    if (property != null)
                    {
                        try
                        {
                            if (property.PropertyType == typeof(bool) && (setting.Value == null || setting.Value.ToString().IsNullOrEmpty()))
                            {
                                property.SetValue(entityToPopulate, true);
                            }
                            else if (property.PropertyType.IsEnum())
                            {
                                property.SetValue(entityToPopulate, Enum.Parse(property.PropertyType, setting.Value.ToString(), true));
                            }
                            else if (property.PropertyType.IsArray && setting.Value.GetType() == typeof(JArray))
                            {
                                var elementType = property.PropertyType.GetElementType();
                                if (elementType == typeof(string))
                                {
                                    var stringArray = ((JArray)setting.Value).Children().
                                    Select(
                                        c => c.ToString())
                                    .ToArray();

                                    property.SetValue(entityToPopulate, stringArray);
                                }
                                else if (elementType == typeof(int))
                                {
                                    var intValues = ((JArray)setting.Value).Children().
                                         Select(c => (int)Convert.ChangeType(c, elementType, CultureInfo.InvariantCulture))
                                         .ToArray();
                                    property.SetValue(entityToPopulate, intValues);
                                }
                            }
                            else if (property.CanWrite)
                            {
                                property.SetValue(entityToPopulate,
                                    Convert.ChangeType(setting.Value, property.PropertyType, CultureInfo.InvariantCulture), null);
                            }

                            settings.Remove(setting.Key);
                        }
                        catch (Exception exception)
                        {
                            throw new ArgumentException(String.Format(CultureInfo.InvariantCulture, Resources.ParameterValueIsNotValid,
                                setting.Key, property.GetType().Name), exception);
                        }
                    }
                }
            }
        }

        public void Validate()
        {
            foreach (PropertyInfo property in (typeof(Settings)).GetProperties())
            {
                // If property value is not set - throw exception.
                var doc = property.GetCustomAttributes<SettingsInfoAttribute>().FirstOrDefault();
                if (doc != null && doc.IsRequired && property.GetValue(this) == null)
                {
                    Logger.Instance.Log(Category.Error, Resources.ParameterValueIsMissing, property.Name);
                    throw new CodeGenerationException(string.Format(Resources.ParameterValueIsMissing, property.Name));
                }
            }
        }
    }
}
