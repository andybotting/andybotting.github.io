---
id: 336
title: iView for XBMC plugin v0.2
date: 2009-05-03T20:46:41+00:00
author: Andy Botting
layout: post
permalink: /iview-for-xbmc-plugin-v02
---
A plugin for ABC iView on XBMC has been released. See <a href="/using-abcs-iview-on-xbmc">this page</a> for progress of ABC iView on XBMC.

I just rewrote the iView plugin for XBMC.. and it&#8217;s far more robust. There is still lots to finish, but it kinda works. This was spurred on by someone actually trying it out, and then me finding out that ABC changed their XML.

You&#8217;ll need the [RTMP patch](http://www.andybotting.com/~andy/iview/abc-iview-rtmp-tcurl-fix.patch) for XBMC, and [version 0.2 of the ABC iView plugin for XBMC](http://andybotting.com/~andy/iview/ABC_iView_xbmc_plugin_v0.2.zip).

Some things that still need improving are:

  * Auth token still times out. That means that if you watch something, you&#8217;ll need to go back to the channels list and then back into the channel to list the programs again and get a new auth token. Annoying.
  * No thumbnails or extended metadata available for channels or programs.
  * Some programs have funny names. Pretty minor, but annoying.
  * Programs are streamed in 4:3, but are actually produced in 16:9. I set XBMC to 16:9 Stretch mode.

For more info about the plugin, see this [other entry](/abcs-iview-on-xbmc-update-2) I wrote.

**Don&#8217;t forget** to vote for an iView plugin for Boxee at the [Customer Support Community for boxee.](http://getsatisfaction.com/boxee/topics/add_abc_iview_for_australian_viewers) It might might help get iView into Boxee![
  
](http://getsatisfaction.com/boxee/topics/add_abc_iview_for_australian_viewers)
