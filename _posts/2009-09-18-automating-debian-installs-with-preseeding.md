---
id: 362
title: Automating Debian installs with Preseeding
date: 2009-09-18T09:03:51+00:00
author: Andy Botting
layout: post
permalink: /automating-debian-installs-with-preseeding
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
  - Linux
  - Work
---
Following on from my post about [building Debian virtual machines with libvirt](wordpress/using-libvirt-with-xen-on-debian-lenny), I&#8217;ve now got automated installations of Debian Lenny using the preseeding method. Coupling this with using **virt-install**, I can have a Debian virtual machine installation in only a few minutes. No questions asked.

The virt-install command contains an **extra-args** argument, where you can fill-in the specific parts of the preseeding. I don&#8217;t want to set an IP address in the file as it&#8217;s going to be used to build lots of machines, so I just specify that at install time. The URL part is where out preseed config file is stored. This obviously means that the machine needs to able to contact with webserver at install time to download the config.

`$ NAME=debian-test<br />
virt-install 	--name=${NAME} \<br />
		--ram=512 --file=/var/lib/xen/images/${NAME}.img \<br />
		--file-size 8 \<br />
		--nographics \<br />
		--paravirt \<br />
		--network=bridge:br0 \<br />
		--location=http://mirrors.uwa.edu.au/debian/dists/lenny/main/installer-i386 \<br />
		--extra-args="auto=true interface=eth0 hostname=${NAME} domain=vpac.org netcfg/get_ipaddress=192.168.1.2 netcfg/get_netmask=255.255.255.0 netcfg/get_gateway=192.168.1.1 netcfg/get_nameservers=192.168.1.1 netcfg/disable_dhcp=true url=http://webserver/preseed.cfg"`

To get an idea of the contents of the preseed config file, the best place to start is the [Debian stable example preseed file](http://www.debian.org/releases/stable/example-preseed.txt). It lists lots of different options, with plenty of comments so you can understand what&#8217;s going on.

For me to get a fully-automated install, I used these options. It&#8217;s fairly standard, but definitely worth reading the comments about each line.

`$ egrep -v "(^#|^$)" preseed.cfg<br />
d-i debian-installer/locale string en_AU<br />
d-i console-keymaps-at/keymap select us<br />
d-i netcfg/choose_interface select eth0<br />
d-i netcfg/disable_dhcp boolean true<br />
d-i netcfg/dhcp_options select Configure network manually<br />
d-i netcfg/confirm_static boolean true<br />
d-i mirror/protocol string http<br />
d-i mirror/country string manual<br />
d-i mirror/http/hostname string mirrors.uwa.edu.au<br />
d-i mirror/http/directory string /debian<br />
d-i mirror/http/proxy string<br />
d-i clock-setup/utc boolean true<br />
d-i time/zone string Australia/Melbourne<br />
d-i clock-setup/ntp boolean true<br />
d-i clock-setup/ntp-server string ntp.vpac.org<br />
d-i partman-auto/method string regular<br />
d-i partman-lvm/device_remove_lvm boolean true<br />
d-i partman-md/device_remove_md boolean true<br />
d-i partman-lvm/confirm boolean true<br />
d-i partman-auto/choose_recipe select atomic<br />
d-i partman/confirm_write_new_label boolean true<br />
d-i partman/choose_partition select finish<br />
d-i partman/confirm boolean true<br />
d-i passwd/make-user boolean false<br />
d-i passwd/root-password-crypted password [MD5 Sum of the password]<br />
tasksel tasksel/first multiselect standard<br />
d-i pkgsel/include string openssh-server vim puppet<br />
popularity-contest popularity-contest/participate boolean false<br />
d-i grub-installer/only_debian boolean true<br />
d-i grub-installer/with_other_os boolean false<br />
d-i finish-install/reboot_in_progress note`

Some good resources I found, which might help you are:

  * [The _Preseeding d-i_ page on the Debian wiki](http://wiki.debian.org/DebianInstaller/Preseed)
  * [Mike Renfro&#8217;s _Unattended Debian Installations (or How I Learned to Stop Worrying and Love the preseed.cfg)_](http://blogs.cae.tntech.edu/mwr/2007/04/17/unattended-debian-installations-or-how-i-learned-to-stop-worrying-and-love-the-preseedcfg/)