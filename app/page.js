'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import useVideoStore from '@/app/store/videoStore';

const sampleData = {
  "formats": [
      {
          "formatId": 18,
          "label": "mp4 (360p)",
          "type": "video_with_audio",
          "ext": "mp4",
          "quality": "360p",
          "width": 640,
          "height": 360,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFST0QqEzyozrZiIFtQkSNngpT6P9e-xqwypmasZ4bM51BdfUK6VYCktWJhfld0h2EeUK-XqYbDO&spc=qtApAUXtIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sno31t&vprv=1&svpuc=1&mime=video%2Fmp4&ns=mhQ51xf8qlEsOuapcD6jrVsQ&rqh=1&cnr=14&ratebypass=yes&dur=1203.536&lmt=1665397083432830&mt=1732350544&fvip=5&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4438434&n=UYl_jMsLPXJjAA&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRQIgdZM6LVhSRzamMw1BudxKuypYxkuRd74IMWIHrBAGkmoCIQCU6b4T3Lmggg4uOEPuigGUnUfMwDELtiu7V4WPp0VThQ%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 560925,
          "fps": 25,
          "audioQuality": "AUDIO_QUALITY_LOW",
          "audioSampleRate": "44100",
          "mimeType": "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\"",
          "duration": 20
      },
      {
          "formatId": 299,
          "label": "mp4 (1080p50)",
          "type": "video_only",
          "ext": "mp4",
          "quality": "1080p50",
          "width": 1920,
          "height": 1080,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=299&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=769073577&dur=1203.480&lmt=1665394819703643&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgUwM4TrvySruL3GVPH7f-FRJNrWXJ1ZLGTYxeQtJghzsCIDEkL_bo7WKo1Od7OpaZSuyestcAGYMNn9UyFPOk9MNM&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 6679523,
          "fps": 50,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/mp4; codecs=\"avc1.64002a\"",
          "duration": 20
      },
      {
          "formatId": 136,
          "label": "mp4 (720p)",
          "type": "video_only",
          "ext": "mp4",
          "quality": "720p",
          "width": 1280,
          "height": 720,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=136&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=279689741&dur=1203.480&lmt=1665396935535276&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAPkCA6vk6gTVwgjShY0fzqbpr4eqw1Me2x3FVAe_8kr5AiEA2AeDmuPEqswlDkukKXLMqd-Ex_gaDWdOtyjpJz8Z3z8%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 2470721,
          "fps": 25,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/mp4; codecs=\"avc1.4d401f\"",
          "duration": 20
      },
      {
          "formatId": 298,
          "label": "mp4 (720p50)",
          "type": "video_only",
          "ext": "mp4",
          "quality": "720p50",
          "width": 1280,
          "height": 720,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=298&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=442067030&dur=1203.480&lmt=1665394317963989&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgDJzRgp73rn0IOrkfccRlz9a2gJe7zftUISr2SGEawsgCIDr9uQ5FlVSN3z5VYSfTeChJyOLEZNtYVMHLrJWasI8z&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 3755353,
          "fps": 50,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/mp4; codecs=\"avc1.4d4020\"",
          "duration": 20
      },
      {
          "formatId": 134,
          "label": "mp4 (360p)",
          "type": "video_only",
          "ext": "mp4",
          "quality": "360p",
          "width": 640,
          "height": 360,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=134&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=64958812&dur=1203.480&lmt=1665396973167308&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAOIoihcv36GFs8UxtY6TL2Tr2kxCMM279Ojp4Z1GxwEvAiEA9bjnRcx5PxOzex8rdWdzdhW1R1ywr8grrujdXhDK7AA%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 640869,
          "fps": 25,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/mp4; codecs=\"avc1.4d401e\"",
          "duration": 20
      },
      {
          "formatId": 243,
          "label": "webm (360p)",
          "type": "video_only",
          "ext": "webm",
          "quality": "360p",
          "width": 640,
          "height": 360,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=243&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fwebm&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=51964135&dur=1203.480&lmt=1665409512685616&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4437434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgU2Xft4e4xYga-0nb530vOPIm8Qtopq5_TRijBQ6zo-wCIQDr43z6mZquhjGcU6QsKgEuSStjgZTMFV5e_-qADlaMEw%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 647984,
          "fps": 25,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/webm; codecs=\"vp9\"",
          "duration": 20
      },
      {
          "formatId": 160,
          "label": "mp4 (144p)",
          "type": "video_only",
          "ext": "mp4",
          "quality": "144p",
          "width": 256,
          "height": 144,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=160&aitags=134%2C136%2C160%2C243%2C298%2C299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=12421435&dur=1203.480&lmt=1665396909045383&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgNYuHhJlkr07bfuc5F1f_f1ro3pw24xDB0P_42ceQcdwCIDYeXIZwLVgn-_h9PX2tOjkv724pjCVaDoPoiBcXxyIM&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 119456,
          "fps": 25,
          "audioQuality": null,
          "audioSampleRate": null,
          "mimeType": "video/mp4; codecs=\"avc1.4d400c\"",
          "duration": 20
      },
      {
          "formatId": 140,
          "label": "m4a (131kb/s)",
          "type": "audio",
          "ext": "m4a",
          "width": null,
          "height": null,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=19479089&dur=1203.536&lmt=1665391141781569&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgWING3UZ_425B1Be7v2Gs2oFGgNgziE4epOwZuyMITFcCIDxqPgZWLFffd2r6C-AQ7fKwc_2h2eyWAKlo2qPJ6xGL&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 131472,
          "fps": null,
          "audioQuality": "AUDIO_QUALITY_MEDIUM",
          "audioSampleRate": "44100",
          "mimeType": "audio/mp4; codecs=\"mp4a.40.2\"",
          "duration": 20
      },
      {
          "formatId": 251,
          "label": "opus (161kb/s)",
          "type": "audio",
          "ext": "opus",
          "width": null,
          "height": null,
          "url": "https://rr2---sn-5hneknek.googlevideo.com/videoplayback?expire=1732372489&ei=qZNBZ6_XNY2XsvQPlrqwIQ&ip=176.103.228.76&id=o-AN9ztBrBqEnG2G6R2qXjUMbakq4dVDgbcICRyxdCJqA1&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732350889%2C&mh=rW&mm=31%2C29&mn=sn-5hneknek%2Csn-4g5e6nzs&ms=au%2Crdu&mv=m&mvi=2&pl=23&rms=au%2Cau&initcwndbps=2628750&bui=AQn3pFSHCwesWWHWTSOeoQuTa01cUhiGKwLjOoKeIIPQ-H15Ezu1nSRcBWW3xrWPQM9ffNdslaLZ3pTi&spc=qtApAUXuIWRtHqPCgt0rra_ObE552oVubgguEB7xoVN5b_sXpg&vprv=1&svpuc=1&mime=audio%2Fwebm&ns=_SceySG7elQmLGBnqKkfuHUQ&rqh=1&gir=yes&clen=19542222&dur=1203.501&lmt=1665391159800570&mt=1732350544&fvip=5&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=4432434&n=XY7j8Q9hofNJIg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgfvnvU_Z2UxD-xK62gFVS-_t7ZPx718SU1VUUKTv0hWYCIB-ySmzqx3xK68Mox77ZeeXqnLBuGoR5bcsw07c-YjGq&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgDdvRA5J1or81GTUrk2sw665TOQapgOD4GilE2GSCncsCIQDMzuw21QdB4ZAbQO_7pDfcHsfzhDgR4MkmFBd-nEJWVg%3D%3D",
          "bitrate": 161044,
          "fps": null,
          "audioQuality": "AUDIO_QUALITY_MEDIUM",
          "audioSampleRate": "48000",
          "mimeType": "audio/webm; codecs=\"opus\"",
          "duration": 20
      }
  ],
  "thumbnailUrl": "https://i.ytimg.com/vi_webp/EIaa5sRr4Z8/maxresdefault.webp?v=6343a350",
  "defaultFormatId": 18,
  "duration": "1204",
  "title": "TRAVEL IDEA || 2022-07-03"

}


