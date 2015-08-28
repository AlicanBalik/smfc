# Smartface CLI Tool

This [Node.js](https://nodejs.org/) project handles the publishing process of the Smartface Framework.

Other features will be integrated in the future, such as emulator, drag&drop interface integration and possibly more.

[![NPM](https://nodei.co/npm/smartface.png)](https://nodei.co/npm/smartface/)

# Requirements

- Node.js & Npm 

Node version must be greater than or equal to<b>0.12</b>.
[Click to install node.js](https://nodejs.org/download)

-  git

If you want download sample projects, you must [install git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

-  ia32-libs

You must install these libs to run ApkTool completely on 64bit <b>Linux</b> machines.
solution for Ubuntu machines:
 ```
 sudo -i
 cd /etc/apt/sources.list.d
 echo "deb http://old-releases.ubuntu.com/ubuntu/ raring main restricted universe multiverse" >ia32-libs-raring.list
 apt-get update
 apt-get install ia32-libs
 ```

# Install
    npm install smartface -g --production
    
If you want install from sources, you can check [installations.md](https://github.com/SmartfaceIO/smfc/blob/master/installations.md)

# Usage
You can see more informations to use.

    smfc -h

You can use on interactive mode

    smfc -i
    
### Basic parameters
If you want to publish, you must pass these arguments
- <b>task</b>
  Task that will be run. Supported tasks: 'android-full-publish', 'ios-full-publish'

###### Example task
    --task=$(TASK) , --task=android-full-publish
    
- <b>projectRoot</b>
  Your project root folder. You can also use relative paths.

###### Example projectRoot
    --projectRoot=$(PROJECT_ROOT) , --projectRoot=../smfc-sample
    
### Optional parameters
You can use optional parameters.
- <b>licenseFile</b>
   Your license file path

###### Example licenseFile
    --licenseFile=$(LICENSE) , --licenseFile=/home/Smartface/license.xml
  
- <b>java</b>
   Java 1.7 wil be needed for the apk file operations. If you do not set this parameter, the tool will try to find Java 1.7, and use that version if it can find one.

###### Example java
    --java=$(JAVA) , --java=/usr/bin/java
  
- <b>inputApk</b>
   Smartface Player apk for ARM. You can set one of the arm-players of Smartface.

###### Example inputApk  
    --inputApk=$(INPUT_APK) , --inputApk=/home/Smartface/SmartfacePlayer.apk
 
 - <b>inputApkx86</b>
   Smartface Player apk for x86. You can set one of the x86-players of Smartface.

###### Example inputApkx86 
    --inputApkx86=$(INPUT_APK_x86) , --inputApkx86=/home/Smartface/SmartfacePlayer-x86.apk
 
 - <b>inputZip</b>
   Smartface Player zip file for iOS. You can set one of the iOS-players of Smartface.

###### Example inputZip 
    --inputZip=$(INPUT_ZIP) , --inputZip=/home/Smartface/SmartfacePlayer.zip

- <b>profile</b>
   ARM or x86 profiles that will be published. </br>
   \* that means all profiles

###### Example profile
    --profile=$(PROFILE) , --profile=arm:Default,hdpi;x86:*
     
- <b>maxJavaMemory</b>
  Java to be used max memory while running.

###### Example maxJavaMemory
    --maxJavaMemory=$(MAX_JAVA_MEM) , --maxJavaMemory=512m
       
- <b>logLevel</b>
  level of log

###### Example logLevel 
    --logLevel=$(LOG_LEVEL) , --logLevel=debug
         
- <b>logFile</b>
  You can logging to specific file. You can also use relative paths.

###### Example logFile
    --logFile=$(LOG_FILE) , --logFile=../smfc-sample/log/some.log
  
- <b>logStdOut</b>
  You can logging on console. </br>
  If logLevel not to be set. you can not log on console. Because logLevel is off.

###### Example logStdOut
    --logStdOut=$(LOG_STDOUT) , --logStdOut=true

## Example Usage

#### iOS Publish

    smfc --task=ios-full-publish --projectRoot=../smfc-sample


    smfc --task=ios-full-publish --projectRoot=../smfc-sample  --logLevel=debug --logFile=../smfc-sample/log/ios.log 

#### Android Publish

    smfc --task=android-full-publish --projectRoot=../smfc-sample 


    smfc --task=android-full-publish --projectRoot=../smfc-sample  --logLevel=debug --logFile=../smfc-sample/log/android.log --maxJavaMemory=512m --profile="arm:Default;x86:hdpi"
