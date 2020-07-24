---
id: 430
title: AFL streaming radio from Linux
date: 2011-04-02T21:45:52+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=430
permalink: /afl-streaming-radio-from-linux
aktt_notify_twitter:
  - 'no'
categories:
  - Personal
---
This is a big sarcastic thanks to AFL and Telstra for building the AFL web site in such a way that it only really works properly in Windows.

Being in London, I want to listen to the Geelong games over the streaming radio, but in Linux (and probably Mac), Silverlight just won&#8217;t cut it &#8211; and the radio fails to load with an error.

I did some digging around, and worked out the URL for the the streaming radio, which you can then plug into MPlayer to obtain the ASX stream:

`mplayer -user-agent "NSPlayer/11.08.0005.0000" http://lon-cdn220-is-1.se.bptvlive.ngcdn.telstra.com/online-radio-afl_12`

The code on the end is the stream ID. These are the station codes I&#8217;ve managed to work out:

  * ABC774: 2
  * 5AA Adelaide: 3
  * 6PR Perth: 4
  * 3AW Melbourne: 5
  * National Indigenous Radio Service: 6
  * Gold FM Gold Coast: 7
  * Triple M Sydney: 11
  * Triple M Melbourne: 12
  * Triple M Brisbane: 13
  * Triple M Adelaide: 14
  * K-Rock Geelong: 15

I hope this proves useful to someone else.

**UPDATE: **This has now been changed for the 2013 season. If you&#8217;re interested in listening to AFL radio on Linux/Mac/Windows, then try my XBMC [AFL Radio plugin](http://www.andybotting.com/afl-plugins-for-xbmc "AFL plugins for XBMC").