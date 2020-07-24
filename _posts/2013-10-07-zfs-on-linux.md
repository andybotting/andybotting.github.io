---
id: 1175
title: ZFS on Linux
date: 2013-10-07T13:16:47+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/?p=1175
permalink: /zfs-on-linux
categories:
  - Linux
---
ZFS is a fantastic filesystem developed by Sun. Compared to other filesystems, it&#8217;s quite interesting as it combines both a filesystem and a logical volume manager. This allows you to get great flexibility, features and performance. It supports things like integrated snapshots, native NFSv4 ACL support and clever data integrity checking.

I&#8217;m now running a HP ProLiant MicroServer N36L which is a small NAS unit containing a 4-bay SATA enclosure. It has a low-performance AMD CPU, and comes with 1GB RAM and a 250GB harddisk. I&#8217;ve upgraded mine to 4GB of RAM and 4 x 2TB Seagate Barracuda drives.

The benefit of these units are that they&#8217;re a standard x86 machine allowing you to easily install any OS you like. They&#8217;re also really cheap and often have cash-back promotions.

I bought mine when I was in the UK and I brought it back with me to Australia. I waited until I got back to upgrade it so save me the trouble of shipping the extra harddisks on the ship.

In this post, I&#8217;ll document how to easily install ZFS on Debian Wheezy and some basic ZFS commands you&#8217;ll need to get started.

## Installation

**UPDATE:** ZFS on Linux now has their own Debian Wheezy repository! <http://zfsonlinux.org/debian.html>

Install the ZFS packages

```
# apt-get install debian-zfs
```

This should use DKMS to build some new modules specific to your running kernel and install all the required packages.

Pull the new module into the kernel
  
```
# modprobe zfs
```

If all went well, you should see that spl and zfs have been loaded into the kernel.

&nbsp;

## Prepare disks

ZFS works best if you give it full access to your disks. I&#8217;m not going to run ZFS on my root filesystem, so this makes things much simpler.

Find our ZFS disks. We use the disk ID&#8217;s instead of the standard _/dev/sdX_ naming because it&#8217;s more stable.
  
```
# ls /dev/disk/by-id/ata-*
lrwxrwxrwx 1 root root 9 Jan 21 19:18 /dev/disk/by-id/ata-ST2000DM001-1CH164_Z1E1GYH5 -> ../../sdd
lrwxrwxrwx 1 root root 9 Jan 21 08:55 /dev/disk/by-id/ata-ST2000DM001-9YN164_Z1E2ACRM -> ../../sda
lrwxrwxrwx 1 root root 9 Jan 21 08:55 /dev/disk/by-id/ata-ST2000DM001-9YN164_Z1F1SHN4 -> ../../sdb
```

Create partition tables on the disks so we can use them in a zpool:
  
```
# parted /dev/disk/by-id/ata-ST2000DM001-9YN164_Z1E2ACRM mklabel gpt
# parted /dev/disk/by-id/ata-ST2000DM001-9YN164_Z1F1SHN4 mklabel gpt
# parted /dev/disk/by-id/ata-ST2000DM001-1CH164_Z1E1GYH5 mklabel gpt
```

&nbsp;

## Create a new pool

ZFS uses the concept of pools in a similar way to how LVM would handle volume groups.

Create a pool called **mypool**, with the initial member being a RAIDZ composed of the remaining three drives.
  
```
# zpool create -m none -o ashift=12 mypool raidz /dev/disk/by-id/ata-ST2000DM001-1CH164_Z1E1GYH5/dev/disk/by-id/ata-ST2000DM001-9YN164_Z1E2ACRM/dev/disk/by-id/ata-ST2000DM001-9YN164_Z1F1SHN4
```

RAIDZ is a little like RAID-5. I&#8217;m using RAID-Z1, meaning that from a 3-disk pool, I can lose one disk while maintaining the data access.

NOTE: Unlike RAID, once you build your RAIDZ, you cannot add new individual disks.

The **-m none** means that we don’t want to specify a mount point for this pool yet.

The **-o ashift=12** forces ZFS to use 4K sectors instead of 512 byte sectors. Many new drives use 4K sectors, but lie to the OS about it for &#8216;compatability&#8217; reasons. My first ZFS filesystem used the 512-byte sectors in the beginning, and I had shocking performance (~10Mb/s write).

See <http://zfsonlinux.org/faq.html#HowDoesZFSonLinuxHandlesAdvacedFormatDrives> for more information about it.

```
# zpool list
NAME   SIZE ALLOC FREE  CAP DEDUP HEALTH ALTROOT
mypool 5.44T 1.26T 4.18T 23% 1.00x ONLINE -
```

Disable atime for a small I/O boost
  
```
# zfs set atime=off mypool
```

Deduplication is probably not worth the CPU overheard on my NAS.
  
```
# zfs set dedup=off mypool
```

Our pool is now ready for use.

&nbsp;

## Create some filesystems

Create our documents filesystem, mount and share it by NFS
  
```
# zfs create mypool/documents
# zfs set mountpoint=/mnt/documents mypool/documents
# zfs set sharenfs=on mypool/documents
```

Create our photos filesystem, mount and share it by NFS
  
```
# zfs create mypool/photos
# zfs set mountpoint=/mnt/photos mypool/photos
# zfs set sharenfs=on mypool/photos
```

Photos are important, so keep two copies of them around
  
```
# zfs set copies=2 mypool/photos
```

Documents are really important, so we'll keep three copies of them on disk
  
```
# zfs set copies=3 mypool/documents
```

Documents are mostly text, so we''ll compress them.
  
```
# zfs set compression=on mypool/documents
```

## Scrub

ZFS pools should be scrubbed at least once a week. It helps balance the data across the disks in your pool and to fix up any data integrity errors it might find.
  
```
# zpool scrub <pool>
```

To do automatic scrubbing once a week, set the following line in your root crontab
  
```
# crontab -e
...
30 19 * * 5 zpool scrub <pool>
...
```

**Coming soon** is a follow-up to this post with some disk fail/recovery steps.
