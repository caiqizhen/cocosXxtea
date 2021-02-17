# cocosXxtea
encrypt and decrypt with xxtea

* 这里的加解密目前只适合没有使用压缩的情况，使用了压缩需要使用zlib解压缩，但是解压缩的时候会奔溃，目前分析的原因是zlib库的版本和cocos的版本不同

### 编译zlib库

* 去https://zlib.net/ 下载zlib库源码

* 解压源码到指定位置

* 打开VS2015的Developer Command Prompt for VS2015工具（开发人员命令提示）

* 切换到 x:\zlib\contrib\masmx86目录，如果想编译x64的，可以进入masmx64目录，我这里只使用32位

* 执行bld_ml32.bat文件，静待片刻会在文件目录中产生4个文件（注意：这里可能会找不到rc命令，只需将C:\Program Files (x86)\Windows Kits\8.1\bin\x86添加到Path环境变量中，如果是64位的就加x64）

* 将生成文件中的inffas32.obj和match686.obj文件复制到根目录x:\zlib下将Developer Command Prompt for VS2015工具目录切换到根目录x:\zlib执行nmake命令
```
nmake -f win32/Makefile.msc LOC="-DASMV -DASMINF" OBJA="inffas32.obj match686.obj"  
```

* 编译成功以后，就会在根目录产生一系列文件，其中zdll.lib和zlib1.dll就是我们需要的文件

