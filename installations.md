# Installations Guideline

## Requirements

- Node.js & Npm 

Node version must be greater than or equal to <b>0.12</b>.

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

### Install

install [node.js](https://nodejs.org/download)

- Node.js & Npm

get sources.

- ``git clone https://github.com/SmartfaceIO/smfc.git``

go folder in smfc. 

-  ``cd smfc``

Now, ready for install.

##### using npm  without sudo
You can see solution
[fixing-npm-permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
 
#### Install

- ``npm i -g --production``

You can start using

##### Usage

- ``smfc --help``

You can see more informations of [usage](https://github.com/SmartfaceIO/smfc/raw/master/Smartface-cli-tool-Usage.pdf).



