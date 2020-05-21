# Client

## General structure

* components - purely api separated jsx renderers (dependent on containers for api logic)
* containers - components what have api interaction (and potentially a small amount of jsx logic)
* routes - only those components directly rendered by the main app router
* types - global types (mirroring expected server types)
* utils - functional ts files with no jsx

