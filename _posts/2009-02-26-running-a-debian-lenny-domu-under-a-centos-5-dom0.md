---
id: 290
title: Running a Debian Lenny DomU under a CentOS 5 Dom0
date: 2009-02-26T13:30:06+00:00
author: Andy Botting
layout: post
permalink: /running-a-debian-lenny-domu-under-a-centos-5-dom0
categories:
  - Geek
  - Work
---
The aim of this was to use the standard CentOS/RHEL Xen Dom0 tools to boot a Debian Lenny DomU.

I found plenty of instructions for doing CentOS DomU under a Debian Dom0, but not the other way around. So, this is a little how-to documenting the little things that need to be overcome.

I also wanted the Debian virtual machines to have their filesystems in a file, in the same standard way that the RHEL virt-install creates.

Steps involved:

  * Use virt-install to build a standard CentOS virtual machine
  * Use debootstrap to build a Debian Lenny base install for transplanting
  * Break apart a CentOS filesystem-in-a-file, and move the Debian install into it
  * Modify Debian config for booting the CentOS kernel

### Use virt-install to build a standard CentOS virtual machine

I created a new virtual machine, using virt-install.

`virt-install -n newvm -r 512 -f /var/lib/xen/images/debian.img -s 8 -l http://ftp.monash.edu.au/pub/linux/CentOS/5/os/i386/ -p --nographics -x`

I needed some CentOS virtual machines anyway, so I let the install go through and do its thing. If you didn&#8217;t need it, you could probably kill the install before it started installing packages. We just needed the config file for the VM in /etc/xen and the filesystem image.

### Use debootstrap to build a Debian Lenny base install for transplanting

I actually had a Debian Xen Dom0 with the xen-tools package installed. I used this to create a new Debian Lenny install, and also do some of the nice hook scripts with you would otherwise have to do by hand.

`# xen-create-image --hostname=vanila --size=8Gb --dist=lenny --memory=512M --ide --dhcp`

This meant I had a hostname file, libc6-xen and other things already done for me.

This was installed into an LVM partition, so after building it, I mounted the LVM partition, and used tar to compress it.

`# mount /dev/mapper/vg-vanilla--disk /mnt<br />
# tar zc -C /mnt/ . > /tmp/vanilla-debian.tar.gz`

### Break apart a CentOS filesystem-in-a-file, and move the Debian install into it

Set up the loop device
  
`# losetup -f /var/lib/xen/images/debian.img`

Map the partitions inside the loop device
  
`# kpartx -av  /dev/loop0<br />
add map loop0p1 : 0 208782 linear /dev/loop0 63<br />
add map loop0p2 : 0 16032870 linear /dev/loop0 208845`

At this point, you should have /dev/mapper/loop0p1 which is the root filesystem of your new VM. You&#8217;ll need to format the filesystem with:
  
`# mkfs.ext3 /dev/mapper/loop0p1`

Mount the newly formatted filesystem
  
`# mount /dev/mapper/loop0p1 /mnt`

Extract our Debian Lenny install into the filesystem
  
`# cd /mnt<br />
# tar xf /tmp/vanilla-debian.tar.gz`

### Modify Debian config for booting the CentOS kernel

We want to use CentOS/RHEL&#8217;s pygrub bootloader, just because it&#8217;s nice.

First, you&#8217;ll need to copy the CentOS kernel into your Debian install. You&#8217;ll need the config, kernel and initrd files from /boot of a DomU (or maybe the Dom0..)
  
`# cd /boot<br />
# cp config-2.6.18-92.1.22.el5xen vmlinuz-2.6.18-92.1.22.el5xen initrd-2.6.18-92.1.22.el5xen.img /mnt/boot`

Rename the initrd to drop the .img from the end. It doesn&#8217;t work with the update-grub script in Debian
  
`# mv initrd-2.6.18-92.1.22.el5xen.img initrd-2.6.18-92.1.22.el5xen`

Copy the kernel modules to your new VM too:
  
`# cp -r /lib/modules/2.6.18-92.1.22.el5xen /mnt/lib/modules`

If you don&#8217;t have a /boot/grub directory in your Debian DomU, then you&#8217;ll need create one. You only really need three files: **menu.lst** and **device.map**. We&#8217;ll need to set it up properly so that both the update-grub script in Debian and the pyGrub bootloader work happily.

Edit the **/boot/grub/device.map** file. Make sure your **hd0** is set to **/dev/xvda**:
  
`(hd0)   /dev/xvda`

The pyGrub script reads grub.conf, and not menu.lst, so symlink it
  
`cd /boot; ln -s menu.lst grub.conf`

Here&#8217;s the contents of my **/boot** after I&#8217;m finished:
  
`/boot/config-2.6.18-92.1.22.el5xen<br />
/boot/initrd-2.6.18-92.1.22.el5xen<br />
/boot/vmlinuz-2.6.18-92.1.22.el5xen<br />
/boot/grub<br />
/boot/grub/default<br />
/boot/grub/menu.lst<br />
/boot/grub/device.map<br />
/boot/grub/grub.conf<br />
` 

You&#8217;ll need to fix your inittab to use the xvc0 as your console. If you don&#8217;t you lose access to log into the console. In the file **/etc/inittab**, edit the tty1 line to be xvc0 instead.
  
`1:2345:respawn:/sbin/getty 38400 <strong>xvc0</strong>`

Your first tty should be changed to xvc0, and the others (tty2-6) should be commented out (if they&#8217;re not already)

Unmap the partitions and destroy our loop device
  
`# kpartx -d /dev/loop0<br />
# losetup -d /dev/loop0`

### Start the new Debian Lenny virtual machine

`# xm create -c debian`

You should see PyGrub come up, and let you pick the kernel.
  
 `pyGRUB  version 0.6<br />
==========================================================================<br />
| Debian GNU/Linux, kernel 2.6.18-92.1.22.el5xen                         |<br />
| Debian GNU/Linux, kernel 2.6.18-92.1.22.el5xen (single-user mode)      |<br />
|                                                                        |<br />
|                                                                        |<br />
|                                                                        |<br />
|                                                                        |<br />
|                                                                        |<br />
|                                                                        |<br />
==========================================================================<br />
Use the ^ and v keys to select which entry is highlighted.<br />
Press enter to boot the selected OS. 'e' to edit the<br />
commands before booting, 'a' to modify the kernel arguments<br />
before booting, or 'c' for a command line.`

Will boot selected entry in  4 seconds

Hopefully, it works for you too 🙂

I&#8217;ve made one vanilla debian install, and just make a copy of that image file for each new VM I need to create. I have eth0 in the interfaces file commented out, so I just put the new IP in, set the hostname and I&#8217;m ready to go.

I may have missed a step in here, so if you&#8217;re trying this out, please comment to let us know how it goes.