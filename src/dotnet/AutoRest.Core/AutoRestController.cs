﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System;
using AutoRest.Core.Model;
using AutoRest.Core.Extensibility;
using AutoRest.Core.Logging;
using AutoRest.Core.Properties;
using AutoRest.Core.Utilities;
using static AutoRest.Core.Utilities.DependencyInjection;

namespace AutoRest.Core
{
    /// <summary>
    /// Entry point for invoking code generation.
    /// </summary>
    public static class AutoRestController
    {
        /// <summary>
        /// Returns the version of this instance of AutoRest.
        /// </summary>
        public static string Version
        {
            get
            {
                return typeof(Settings).GetAssembly().GetName().Version.ToString();
            }
        }

        /// <summary>
        /// Generates client using provided settings.
        /// </summary>
        public static void Generate()
        {
            if (Settings.Instance == null)
            {
                throw new ArgumentNullException("settings");
            }
            Logger.Instance.Log(Category.Info, Resources.AutoRestCore, Version);
            
            CodeModel codeModel = null;
            
            var modeler = ExtensionsLoader.GetModeler();

            try
            {
                using (NewContext)
                {
                    bool validationErrorFound = false;
                    Logger.Instance.AddListener(new SignalingLogListener(Settings.Instance.ValidationLevel, _ => validationErrorFound = true));

                    // generate model from swagger 
                    codeModel = modeler.Build();

                    if (validationErrorFound)
                    {
                        Logger.Instance.Log(Category.Error, "Errors found during Swagger validation");
                    }
                }

            }
            catch (Exception exception)
            {
                throw ErrorManager.CreateError(Resources.ErrorGeneratingClientModel, exception);
            }

            if (Settings.Instance.JsonValidationMessages)
            {
                return; // no code gen in Json validation mode
            }
            
        }
    }
}
