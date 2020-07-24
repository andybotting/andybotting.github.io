---
id: 308
title: Using libvirt with Xen on Debian Lenny
date: 2009-04-02T15:14:23+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=308
permalink: /using-libvirt-with-xen-on-debian-lenny
aktt_notify_twitter:
  - 'no'
categories:
  - Personal
---
So it seems that my CentOS 5 Dom0 wasn&#8217;t stable. When building new virtual machines, the machine would hang and I&#8217;ve have to go back into the machine room to reboot it.

I have suspicions that it was due to the 3ware 8006 RAID controller, but instead of messing around with that, I&#8217;ve installed Debian Lenny as the Dom0 (using kernel 2.6.26 as opposed to kernel 2.6.18 with CentOS).

With this machine, I wanted to find the best way to support both Debian and CentOS machine, using a _common_ method of installation. There seem to be two main ways to accomplish this.

You could use the (older) Debian route and use **xen-create-image** from xen-tools, which does a bootstrap of the OS on the filesystem, or use the newer **virt-install** from libvirt, to do an actual OS install. Libvirt seems like it&#8217;s the preferred method these days, which many of the distro&#8217;s now using for managing virtual machines using Xen, KVM or QEMU.

Using xen-create-image for Debian virtual machines has worked for me for a long time, but trying to use it for CentOS failed. The machine built, but I believe there were some packages missing from the install. I really didn&#8217;t want to have to mess around with the package lists, so I tried to use both xen-create-image for Debian and virt-install for CentOS. One problem with this is that virt-install doesn&#8217;t install the Xen config files into /etc/xen like the other tools do. Instead, it manages its own list, and contacts Xen directly using a Unix socket.

This would make management a pain, because you would have to use _xm create <domain>_to start a Debian VM, but then use _virsh start <domain>_ for CentOS. I needed something simpler.

Then I discovered that Debian Lenny now has para-virtualisation support built into the Debian Installer.

This means that I could use virt-install to build Debian Lenny virtual machines, using the actual Debian installer.

With a quick install of the libvirt packages in the Debian Lenny&#8217;s repository:

`apt-get install libvirt-bin virtinst`

You&#8217;ve got all the libvirt stuff you need. Then, to create a Debian virtual machine using virt-install:

`virt-install \<br />
--name=debian-test \<br />
--ram=512 \<br />
--file-size=8 \<br />
--nographics \<br />
--paravirt \<br />
--file=/var/lib/xen/images/debian-test.img \<br />
--location=http://mirrors.uwa.edu.au/debian/dists/lenny/main/installer-i386`

The important part is that last line. You can actually just throw a path to the install images of a Debian mirror, and virt-install is smart enough to boot a new VM from that. This then begins a Debian install, identical to what you would use on a standard machine. This also gives you full access to use the nice **virt-manager**. You can install virt-manager by doing:

`apt-get install virt-manager`

<div id="attachment_310" style="width: 595px" class="wp-caption alignnone">
  <img class="size-full wp-image-310" title="screenshot-virtual-machine-manager" src="http://www.andybotting.com/wordpress/wp-content/uploads/screenshot-virtual-machine-manager.png" alt="virt-manager" width="585" height="340" srcset="http://www.andybotting.com/wp-content/uploads/screenshot-virtual-machine-manager.png 585w, http://www.andybotting.com/wp-content/uploads/screenshot-virtual-machine-manager-300x174.png 300w" sizes="(max-width: 585px) 100vw, 585px" />
  
  <p class="wp-caption-text">
    virt-manager running on a Debian Lenny Dom0
  </p>
</div>

So I just need to remember now that if I want to start a VM, I need to use `virsh start <domain>`

Although, once started, you can use the standard xm tools. 

So finally, I have reached open-source para-virtualisation nirvana. Now if only Debian did Kickstart&#8230;