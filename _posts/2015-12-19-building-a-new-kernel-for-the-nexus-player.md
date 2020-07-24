---
id: 1208
title: Building a new kernel for the Nexus Player
date: 2015-12-19T20:11:41+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/?p=1208
permalink: /building-a-new-kernel-for-the-nexus-player
categories:
  - Personal
---
I bought a cheap Micro USB (OTG) to USB hub with built-in Ethernet from Ebay for my Nexus Player. It seemed like the perfect way to make use of the single USB port available.

[<img class="size-medium wp-image-1209 alignnone" style="border: 0px;" alt="micro-usb-ethernet-usb" src="http://www.andybotting.com/wp-content/uploads/micro-usb-ethernet-usb-300x300.jpg" width="300" height="300" srcset="http://www.andybotting.com/wp-content/uploads/micro-usb-ethernet-usb-300x300.jpg 300w, http://www.andybotting.com/wp-content/uploads/micro-usb-ethernet-usb-150x150.jpg 150w, http://www.andybotting.com/wp-content/uploads/micro-usb-ethernet-usb.jpg 500w" sizes="(max-width: 300px) 100vw, 300px" />](http://www.andybotting.com/wp-content/uploads/micro-usb-ethernet-usb.jpg)

Once I got it, I realised the Ethernet used a Davicom chipset and while it did have good Linux support with the dm9601 module, it wasn&#8217;t enabled in Android kernels.

As I started looking at guides for compiling kernels for Android, I found that they didn&#8217;t quite work properly for the Nexus Player.

Most Android devices are ARM based, but as the arch of the Nexus Player is x86, there&#8217;s some minor differences in some of the steps.

Here&#8217;s a quick run-down of the steps I did to simply add a new module to the Nexus Player kernel. I&#8217;m assuming that you&#8217;ve read a few of the more detailed guides or you&#8217;ve done some kernel building before.

**NOTE**: You&#8217;ll need to go into OEM unlock on the device. You probably don&#8217;t need to be rooted, but I was. YMMV.

First step is to find the kernel version you&#8217;re currently running. Connect to the device with adb and run this in the shell:

```
shell@fugu:/ $ cat /proc/version
```

We&#8217;ll need to get the git commit for the kernel.

In this case:

```
Linux version 3.10.20-g912890c
```

The kernel commit is the part after the &#8216;g&#8217;, so &#8216;_912890c_&#8216;.

Depending on your Linux distro, you may want to pull Google&#8217;s toolchain. I&#8217;m using Arch Linux, which has GCC 5.3 and I had a build error, so instead, I just pulled the same toolchain that Google used for their production builds. If you want to match it, just look for the GCC version from the output above. E.g. &#8216;_gcc version 4.8_&#8216;

In my case, I cloned the repository:

```
git clone https://android.googlesource.com/platform/prebuilts/gcc/linux-x86/x86/x86_64-linux-android-4.8
```

Add this to your path (substitute the $HOME/android part for your path)

```
export PATH="$PATH:$HOME/android/x86_64-linux-android-4.8/bin"
```

Add this CROSS_COMPILE variable to instruct the build to use this new toolchain. This is the prefix of the GCC binaries in the bin directory

```
export CROSS_COMPILE="x86_64-linux-android-"
```

Now we&#8217;ll clone the Kernel repository. For the Nexus Player (fugu) we&#8217;re using:

```
$ git clone https://android.googlesource.com/kernel/x86_64.git fugu-kernel
```

```
$ cd fugu-kernel
```

We&#8217;ll create our own branch to work on, based on the last commit of our current kernel

```
git checkout -b my-fugu-kernel 912890c
```

Let&#8217;s modify the kernel now

```
$ export ARCH=x86
$ make fugu_defconfig
$ make menuconfig
```

We can now make changes to our config.

Once you&#8217;re happy, we&#8217;ll build it using all our cores:

```
$ make -j$(nproc)
```

Once you&#8217;re done, you&#8217;ll have a kernel image at _arch/x86_64/boot/bzImage_

Now we&#8217;ll update the boot image to include our new kernel.

You&#8217;ll want to install the abootimg tool, and get a copy of the boot.img. Best to find it from the Nexus Player factory image, then tar and unzip.

We&#8217;ll update our factory boot.img and include our new kernel only:

```
$ abootimg -u boot.img -k (kernel path)/arch/x86_64/boot/bzImage
reading kernel from (kernel path)/arch/x86_64/boot/bzImage
Writing Boot Image boot.img
```

Boot the Nexus Player into fastboot mode, and we&#8217;ll test our new kernel (before flashing)

```
$ fastboot boot boot.img
```

If you&#8217;re happy with it, then don&#8217;t forget to flash it:

```
$ fastboot flash boot boot.img
```

Success!

For more information, I found this page really useful:

<http://softwarebakery.com/building-the-android-kernel-on-linux>

&nbsp;
