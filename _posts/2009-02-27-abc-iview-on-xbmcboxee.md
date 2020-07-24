---
id: 306
title: ABC iView on XBMC/Boxee
date: 2009-02-27T20:41:56+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=306
permalink: /abc-iview-on-xbmcboxee
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
---
<span style="color: #ff0000;">A plugin for ABC iView on XBMC has been released. See <a href="http://www.andybotting.com/wordpress/using-abcs-iview-on-xbmc">this page</a> for progress of ABC iView on XBMC.</span>

I think it would be really neat to use ABC&#8217;s iView on the Xbox Media Centre (XBMC) and/or Boxee. Honestly, who really wants to watch TV on their computers? Haven&#8217;t we evolved from that now?

I&#8217;ve got a modded XBOX running XBMC, and I have various Linux boxes running XBMC and Boxee and I think they&#8217;re the perfect platform for something like iView.. especially because it&#8217;s unmetered traffic on iiNet, Internode and other great ISP&#8217;s.

I did a little research, and they seem to use Adobe&#8217;s _Real Time Message Protocol_ (RTMP) to stream the video from their server to the iView client, which is written in Flash. Recent versions of XBMC and Boxee have code to support RTMP, which is also used by other digital content providers like NBC&#8217;s Hulu, and the BBC&#8217;s iPlayer.

I have managed to work out most of the iView&#8217;s XML stuff, which describes channels, programs, thumbnails, etc but not quite got there with the actual streaming part. I&#8217;m playing with **rtmpdump**, which is based on the rtmp code from XBMC/Boxee, and have almost worked out the URL part to get the server to stream. I just keep getting a message about not being able to find the specified stream.

If anyone out there on the interwhizzle has worked this stuff out, I&#8217;d love to hear from them. My googling hasn&#8217;t really revealed anything like what I&#8217;m after. If you&#8217;re interested in using iView on XBMC or Boxee, I&#8217;d like to hear from you also.

**UPDATE:** Please vote for an iView plugin for Boxee at the [Customer Support Community for boxee.](http://getsatisfaction.com/boxee/topics/add_abc_iview_for_australian_viewers) It might might help get iView into Boxee![
  
](http://getsatisfaction.com/boxee/topics/add_abc_iview_for_australian_viewers) 

**UPDATE 2:** I&#8217;ve uploaded a basic plugin for XBMC. See: [<span id="sample-permalink">http://www.andybotting.com/wordpress/<span id="editable-post-name" title="Click to edit this part of the permalink">iview-for-xbmc-plugin-v02</span></span>](http://www.andybotting.com/wordpress/iview-for-xbmc-plugin-v02) for more info.