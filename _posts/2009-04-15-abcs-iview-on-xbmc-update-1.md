---
id: 317
title: 'ABC&#8217;s iView on XBMC.. update 1'
date: 2009-04-15T13:05:58+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=317
permalink: /abcs-iview-on-xbmc-update-1
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
---
<span style="color: #ff0000;">A plugin for ABC iView on XBMC has been released. See <a href="http://www.andybotting.com/wordpress/using-abcs-iview-on-xbmc">this page</a> for progress of ABC iView on XBMC.</span>

I&#8217;ve done a little bit of work since my last post on this, and a couple of people have asked for my stuff. Here goes.

Firstly, you can use RTMPdump to download the iView stream on your Linux box. You&#8217;ll need to download [rtmpdump 1.4](http://sourceforge.net/project/showfiles.php?group_id=248826&package_id=303903&release_id=667694) and compile it yourself. It should just take a &#8216;make&#8217; as long as you have all the requirements.

When iView starts, it first requests an XML config file, from the URL <http://www.abc.net.au/iview/iview_config.xml>

`<?xml version="1.0" encoding="utf-8"?><br />
<config><br />
<param name="authenticate_path"   value="http://202.125.43.119/iview.asmx/isp" /><br />
<param name="media_path"          value="flash/playback/_definst_/" /><br />
<param name="media_path_mp4"      value="flash:mp4/playback/_definst_/" /><br />
<param name="server_streaming"    value="rtmp://cp53909.edgefcs.net/ondemand" /><br />
<param name="server_speedtest"    value="rtmp://cp44823.edgefcs.net/ondemand" /><br />
<param name="xml_help"            value="iview_help.xml" /><br />
<param name="xml_channels"        value="iview_channels.xml" /><br />
<param name="xml_series"          value="http://www.abc.net.au/playback/xml/rmp_series_list.xml" /><br />
<param name="xml_thumbnails"      value="http://www.abc.net.au/playback/xml/thumbnails.xml" /><br />
<param name="xml_classifications" value="http://www.abc.net.au/playback/xml/classifications.xml" /><br />
<param name="xml_feature"         value="http://www.abc.net.au/playback/xml/iview_feature.xml" /><br />
<param name="xml_feature_home"    value="http://www.abc.net.au/playback/xml/iview_homepage.xml" /><br />
<param name="server_time"         value="http://www.abc.net.au/iview/time.htm" /><br />
<param name="thumbs_path"         value="http://www.abc.net.au/playback/thumbs/" /><br />
<param name="base_url"            value="http://www.abc.net.au/iview" /><br />
<param name="channel_id_arts"     value="2260366" /><br />
<param name="channel_id_news"     value="2186765" /><br />
<param name="channel_id_docs"     value="2176127" /><br />
<param name="channel_id_shop"     value="2186639" /><br />
<param name="channel_id_catchup"  value="2172737" /><br />
<param name="channel_id_kazam"    value="2288241" /><br />
<param name="channel_id_faves"    value="2478452" /><br />
<param name="channels_main"       value="catchup,news,docs,arts,shop" /><br />
<param name="channels_kids"       value="kazam,faves" /><br />
</config>`

From this file, you can find out which other XML files you need for the channels and program descriptions. Firstly though, you need a special _token_, which is like an authorisation string. It&#8217;s done by doing a HTTP GET on the **authenticate_path**, which will return something like:

`<?xml version="1.0" encoding="utf-8"?><br />
<iview xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="iview.abc.net.au"><br />
<ip>124.168.17.31</ip><br />
<isp>iiNet</isp><br />
<desc>iiNet Limited</desc><br />
<host>Akamai</host><br />
<server /><br />
<bwtest /><br />
<strong><token>daEdOckcEbtaqdmdLasbhcBbCbobAbOaxa5-bjOn1r-8-jml_rFAnL&amp;aifp=v001</token></strong><br />
<text>iView is unmetered for &lt;a href="http://www.iinet.net.au/" target="_blank"&gt;iiNet&lt;/a&gt; customers.</text><br />
<free>yes</free><br />
<count>5557</count><br />
<init>false</init><br />
</iview>`

This is doing a lookup of my IP address, to ensure I&#8217;m in Australia, and pass me the token. The token has a short lifetime also, only a few minutes. You then need this token to help you build the URL to request the video stream you want.