export default function page() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();


  const { setVideoSrc } = useVideoStore();

  const router = useRouter();

  const selectedVideo = (format) => {
    setVideoSrc(format.url);
    router.push(`/extract`);
  }


  const getVideos = async () => {
    setLoading(true);
    try {
      await fetch(`/api/extract`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url : url }),
      }).then((res) => res.json())
      .then(setResult)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col h-screen w-full justify-center items-center'>
        <div className='flex items-center p-2 gap-2'>
          <Input placeholder='youtube url' type='url' value={url} onChange={(e) => setUrl(e.target.value)}/>  
          <Button onClick={getVideos} disabled={loading}>
            {loading ? 'Loading...' : 'Extract'}
          </Button>
        </div>

        <div className='w-2/3 '>
          <img src={result?.thumbnailUrl} className='rounded-md' />

          <div className='flex flex-wrap gap-2 py-4'>
            {result?.formats.map((format) => (
            <Button 
              key={format.formatId} 
              variant={"outline"}
              className="flex flex-col items-start p-2 h-auto"
              onClick={() => selectedVideo(format)}
            >
              <div className="flex items-center gap-2">
                {format.type === "video_with_audio" && (
                  <span className="text-xs bg-green-500/20 text-green-700 px-1 rounded">Combined</span>
                )}
                {format.type === "video_only" && (
                  <span className="text-xs bg-blue-500/20 text-blue-700 px-1 rounded">Video</span>
                )}
                {format.type === "audio" && (
                  <span className="text-xs bg-purple-500/20 text-purple-700 px-1 rounded">Audio</span>
                )}
                <span className="text-sm font-medium">
                  {format.quality || format.label}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format.ext.toUpperCase()} • {format.fps ? `${format.fps}fps •` : ''} 
                {format.audioQuality ? ` ${format.audioQuality.replace('AUDIO_QUALITY_', '')}` : ''}
                {format.bitrate ? ` • ${Math.round(format.bitrate / 1024)}kbps` : ''}
              </div>
            </Button>
            ))}
          </div>
        </div>
    </div>
  )
}
