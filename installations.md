# Installations Guideline

## Requirements

- Node.js & Npm 

### Install

Smartface installations  on windows platforms

install node.js & npm

- Node.js & Npm

get sources.

- ``git clone https://github.com/SmartfaceIO/node-smf-cli-build.git``

go folder in node-smf-cli-build. 

-  ``cd ${...}/node-smf-cli-build``

Now, ready for install.

##### using npm  without sudo
You can see solution
[fixing-npm-permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
 
#### Basic Install

- ``npm install``

#### Globally Install

- ``npm i -g --production``

#### only Linux ( Ubuntu )
 ApkTool completely works on 64bit machines , you will need to install these libs:
- ``sudo -i``
- ``cd /etc/apt/sources.list.d``
- ``echo "deb http://old-releases.ubuntu.com/ubuntu/ raring main restricted universe multiverse" >ia32-libs-raring.list``
- ``apt-get update``
- ``apt-get install ia32-libs``


You can start using

##### for Basic

- ``node bin/global-exec [params]``

You should be sure in folder node-smf-cli-build

##### for Globally

- ``smfc --help``

You can use in any directory.