To find the programs of a particular channel, you need to grab a URL like this: <http://www.abc.net.au/playback/xml/output/catchup.xml>.

`<?xml version="1.0"?><br />
<rmp-content xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><br />
<channel enabled="true" id="2172737"><br />
<name>ABC CatchUp</name><br />
<description><![CDATA[Recent best of ABC1 & ABC2 TV]]></description><br />
<intro></intro><br />
<ident></ident><br />
<channel-logo>http://www.abc.net.au/playback/img/chl_catchup.png</channel-logo><br />
<image id="258433" order="1"><br />
<title><![CDATA[ABC Catchup Background 09]]></title><br />
<version id="1071615"><br />
<title><![CDATA[1230x564jpg]]></title><br />
<url>http://www.abc.net.au/reslib/200806/r258433_1071615.jpg</url><br />
</version><br />
</image><br />
<image id="257912" order="2"><br />
<title><![CDATA[ABC Catchup background 06]]></title><br />
<version id="1068909"><br />
<title><![CDATA[1230x564jpg]]></title><br />
<url>http://www.abc.net.au/reslib/200806/r257912_1068909.jpg</url><br />
</version><br />
</image><br />
<program-title-list><br />
<program-title id="352699" promo="false" order="9"><br />
<title><![CDATA[Catalyst Series 10 Episode 8]]></title><br />
<short-title></short-title><br />
<synopsis><![CDATA[Malaria jumps the gap from monkey to man; could bubbles be a solution to the hard hit  mining industry? And see how a horse trainer applies his skill to the training of elephants, with remarkable success.]]></synopsis><br />
<publish-date>03/04/2009 12:00:00</publish-date><br />
<expire-date>17/04/2009 00:00:00</expire-date><br />
<transmission-date>02/04/2009 00:00:00</transmission-date><br />
<censorship>G</censorship><br />
<censorship-warning></censorship-warning><br />
<website>Go to website</website><br />
<website-url>http://www.abc.net.au/catalyst/</website-url><br />
<video-download></video-download><br />
<video-download-url>http://www.abc.net.au/tv/geo/catalyst/vodcast/default.htm</video-download-url><br />
<shop></shop><br />
<shop-url></shop-url><br />
<category>Science and Technology</category><br />
<cue-points><br />
</cue-points><br />
<video-asset id="1619127" order="0"><br />
<title><![CDATA[1850flv]]></title><br />
<strong><url>catch_up/catalyst_09_10_08.flv</url></strong><br />
<unc-path>catalyst_09_10_08.flv</unc-path><br />
<duration>27.00</duration><br />
<file-size>135</file-size><br />
<thumb>abc_catchup.jpg</thumb><br />
</video-asset><br />
</program-title><br />
<program-title id="...."><br />
...more programs...<br />
</program-title><br />
</program-title-list><br />
</channel><br />
</rmp-content><br />
` 

I&#8217;ve shortened the output of the &#8216;Catch Up&#8217; channel here. This is what you&#8217;re likely to see when you get the channel XML file. As you can see, this is describing an episode of _Catalyst_, and I&#8217;ve marked the URL in bold.

``TOKEN=`curl -q http://202.125.43.119/iview.asmx/isp | grep token | sed 's/<token>//g' | sed 's/\&amp;/\&/g' | sed 's,</token>,,g' | sed 's/ //g'`; ./rtmpdump --rtmp "rtmp://203.206.129.37:1935////flash/playback/_definst_/catch_up/catalyst_09_10_08.flv" --auth "auth=${TOKEN}" -t "rtmp://cp53909.edgefcs.net/ondemand?auth=${TOKEN}"  -o test.flv``

This horrible command is getting the token, and stripping out all unncessesary characters, and then passing it onto rtmpdump. You might have also noticed in the command above, I have four slashes in the RTMP url. This is to work around some assumptions that rtmpdump makes about the path. I had made a patch, but in rtmpdump 1.4, you can just use 4 slashes to make it work.

Most of this data came from doing **Wireshark** packet traces while working with the flash-based iView interface. Also important to note that the programs have an expiry date also. If the command above returns a &#8216;stream not found&#8217; message, you&#8217;ll probably need a newer episode.

In the [next post](http://www.andybotting.com/wordpress/abcs-iview-on-xbmc-update-2), I&#8217;ll be posting the code for the XBMC plugin.