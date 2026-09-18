allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// `rootProject.buildDir` was removed in Gradle 9. This is the same
// out-of-tree build directory the Groovy version set, through the API that
// still exists.
val newBuildDir: Directory = rootProject.layout.buildDirectory.dir("../../build").get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
