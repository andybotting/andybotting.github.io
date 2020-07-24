---
id: 224
title: OpenWRT on the D-Link DSL-502T (Gen 1)
date: 2008-10-10T13:52:58+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=224
permalink: /openwrt-on-the-d-link-dsl-502t-gen-1
aktt_notify_twitter:
  - 'no'
categories:
  - Personal
---
**NOTE:** Much of this isn&#8217;t necessary now, because OpenWRT 8.09 now supports AR7. You can just grab the [openwrt-ar7-squashfs.bin](http://downloads.openwrt.org/kamikaze/8.09.1/ar7/openwrt-ar7-squashfs.bin) image to use from <http://downloads.openwrt.org/kamikaze/8.09.1/ar7/>

* * *

I&#8217;ve had this old D-Link DSL-502T sitting around, basically working. When I moved place just recently, I took the opportunity to look into getting OpenWRT installed on this thing, basically because I wanted something I could do DNS/DHCP serving on, while giving me some shell access. The D-Link firmware is kinda dodgy, and I always enjoy installing Linux onto something new.

  * [Getting OpenWRT going on the D-Link DSL-502T by Chris Pascoe](http://www.itee.uq.edu.au/~chrisp/DSL-502T_OpenWRT/)
  * [OpenWRT wiki page for the DSL-502T](http://wiki.openwrt.org/OpenWrtDocs/Hardware/D-Link/DSL-502T)

Chris Pascoe&#8217;s page is quite dated now, but was a good place to start. Much development has gone into OpenWRT and the AR7 platform, so much of his information is now incorrect. The best place for info is the OpenWRT wiki page for the DSL-502T. It&#8217;s much more comprehensive and many of the patches and hacks that Chris Pascoe needed to do have be rolled into the OpenWRT trunk.

Much of this information has been copied and pasted from the above sites. Credits to both of them.

Start by grabbing the SVN trunk of OpenWRT.

`$ svn co https://svn.openwrt.org/openwrt/trunk`

Once this is done, you can grab any packages you&#8217;re interested in. Note that you can install these later using the opkg command once your firmware is running. I grabbed ntpclient, tcpdump, openvpn and the ddns-scripts.

`cd openwrt/trunk/package<br />
svn co https://svn.openwrt.org/openwrt/packages/net/ntpclient<br />
svn co https://svn.openwrt.org/openwrt/packages/net/tcpdump<br />
svn co https://svn.openwrt.org/openwrt/packages/libs/lzo<br />
svn co https://svn.openwrt.org/openwrt/packages/net/openvpn<br />
svn co https://svn.openwrt.org/openwrt/packages/net/ddns-scripts`

**Select firmware components**
  
Enter into the folder and run make menuconfig. Select at least:

  * Target System -> TI AR7 [2.6]
  * Target Profile -> No Wifi
  * Target Images -> SquashFS
  * Image configuration -> LAN IP Address (not required, but makes it easier if you&#8217;re already running a network)
  * Base system -> br2684ctl (only needed by PPPoE)
  * Network -> ppp -> ppp-mod-pppoa and/or ppp-mod-pppoe, depending on your ADSL type
  * Kernel Modules -> Network Devices -> select Annex A (which is ADSL over POTS. B is for ADSL over ISDN)

Make sure that you enable your packages from above in the config. E.g. Network -> Time Synchronization -> ntpclient

Quit and save the config.

**Get the build dependencies.**

For Ubuntu, you&#8217;ll need:
  
`sudo apt-get install flex bison autoconf zlib1g-dev libncurses5-dev automake g++ patch gawk`

Build your image by doing
  
`make -j3 (for a dual-core system)`

The final firmware produced by the build is located in bin/openwrt-ar7-squashfs.bin.

**Uploading the initial OpenWRT firmware.**

To upload the initial OpenWRT image, there is a tool called adam2flash. It can be found in the OpenWRT trunk, under the scripts directory. To use it, you need to execute the script in the first second or so of the machine being turned on. It&#8217;s recommended that you don&#8217;t connect the modem directly to your computer, but use a switch in between. This is in case it takes too long for the ethernet cards to negotiate.

One thing I had trouble with was finding out what the initial IP address of the device was. Before you overwrite your firmware, you can find this out by using telnet. Enable the telnet remote management from the D-Link interface and then check out the ADAM2 environment variables. They should be stored in /proc/ticfg (from memory).

If you&#8217;re lucky, you might see an entry starting with _my_ipaddress_. Mine was 10.1.1.199, but many others have mentioned 192.168.1.1. On my DSL-502T (Gen II), it haven&#8217;t found it&#8217;s IP yet. It wasn&#8217;t set in the file.

Lots more info about the ADAM2 bootloader can be found at the Seattle Wireless site. http://www.seattlewireless.net/ADAM2

Here&#8217;s the steps:

  * Download a copy of the standard D-Link firmware so you can revert to it if things go wrong! You need the &#8220;web upgrade&#8221; .BIN version of the firmware, not the .EXE version. D-Link firmware can be downloaded from (for example) http://www.dlink.com.au/tech/
  * Configure your PC for a static IP address on the same subnet as your modem&#8217;s default IP address.
  * Choose an IP address for your modem. The OpenWrt firmware will use 192.168.1.1 after rebooting (unless you set it in the menuconfig), so that&#8217;s a sensible choice.
  * Turn off the modem.
  * Run adam2flash-502T.pl, providing the modem IP address you chose and the new firmware to upload. If you are changing between D-Link and OpenWrt firmware, you will also need to specify -setmtd1 (if you forget this, the script will tell you that you need it and exit)
  * Turn on the modem.
  * Wait for the upload to complete. Here&#8217;s a sample session:

`$ scripts/adam2flash-502T.pl 192.168.1.1 -setmtd1 bin/openwrt-ar7-squashfs.bin<br />
Looking for device: ..... found!<br />
ADAM2 version 0.22.2 at 192.168.1.1 (192.168.1.1)<br />
Firmware type: OpenWRT (little-endian)<br />
logging into ADAM2 bootloader.. ok.<br />
checking hardware.. AR7RD / DSL-502T.<br />
checking MTD settings.. ok.<br />
Firmware size: 0x00280004<br />
Available flash space: 0x003e0000<br />
Preparing to flash.. ok.<br />
Erasing flash and establishing data connection (this may take a while): ok.<br />
Writing firmware: ............. lots of dots ......... done.<br />
Rebooting device.`

If you have trouble with this (as I did) you might need to hack the adam2flash-502T script a little. I commented out the whole section about doing the UDP probe part, and just passed the IP address right into the $box variable.

**Getting the LEDs to work**
  
Grab a copy of the ledsetup script found in the scripts directory of your SVN checkout. Install it into /etc/init.d and it should run on start-up. This will give you the ethernet light, and also map the USB light to ppp0. Very handy.

**DSL Sync**
  
When I finally got my ADSL connected in the new place, I couldn&#8217;t get DSL sync. It seemed to be because I had the wrong modulation set.

When you boot the device, you should see something like this in your dmesg.

`Registered device TI Avalanche SAR<br />
Sangam detected<br />
requesting firmware image "ar0700xx.bin"<br />
avsar firmware released<br />
tn7dsl_set_modulation : Setting mode to 0xffff<br />
Creating new root folder avalanche in the proc for the driver stats<br />
Texas Instruments ATM driver: version:[7.03.01.00]<br />
DSL in Sync`

The line about setting the mode to 0xffff is important. For me, my initial mode was being set to 0x7f (which wasn&#8217;t for ADSL2+). The 0xffff mode means to negotiate the best speed (ADSL 1 or 2, 2+). This is set in the ADAM2 environment so if this needs to be changed, you&#8217;ll have to reboot your modem and use the onboard FTP server&#8217;s commands SETENV, UNSETENV, GETENV (all caps matter), by doing telnet to your modem&#8217;s default IP address on port 21.

`$ telnet 10.1.1.199 21<br />
220 ADAM2 FTP Server ready.<br />
530 Please login with USER and PASS.<br />
USER adam2<br />
331 Password required for adam2.<br />
PASS adam2<br />
230 User adam2 successfully logged in.<br />
GETENV my_ipaddress<br />
200 GETENV command successful<br />
my_ipaddress          10.1.1.199<br />
GETENV modulation<br />
200 GETENV command successful<br />
modulation        127<br />
SETENV modulation,65535<br />
200 SETENV command successful`

You can also set/reset your modem&#8217;s default IP address here with the variable my_ipaddress.

**Backing up and restoring your configuration changes**
  
OpenWRT saves your filesystem (effectively, configuration) changes in a JFFS filesystem mounted at /jffs. As this filesystem is dynamically sized based upon the size of your kernel and SquashFS, uploading a new firmware image may cause your configuration to be lost.

You can back your changes up to a file on your local machine via ssh:
  
`ssh root@172.18.0.1 tar cf - /etc/ > dsl502t-backup.tar`

To restore a saved configuration, we reverse the direction of the transfer. The following command checks the configuration copied properly before deleting the old configuration:
  
`ssh root@172.18.0.1 'cat > /tmp/.r.$$ && tar tf /tmp/.r.$$ && cd / && rm -rf etc/* && tar xf /tmp/.r.$$' < dsl502t-backup.tar`

**Updating your OpenWRT install**
  
SCP over the new image
  
`desktop# scp bin/openwrt-ar7-squashfs.bin root@172.18.0.1:/tmp/newimg`

Log into the OpenWRT device, and use the mtd command to write the new image:
  
`openwrt# mtd -r write /tmp/newimg linux`

This should then go through a write/verify process, and once completed it will reboot into the new image.