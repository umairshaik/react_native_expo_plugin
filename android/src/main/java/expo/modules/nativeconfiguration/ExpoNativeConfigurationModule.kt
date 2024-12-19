package expo.modules.nativeconfiguration

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNativeConfigurationModule() : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeConfiguration")

    Function("getApiKey") {
      val applicationInfo =
              appContext?.reactContext?.packageManager?.getApplicationInfo(
                      appContext?.reactContext?.packageName.toString(),
                      PackageManager.GET_META_DATA
              )

      return@Function applicationInfo?.metaData?.getString("MY_CUSTOM_API_KEY")
    }
  }
}
