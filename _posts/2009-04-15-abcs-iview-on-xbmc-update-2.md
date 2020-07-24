---
id: 328
title: 'ABC&#8217;s iView on XBMC.. update 2'
date: 2009-04-15T13:27:03+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=328
permalink: /abcs-iview-on-xbmc-update-2
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
---
<span style="color: #ff0000;">A plugin for ABC iView on XBMC has been released. See <a href="http://www.andybotting.com/wordpress/using-abcs-iview-on-xbmc">this page</a> for progress of ABC iView on XBMC.</span>

Following on from the [last post](http://www.andybotting.com/wordpress/abcs-iview-on-xbmc-update-1) about using rtmpdump to grab ABC&#8217;s iView programs, I&#8217;ve made a start on an XBMC plugin.. with the hope of eventually working on a Boxee plugin also.

To start with, you&#8217;ll need [my patch](http://www.andybotting.com/~andy/iview/abc-iview-rtmp-tcurl-fix.patch) to all you to specify the tcurl of an rtmp stream from with the XBMC API. This is needed because XBMC makes some assumptions about RTMP urls, based on other streams like Hulu and BBC&#8217;s iPlayer. ABC&#8217;s method is similar, but a little different. I&#8217;ll be trying to get the patch sent upstream, but it may need a little more work.

Now you&#8217;re going to have to compile XBMC yourself from source. I&#8217;ve only done it on Linux, so I can&#8217;t help you with Mac, Windows or Xbox versions. For information about compiling it on Ubuntu, you can check out [the page on the XBMC wiki](http://xbmc.org/wiki/?title=HOW-TO_compile_XBMC_for_Linux_from_source_code). You just need to do &#8216;cd&#8217; into the XBMC directory you did your SVN checkout on, and then:

`patch -p0 < /path/to/abc-iview-rtmp-tcurl-fix.patch`

Hopefully you shouldn&#8217;t see any errors.

You can then grab my very basic [iView plugin for XBMC](http://www.andybotting.com/~andy/iview/ABC_iView_xbmc_plugin_v0.1.zip). It&#8217;ll need to be extracted into your plugins/video directory of your XBMC installation.

This plugin has some serious limitations right now..

Firstly, some shows are listed as just &#8216;Episode 1&#8217;. It seems that in the XML files describing the shows, the data is very inconsistent. I&#8217;ll be looking at this in the next version of the plugin.

Next, because of the nature of the auth token that is generated, if you watch a program and then go back to the list of programs, if you try another, it will fail to play, as the token has timed out. You need to go back another level to the channels, then click the channel you want. This means that the URLS listed will generate a new token which will be valid again.

Last, the shows are all broadcasted in 16:9 on the TV, but streamed at 640&#215;480 (4:3). This is really silly, but you can fix it by setting your XBMC view to use &#8216;Stretch 16:9&#8217;. Not ideal, but I&#8217;ll be looking into automatically setting the view if it&#8217;s exposed in the XBMC API.

It&#8217;s still very rough, but a start. Boxee has just announced a new API which I&#8217;ll be taking a look at shortly.

**UPDATE:** Version 0.2 of the plugin is out. [See here](http://www.andybotting.com/wordpress/iview-for-xbmc-plugin-v02iview-for-xbmc-plugin-v02).