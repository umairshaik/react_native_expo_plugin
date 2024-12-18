import {
  addImports,
  appendContentsInsideDeclarationBlock,
} from "@expo/config-plugins/build/android/codeMod";
import {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  ConfigPlugin,
  withMainApplication,
} from "expo/config-plugins";

const withMyApiKey: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
  config = withInfoPlist(config, (config) => {
    config.modResults["MY_CUSTOM_API_KEY"] = apiKey;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      "MY_CUSTOM_API_KEY",
      apiKey
    );
    return config;
  });

  config = withMainApplication(config, (config) => {
    if (["java", "kt"].includes(config.modResults.language)) {
      try {
        config.modResults.contents = addImports(
          config.modResults.contents,
          [
            "com.adobe.marketing.mobile.AdobeCallback",
            "com.adobe.marketing.mobile.Extension",
            "com.adobe.marketing.mobile.LoggingMode",
            "com.adobe.marketing.mobile.MobileCore",
            "com.adobe.marketing.mobile.Lifecycle",
            "com.adobe.marketing.mobile.Signal",
            "com.adobe.marketing.mobile.Edge",
            "com.adobe.marketing.mobile.edge.consent.Consent",
            "android.util.Log",
            "java.util.ArrayList",
          ],
          config.modResults.language === "java"
        );
        const statementToInsert = `MobileCore.setApplication(this)
        MobileCore.setLogLevel(LoggingMode.VERBOSE)
        MobileCore.configureWithAppID("xxxxxx")
        val extensions: MutableList<Class<out Extension>> = mutableListOf()
        extensions.add(Lifecycle.EXTENSION)
        extensions.add(Signal.EXTENSION)
        extensions.add(Edge.EXTENSION)
        extensions.add(Consent.EXTENSION)
        extensions.add(com.adobe.marketing.mobile.edge.identity.Identity.EXTENSION)

        MobileCore.registerExtensions(extensions) {
          Log.d("AdobeExperienceSDK", "AEP Mobile SDK is initialized")
          MobileCore.lifecycleStart(null)
        }
        `;
        if (!config.modResults.contents.includes(statementToInsert)) {
          config.modResults.contents = appendContentsInsideDeclarationBlock(
            config.modResults.contents,
            "onCreate",
            statementToInsert
          );
        }
      } catch (error) {
        console.log("🚀 ~ config=withMainApplication ~ error:------>", error);
      }
    } else {
      console.log("🚀 ~ config=withMainApplication ~ error:------>");
    }
    return config;
  });

  return config;
};

export default withMyApiKey;
