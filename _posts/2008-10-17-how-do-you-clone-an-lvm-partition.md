---
id: 230
title: How do you clone an LVM partition?
date: 2008-10-17T14:29:30+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=230
permalink: /how-do-you-clone-an-lvm-partition
categories:
  - Linux
---
It&#8217;s actually more difficult than you might think. From the bit of googling that I did, it seems that you can&#8217;t just &#8216;clone&#8217; and LVM logical volume, while it&#8217;s running.

One method I found was to use the &#8216;snapshot&#8217; feature of LVM to create a &#8216;frozen image&#8217; copy of the logical volume, which is then suitable for copying to a new logical volume, while leaving the original intact.

Here&#8217;s our original logical volume that we want to clone.

`# lvdisplay<br />
&nbsp;<br />
--- Logical volume ---<br />
LV Name                /dev/vg/host-disk<br />
VG Name                vg<br />
LV UUID                UK1rjH-LS3l-f7aO-240S-EwGw-0Uws-5ldhlW<br />
LV Write Access        read/write<br />
LV Status              available<br />
# open                 1<br />
LV Size                9.30 GB<br />
Current LE             2382<br />
Segments               1<br />
Allocation             inherit<br />
Read ahead sectors     0<br />
Block device           254:0`

Let&#8217;s now create our snapshot logical volume. For the size, it should only need 10 &#8211; 20% of the original size, as we&#8217;re only mirroring the real volume.

`# lvcreate --size 2G --snapshot --name host-disk-snap /dev/vg/host-disk`

Let&#8217;s take a look at our new volume

`# lvdisplay<br />
 &nbsp;<br />
--- Logical volume ---<br />
LV Name                /dev/vg/host-disk<br />
VG Name                vg<br />
LV UUID                UK1rjH-LS3l-f7aO-240S-EwGw-0Uws-5ldhlW<br />
LV Write Access        read/write<br />
<strong>LV snapshot status     source of /dev/vg/host-disk-snap [active]</strong><br />
LV Status              available<br />
# open                 1<br />
LV Size                9.30 GB<br />
Current LE             2382<br />
Segments               1<br />
Allocation             inherit<br />
Read ahead sectors     0<br />
Block device           254:0<br />
&nbsp;<br />
--- Logical volume ---<br />
LV Name                /dev/vg/host-disk-snap<br />
VG Name                server1<br />
LV UUID                9zR5X5-OhM5-xUI0-OolP-vLjG-pexO-nk36oz<br />
LV Write Access        read/write<br />
<strong>LV snapshot status     active destination for /dev/vg/host-disk</strong><br />
LV Status              available<br />
# open                 1<br />
LV Size                9.30 GB<br />
Current LE             2382<br />
COW-table size         10.00 GB<br />
COW-table LE           2560<br />
Allocated to snapshot  0.01%<br />
Snapshot chunk size    8.00 KB<br />
Segments               1<br />
Allocation             inherit<br />
Read ahead sectors     0<br />
Block device           254:5`

From the output, you should be able to see that we&#8217;ve now got some snapshot fields shown in our output. We&#8217;ll create another logical volume, which will be our final target for our new virtual machine.

`# lvcreate --size 10G --name newhost-disk vg`

With our source and target partitions ready to go, we need to begin copying the data. You have some choices here, depending on your setup.

If you&#8217;re using the same size partitions you could use dd, or even xfs_copy if you&#8217;re using XFS.

If you&#8217;re like me, I wanted the new target partition to be a smaller size than the original. Also, if you wanted to use a different filesystem, the only real way to do it is to copy the files.

We&#8217;ll need to make the new filesystem on our target partiton

`# mkfs.xfs /dev/vg/newhost-disk`

and mount our filesystems

`# mkdir /mnt/host-disk-snap<br />
# mount -o ro /dev/vg/host-disk-snap /mnt/host-disk-snap<br />
&nbsp;<br />
# mkdir /mnt/newhost-disk<br />
# mount /dev/vg/newhost-disk /mnt/newhost-disk`

I wasn&#8217;t sure about how changes to the filesystem would affect the original, so I thought I&#8217;d stick to the safe side, and mount it as read-only.

Change into the source filesystem

`# cd /mnt/host-disk-snap`

Using a mix of find and cpio, copy the files

`# find . -mount -print | cpio -pdm /mnt/newhost-disk`

Wait a few minutes, depending on your filesystem size, and you&#8217;re done.

When you&#8217;re satisfied, you can just use lvremove to remove your snapshot volume.

`# umount /mnt/host-disk-snap<br />
# lvremove /dev/vg/host-disk-snap`

After all that, you should finally have a cloned filesystem to use. I&#8217;m sure there&#8217;s an easier way, but this worked for me.