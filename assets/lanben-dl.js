/* 蓝印花布数字档案 · 下载器（lanben-dl.js）
   编辑此文件后由 build_site.py 同步到多页版。资料清单在浏览器内即时生成，
   不读取任何本机文件；纹样包（13 张高清纹样原图）直接用站点里预制好的 ZIP——
   下载器发现图片不是内嵌 data URI 就自动让位给 href，单文件版则由同一段代码
   在页面内打包。脚本未加载时，按钮同样退回 href，功能不丢。 */
var LB_PATNAME = {"ban-dielian.png": "LB-0001-蝶恋花.png", "ban-fengxi.png": "LB-0002-凤戏牡丹.png", "ban-liannian.png": "LB-0003-连年有余.png", "ban-fangsheng.png": "LB-0004-方胜纹.png", "ban-huiwen.png": "LB-0005-回纹.png", "ban-panchang.png": "LB-0006-盘长纹.png", "ban-bingdilian.png": "LB-0007-并蒂莲.png", "ban-qilin.png": "LB-0008-麒麟送子.png", "ban-axian.png": "LB-0009-暗八仙.png", "ban-qinqi.png": "LB-0010-琴棋书画.png", "ban-shuangxi.png": "LB-0011-双喜团花.png", "ban-fushou.png": "LB-0012-福寿双全.png", "ban-magu.png": "LB-0013-麻姑献寿.png"};
var LB_README = "蓝印花布纹样包 · 南通蓝印花布印染技艺（国家级非遗 Ⅷ—24）\n============================================================\n\n一、内容\n  纹样图/　共 13 张高清纹样原图（PNG · 1840×1840，一纹样一张）：\n    LB-0001-蝶恋花.png             蝶恋花（鱼虫）\n    LB-0002-凤戏牡丹.png            凤戏牡丹（花鸟）\n    LB-0003-连年有余.png            连年有余（鱼虫）\n    LB-0004-方胜纹.png             方胜纹（几何）\n    LB-0005-回纹.png              回纹（几何）\n    LB-0006-盘长纹.png             盘长纹（几何）\n    LB-0007-并蒂莲.png             并蒂莲（花鸟）\n    LB-0008-麒麟送子.png            麒麟送子（人事）\n    LB-0009-暗八仙.png             暗八仙（器物）\n    LB-0010-琴棋书画.png            琴棋书画（器物）\n    LB-0011-双喜团花.png            双喜团花（文字）\n    LB-0012-福寿双全.png            福寿双全（文字）\n    LB-0013-麻姑献寿.png            麻姑献寿（人事）\n\n  全部为项目收集整理的数字化纹样图，可直接打印、临摹或作设计底稿。\n\n二、使用建议\n  1. 纹样图为高清 PNG，可直接打印、临摹、做拼贴，也可导入\n     Illustrator / Photoshop / Procreate 等软件缩放、改色、再设计；\n  2. 想体验「刻版」：把纹样图打印在牛皮纸或硬卡纸上，用刻刀沿蓝色图形镂空刻制花版，\n     记住口诀——线条断开、气韵不断（笔断意连）；\n  3. 想体验「印染」：防染浆用石灰粉与黄豆粉加水调拌，透过花版刮在白布上，晾干后\n     入靛蓝染缸反复浸染、氧化 6—8 次，最后刮灰显花、清洗晾晒（具体操作请参考\n     传承人的公开教程与研学课程）；\n  4. 改色建议：靛蓝 #1E3A5F / #14273D，布白 #F6F4EE，避免高饱和正红正黄。\n\n三、重要声明\n  1. 纹样图/ 下为项目收集整理的纹样图，非馆藏藏品原件的扫描件；\n  2. 档案编号（LB-XXXX）为本项目自拟的整理索引，非官方编号；\n  3. 授权：可自由用于学习、教学与非商业性宣传；转载或引用请注明来源；\n  4. 项目为大学生非物质文化遗产宣传公益作品。内容与数据出处见网站页脚。\n\n                                        —— 蓝印花布数字档案\n";
var LB_SOURCES = "# 蓝印花布数字档案 · 资料与照片出处清单\n\n> 本清单与站内「媒体资料」页、页脚声明一致，可直接附在参赛或答辩材料中。\n\n## 一、报道与文章\n\n### 资料 01　《江苏南通蓝印花布：蓝白相生 素花蕴雅》\n\n- 媒体：光明网 ·《光明日报》\n- 日期：2024 年 11 月 17 日\n- 作者：王蕾；照片 记者 闫汇芳、郭冠东 摄\n- 链接：https://news.gmw.cn/2024-11/17/content_37681210.htm\n- 页面引用：国家级非遗名录与项目编号、吴元新收集实物六万余件与纹样二十万余个、复色印染技艺与「凤戏牡丹」台布等藏品、南通大学蓝印花布艺术研究院\n- 对应图片：未使用照片（本条仅引用文字资料）\n\n### 资料 02　《非遗有新人 | 吴灵姝：草木本心 布上青花》\n\n- 媒体：央视网（原载荔枝新闻）\n- 日期：2023 年 1 月 10 日\n- 作者：编辑 林涛\n- 链接：https://news.cctv.cn/2023/01/10/ARTIeN5XBGI5OIOJCUKOYzO8230110.shtml\n- 页面引用：吴灵姝的学艺经历与两代人传承故事、其受访原话、刮浆与刻版的工艺细节\n- 对应图片：craft-carve.jpg、craft-vat.jpg、people-dry.jpg\n\n### 资料 03　《准备好铳子、刮浆刀、刻刀……一起制作爷爷奶奶的时尚》\n\n- 媒体：《知识就是力量》杂志（刊于人民日报客户端「人民号」）\n- 日期：2022 年 6 月 26 日\n- 作者：《知识就是力量》杂志\n- 链接：https://www.peopleapp.com/rmharticle/30028506239\n- 页面引用：五道工序的分步细节与用具（铳子、刮浆刀、刻刀）、防染浆的黄豆粉与石灰粉配比、南通蓝印花布博物馆藏清代实物\n- 对应图片：craft-paste.jpg、craft-scrape.jpg、craft-dry.jpg、cloth-phoenix.jpg、cloth-vine.jpg、cloth-shou.jpg\n\n### 资料 04　《「精彩非遗—分享·传承」听吴元新讲南通蓝印花布印染技艺》\n\n- 媒体：中国非物质文化遗产网（原载「江苏省文化馆」微信公众号）\n- 日期：2019 年 4 月 12 日\n- 作者：中国非物质文化遗产网\n- 链接：https://www.ihchina.cn/news_1_details/18536.html\n- 页面引用：吴元新的职务与从业经历、十七岁进厂当学徒、其受访原话\n- 对应图片：未使用照片\n\n### 资料 05　《「元新蓝」蓝印花图案知多少？纹样均选自吴元新三十年来收集、整理、研究、出版的《中国蓝印花布纹样大全》》\n\n- 媒体：南通蓝印花布博物馆官网\n- 日期：2016 年 4 月 6 日\n- 作者：南通蓝印花布博物馆\n- 链接：http://www.wuyuanxin.com/news/post/205438/\n- 页面引用：「吉庆有余·磬下双鱼」「鲤鱼跃龙门」被面、回环连续纹样包袱布、团寿字团花包袱布等馆藏实物的纹样图\n- 对应图片：beimian-xique.jpg、xique-dengmei.jpg、xique-meizhi.jpg、jiqingyouyu-er.jpg、liyu-longmen.jpg、chanzhi-lanyin.jpg、tuanhua-zhongxin.jpg、beimian-tuanhua.jpg、bianji-huiwen.jpg、bianji-lingxing.jpg、beimian-baxian.jpg、renwu-baxian.jpg、shupu-lanyin.jpg\n\n### 资料 06　南通蓝印花布博物馆官网「全部产品」页（蓝印花布文创器物）\n\n- 媒体：南通蓝印花布博物馆官网\n- 日期：页面持续更新\n- 作者：南通蓝印花布博物馆\n- 链接：http://www.wuyuanxin.com/project/\n- 页面引用：折扇、手提包、抱枕等蓝印花布器物实例照片，用于说明纹样在当代器物上的应用\n- 对应图片：qi-zheshan.jpg、qi-shoutidai.jpg、qi-baozhen.jpg\n\n### 资料 07　《江苏南通蓝印花布印染技艺是首批国家级「非遗」》\n\n- 媒体：江苏省「一带一路」网\n- 日期：2022 年 3 月 29 日\n- 作者：江苏省「一带一路」网\n- 链接：https://ydyl.jiangsu.gov.cn/art/2022/3/29/art_76472_10395005.html\n- 页面引用：起源南宋与八百余年传承、俗称「药斑布」、明代《南通县志》染坊记载、五道工序的浸染 20 分钟 / 氧化 30 分钟 / 反复 6—8 次 / 晾晒架约 7 米\n- 对应图片：未使用照片（该站为政务站点，在部分网络环境下可能需境内网络打开）\n\n### 资料 08　《安亭与南通蓝印花布博物馆共建交流》\n\n- 媒体：上海市嘉定区人民政府网站（来源：上海嘉定，《嘉定报》）\n- 日期：2019 年 6 月 26 日\n- 作者：《嘉定报》记者 李华成\n- 链接：https://www.jiading.gov.cn/qypd/jjxw/content_597420\n- 页面引用：《古今图书集成·职方典》关于药斑布的记载原文、药斑布出自嘉定与安亭镇（宋嘉定中 1208—1224）、宋代称药斑布 / 明代称浇花布 / 今称蓝印花布\n- 对应图片：未使用照片（本条仅引用文字资料）\n\n### 资料 09　电视专题片《走遍中国》南通《蓝白色的世界》文字稿\n\n- 媒体：央视网（CCTV-4）\n- 日期：2004 年 9 月 29 日播出（文字稿 2004 年 10 月 12 日发布）\n- 作者：中央电视台《走遍中国》栏目\n- 链接：https://news.cctv.com/program/zbzg/20041012/101450.shtml\n- 页面引用：南通的种棉与种蓝制靛业、土靛作为贡品上缴朝廷（仅海门一地每年 350 斤）、清末南通县二甲镇二十余家染坊、走街串巷的「花担艺人」与花样翻新、「蓝印花布」名称到明末清初才通行\n- 对应图片：未使用照片（本条仅引用文字资料）\n\n### 资料 10　《南通蓝印花布》地理标志产品信息（国家质量监督检验检疫总局 2013 年第 190 号公告摘录）\n\n- 媒体：中国网财经\n- 日期：2014 年 10 月 16 日\n- 作者：中国网财经\n- 链接：https://finance.china.com.cn/consume/20141016/2730217.shtml\n- 页面引用：蓝白二色的生成原理（防染浆挡色）、手工染布自然形成的「冰裂纹」与图案「断刀」特点、2013 年获批国家地理标志保护产品\n- 对应图片：未使用照片（本条仅引用文字资料）\n\n### 资料 11　五道工序演示影像（视频 · 全片 2 分 51 秒）\n\n- 媒体：抖音 @赵小满（抖音号：56148294854）\n- 日期：2026 年收录\n- 作者：视频由参赛团队整理提供\n- 链接：https://v.douyin.com/SUmLMmYsfEI/　抖音 @赵小满《这是属于我们的中国蓝——蓝印花布》\n- 页面引用：首页「过五关，斩六将」板块末尾的完整演示视频——从刻版、刮浆、入缸、晾晒到退浆显花（刮灰）的全过程\n- 对应图片：视频封面帧（assets/video/ 目录，craft-story-poster.jpg）\n\n## 二、照片素材\n\n| 文件 | 内容 | 来源 | 用于页面 |\n|---|---|---|---|\n| craft-carve.jpg | 刻版：刻刀沿墨线在花版上行走 | 央视网《非遗有新人》（原载荔枝新闻） | 首页 · 五道工序 |\n| craft-paste.jpg | 刮浆：防染浆透过花版刮在坯布上 | 《知识就是力量》杂志 | 首页 · 五道工序 |\n| craft-vat.jpg | 入缸：吴元新与吴灵姝在靛蓝染缸前 | 央视网《非遗有新人》（原载荔枝新闻） | 首页 · 五道工序 |\n| craft-scrape.jpg | 刮灰：刮刀刮去干透的防染浆，白花显现 | 《知识就是力量》杂志 | 首页 · 五道工序 |\n| craft-dry.jpg | 晾晒：染好的布挂上高高的晾晒架 | 《知识就是力量》杂志 | 首页 · 五道工序 |\n| avatar-wuyuanxin.jpg | 国家级非遗代表性传承人 吴元新（头像） | 裁自央视网《非遗有新人》画面 | 首页 · 两代人 |\n| avatar-wulingshu.jpg | 市级非遗传承人 吴灵姝（头像） | 裁自央视网《非遗有新人》画面 | 首页 · 两代人 |\n| people-dry.jpg | 吴灵姝在查看晾晒的蓝印花布 | 央视网《非遗有新人》（原载荔枝新闻） | 首页 · 两代人 |\n| cloth-phoenix.jpg | 清代「凤戏牡丹」蓝印花布包袱布（南通蓝印花布博物馆藏） | 《知识就是力量》杂志 | 凤戏牡丹页 |\n| cloth-vine.jpg | 清代蓝印花布包袱布 · 中心团凤、缠枝花卉边饰（南通蓝印花布博物馆藏） | 《知识就是力量》杂志 | 首页 · 蓝印花布的身世 / 凤戏牡丹页 |\n| fish-jiqingyouyu.jpg | 白底蓝花「吉庆有余」· 磬下双鱼 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 连年有余页 |\n| fish-liyutiaomen.jpg | 蓝底白花被面「鲤鱼跃龙门」 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 连年有余页 |\n| huiwen-baofu.jpg | 白底蓝花包袱布 · 中心八边形回环连续纹样 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 几何题材页 / 回纹页 |\n| tuanhua-shouzi.jpg | 蓝底白花包袱布 · 中心团寿字团花 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 文字题材页 |\n| cloth-shou.jpg | 清代寿字纹包袱布（南通蓝印花布博物馆藏） | 《知识就是力量》杂志 | 文字题材页 |\n| beimian-xique.jpg | 被面「喜鹊登梅」 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 花鸟题材页 |\n| xique-dengmei.jpg | 「喜鹊登梅」局部：梅枝、喜鹊与蝴蝶 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 花鸟题材页 |\n| xique-meizhi.jpg | 「喜鹊登梅」局部：鹊立梅梢 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 花鸟题材页 |\n| jiqingyouyu-er.jpg | 白底蓝花「吉庆有余」· 磬下双鱼（另一件） | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 鱼虫题材页 |\n| liyu-longmen.jpg | 蓝底白花「鲤鱼跃龙门」局部：鱼跃与龙门 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 鱼虫题材页 |\n| chanzhi-lanyin.jpg | 蓝印花布 · 缠枝花卉与中心团花（局部） | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 蝶恋花页 / 并蒂莲页 |\n| tuanhua-zhongxin.jpg | 被面中心团花（特写） | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 蝶恋花页 / 双喜团花页 |\n| beimian-tuanhua.jpg | 蓝底白花被面 · 中心团花与多层几何边饰 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 首页 · 蓝印花布的身世 / 方胜纹页 / 盘长纹页 |\n| bianji-huiwen.jpg | 被面边饰：回环连续纹样特写 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 几何题材页 / 回纹页 |\n| bianji-lingxing.jpg | 被面边饰：菱形与连续几何纹样（特写） | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 方胜纹页 / 盘长纹页 |\n| beimian-baxian.jpg | 被面「八仙过海」 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 人事题材页 / 麒麟送子页 / 暗八仙页 |\n| renwu-baxian.jpg | 被面「八仙过海」中的人物（局部） | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 人事题材页 / 麒麟送子页 / 暗八仙页 |\n| shupu-lanyin.jpg | 《中国蓝印花布纹样大全》（吴元新 编）书影 | 南通蓝印花布博物馆官网《「元新蓝」蓝印花图案知多少？》（纹样选自吴元新《中国蓝印花布纹样大全》） | 文字题材页 |\n| qi-zheshan.jpg | 蓝印花布折扇与挂饰 | 南通蓝印花布博物馆官网「全部产品」页 | 器物题材页 / 琴棋书画页 |\n| qi-shoutidai.jpg | 蓝印花布手提包 | 南通蓝印花布博物馆官网「全部产品」页 | 器物题材页 |\n| qi-baozhen.jpg | 蓝印花布抱枕 | 南通蓝印花布博物馆官网「全部产品」页 | 器物题材页 / 琴棋书画页 |\n| ban-qilin.jpg | 麒麟送子 · 数字化纹样图（花版） | 参赛团队提供 | 首页 · 给每一朵花，留一个数字分身 / 人事题材页 / 麒麟送子页 |\n| ban-qinqi.jpg | 琴棋书画 · 数字化纹样图（花版） | 参赛团队提供 | 首页 · 给每一朵花，留一个数字分身 / 器物题材页 / 琴棋书画页 |\n| ban-axian.jpg | 暗八仙 · 数字化纹样图（花版） | 参赛团队提供 | 首页 · 给每一朵花，留一个数字分身 / 器物题材页 / 暗八仙页 |\n| ban-shuangxi.jpg | 双喜团花 · 数字化纹样图（花版） | 参赛团队提供 | 首页 · 给每一朵花，留一个数字分身 / 文字题材页 / 双喜团花页 |\n| ban-bingdilian.jpg | 并蒂莲 · 数字化纹样图（花版） | 参赛团队提供 | 首页 · 给每一朵花，留一个数字分身 / 花鸟题材页 / 并蒂莲页 |\n\n说明：两张传承人头像（avatar-wuyuanxin.jpg / avatar-wulingshu.jpg）由报道画面裁切而来；\n所有照片仅作裁切与压缩，未改变画面内容。照片版权归原机构与摄影者所有，仅用于非商业性非遗宣传。\n\n## 三、授权与声明\n\n1. 站内纹样图形为依据传统题材重绘的**示意图形**，不是任何藏品原件的扫描件；\n2. 档案编号（LB-XXXX）为本项目自拟的整理索引，非官方编号；\n3. 文字与数据引用自公开报道，版权归原作者与媒体所有；\n4. 本项目自有的整理成果欢迎在非商业性学习、教学与宣传中自由使用，转载或引用请注明来源；\n5. 如需商业使用照片，请向原媒体取得授权；权利人若希望移除照片，可联系项目方。\n\n—— 蓝印花布数字档案（大学生非物质文化遗产宣传公益作品）\n";
/* —— 单文件版：在页面内生成并下载（不读取任何本机文件） —— */
(function () {
  "use strict";
  var CRC = (function () {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function enc(s) { return new TextEncoder().encode(s); }
  /* base64 → 二进制：站点里的图片以 data URI 存放，打 ZIP 前要先还原成字节 */
  function b64(str) {
    var bin = atob(str), n = bin.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  /* data URI → Blob：按 URI 头部还原 MIME（jpg / png 各不相同），另存文件时用 */
  function b64ToBlob(uri) {
    var mime = uri.slice(5, uri.indexOf(";")) || "application/octet-stream";
    return new Blob([b64(uri.slice(uri.indexOf(",") + 1))], { type: mime });
  }
  /* 取某张内嵌图的 data URI。单文件版把图片直接写成 src，这里按 data-lb-img 找回来；
     多页版图片是独立文件（src 不是 data:），返回空 → 上层退回 href 的预制 ZIP */
  function dataURIOf(key) {
    var el = document.querySelector('img[data-lb-img="' + key + '"]');
    if (!el) return "";
    var src = el.getAttribute("src") || el.src || "";
    return src.indexOf("data:") === 0 ? src : "";
  }
  var DOSDATE = ((2026 - 1980) << 9) | (9 << 5) | 29;
  var DOSTIME = (12 << 11);
  function zipStore(files) {
    var parts = [], central = [], offset = 0, i;
    for (i = 0; i < files.length; i++) {
      var name = enc(files[i].name);
      /* data 可以是字符串（SVG / 说明文字）或 Uint8Array（图片字节） */
      var data = (files[i].data instanceof Uint8Array) ? files[i].data : enc(files[i].data);
      var crc = crc32(data);
      /* 文件名含中文（如「纹样图/LB-0001-蝶恋花.jpg」）时必须置 UTF-8 标志位，
         否则解压端会按 CP437 去读，中文名变成乱码 */
      var flag = 0, j;
      for (j = 0; j < files[i].name.length; j++) if (files[i].name.charCodeAt(j) > 127) { flag = 0x0800; break; }
      var lh = new Uint8Array(30 + name.length);
      var dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true);
      dv.setUint16(6, flag, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, DOSTIME, true); dv.setUint16(12, DOSDATE, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true);
      dv.setUint16(26, name.length, true);
      lh.set(name, 30);
      parts.push(lh, data);
      var ch = new Uint8Array(46 + name.length);
      var cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, flag, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, DOSTIME, true); cv.setUint16(14, DOSDATE, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
      ch.set(name, 46);
      central.push(ch);
      offset += lh.length + data.length;
    }
    var cdSize = 0;
    for (i = 0; i < central.length; i++) cdSize += central[i].length;
    var eo = new Uint8Array(22);
    var ev = new DataView(eo.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [eo]), { type: "application/zip" });
  }
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 5000);
  }
  function save(text, name, mime) {
    saveBlob(new Blob([text], { type: mime || "text/plain;charset=utf-8" }), name);
  }
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  /* 组装纹样包文件清单（README + 13 张高清纹样原图 PNG）。
     图片取自页面里内嵌的 data URI——单文件版把原图也内嵌了，打包结果与磁盘上的
     预制 ZIP 完全一致；多页版图片是独立文件、取不到 data URI → 返回 null，
     由调用方退回站点内预制好的 ZIP。 */
  function zipFiles() {
    var list = [{ name: "README.txt", data: LB_README }], k, uri;
    for (k in LB_PATNAME) if (has(LB_PATNAME, k)) {
      uri = dataURIOf(k);
      if (!uri) return null;
      list.push({ name: "纹样图/" + LB_PATNAME[k], data: b64(uri.slice(uri.indexOf(",") + 1)) });
    }
    return list;
  }
  function toast(msg) {
    var d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99;" +
      "background:#14273D;color:#F1EDE2;font-size:14px;padding:12px 20px;border-radius:12px;" +
      "box-shadow:0 8px 30px rgba(0,0,0,.24);max-width:88vw;text-align:center;line-height:1.6;";
    document.body.appendChild(d);
    window.setTimeout(function () { d.remove(); }, 4200);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    /* 单个纹样图：单文件版把内嵌的原图另存为文件；多页版在 http(s) 下用 fetch 取图另存，
       file:// 下 fetch 不可用 → 不拦截，交给 href（已带 target=_blank，新开一页不丢当前页） */
    var one = a.getAttribute("data-lb-imgdl");
    if (one) {
      var uri = dataURIOf(one);
      if (uri) {
        e.preventDefault();
        saveBlob(b64ToBlob(uri.slice(uri.indexOf(",") + 1)),
                 a.getAttribute("download") || one);
        toast("纹样图已开始下载");
        return;
      }
      if (location.protocol !== "file:") {
        e.preventDefault();
        fetch(a.href).then(function (r) { return r.blob(); }).then(function (bl) {
          saveBlob(bl, a.getAttribute("download") || one);
          toast("纹样图已开始下载");
        });
      }
      return;
    }
    if (a.hasAttribute("data-lb-md")) {
      e.preventDefault();
      save(LB_SOURCES, "lanben-sources.md", "text/markdown;charset=utf-8");
      toast("资料清单已开始下载");
      return;
    }
    if (a.hasAttribute("data-lb-zip")) {
      var files = zipFiles();
      if (!files) return;                      /* 取不到内嵌图 → 走 href 的站点内 ZIP */
      e.preventDefault();
      saveBlob(zipStore(files), "lanben-patterns.zip");
      toast("纹样包已开始下载（ZIP · " + Object.keys(LB_PATNAME).length + " 张高清纹样原图）");
    }
  });
})();
