var viewHtml = "init.html";
var searchStrs = "";
var tmpsearchStrs = "";
$('#tab1').on('click', function() {
	$('.sidebar-collapse').css("display", "block");
	$('.search').css("display", "none");
	$('#tab1').addClass("select");
	$('#tab2').removeClass("select");
	tmpsearchStrs = searchStrs;
	searchStrs = "";
})
$('#tab2').on('click', function() {
	$('.sidebar-collapse').css("display", "none");
	$('.search').css("display", "block");
	$('#tab1').removeClass("select");
	$('#tab2').addClass("select");
	searchStrs = tmpsearchStrs;
})
$('#searchbutton').on('click', function() {
	fncDoSearch();
})

$("#searchTextbox").keypress(function(e){
	if(e.which != 13){
		return;
	}
	fncDoSearch();
});

function fncDoSearch() {
	var strSearchTexts = $('#searchTextbox').val();
	if(strSearchTexts == ""){
		return;
	}
	$('.sidebar-search').css("display","");
	var strSearchTexts = $('#searchTextbox').val();
	strSearchTexts = escapeSearchText(strSearchTexts);
	// 検索条件をエスケープ
	showSearchResult(strSearchTexts);
}

// 検索条件をエスケープ
function escapeSearchText(strSearchTexts){
		var regexpEscapeJson = /([$()\-^\\\|\[\]{},:+*.?])/g;
		if (regexpEscapeJson.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeJson, "\\$1");
		}
		var regexpEscapeHtmlAmp = /(&)/g;
		if (regexpEscapeHtmlAmp.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlAmp, "&amp;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlAmp, "&amp;");
		}
		var regexpEscapeHtmlLt = /(<)/g;
		if (regexpEscapeHtmlLt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlLt, "&lt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlLt, "&lt;");
		}
		var regexpEscapeHtmlGt = /(>)/g;
		if (regexpEscapeHtmlGt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlGt, "&gt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlGt, "&gt;");
		}
		return strSearchTexts;
}

function showSearchResult(strSearchTexts){
	// 検索先情報 (search.json) の取得
	var s = eval(search);
	// 検索先情報分ループ
	var iLoopLength = s.length;
	var result = '<div id="id_search_results" style="background-color: rgb(255, 255, 255);height: calc(87vh - 170px);">';
	var resultCount = 0;
	var searchTexts = createSearchText(strSearchTexts);
	for (var i = 0; i < iLoopLength; i++) {
		// 検索先情報の取得
		var body = s[i].body;		// 本文
		// 本文が空ならスキップ
		if (!body || !searchBody(body,strSearchTexts)) {
			continue;
		}
		result += createSearchResultDiv(s[i], searchTexts);
		resultCount++;
	}
	result += "</div>";
	var viewResult ="<div id=\"id_search_info\"> <span style=\"color: #cf4e32;\">" + resultCount + "</span> " + resultStr + "</div>";
	viewResult += result;
	$(".sidebar-search").html(viewResult);
}

function searchBody(body, strSearchTexts){
	var resultBoolean = true;
	body = body.toLowerCase();
	//カタカナで検索を行うようにする。
	body = body.replace(/[ぁ-ん]/g, function(s) {
		   return String.fromCharCode(s.charCodeAt(0) + 0x60);
		});
	var searchTexts = createSearchText(strSearchTexts);
	$.each(searchTexts, function(index, value){
		if(value != " " && !body.match(value.replace("#space", " "))){
			resultBoolean = false;
			return false;
		}
	})
	return resultBoolean;
}

function createSearchText(strSearchTexts){
	strSearchTexts = strSearchTexts.toLowerCase();
	//カタカナで検索を行うようにする。
	strSearchTexts = strSearchTexts.replace(/[ぁ-ん]/g, function(s) {
		   return String.fromCharCode(s.charCodeAt(0) + 0x60);
		});

	//ダブルクォーテーションの中の文字はスペースがあっても分割しない。
	strSearchTexts = strSearchTexts.replace(/"(.*?) (.*?)"/,"$1#space$2").replace(/　/," ");
	var txt = strSearchTexts.split(" ");
	//空要素と重複要素を除去
	var arr2 = txt.filter(function(s){return s !== '';});
	var arr3 = arr2.filter(function (x, i, self) {
		return self.indexOf(x) === i;
	});
	return arr3;
}

//検索結果のDivを作成します。
function createSearchResultDiv(target, searchTexts){
	searchStrs = searchTexts;
	var arrResults = new Array();
	arrResults.push("<div class=\"search_topic_title\">");
	arrResults.push("&nbsp;");

	arrResults.push("<a href=\"javascript:changeHtml('" + target.HTMLFileName + "');\">");
	arrResults.push(target.title);
	arrResults.push("</a>");

	arrResults.push("</div>");
	arrResults.push("<div class=\"search_topic_summary\">");
	arrResults.push(markingColor(searchTexts, target.body));
	arrResults.push("</div>");
	return arrResults.join("");

}

//targetで指定した文字をハイライトします。
function markingColor(target, body){
	var nMarkerColor = 0;
	var strMarkerColor = "";
	var strMarkerEndColor = "";
	var baseLength = body.length;
	for (var k = 0; k < target.length; k++) {
		target[k] =target[k].replace("#space", " ");
		if(target[k] != " "){
			switch (nMarkerColor) {
				case 0:
					strMarkerColor = String.fromCharCode(0x2080);
					break;
				case 1:
					strMarkerColor = String.fromCharCode(0x2081);
					break;
				case 2:
					strMarkerColor = String.fromCharCode(0x2082);
					break;
				case 3:
					strMarkerColor = String.fromCharCode(0x2083);
					break;
				case 4:
					strMarkerColor = String.fromCharCode(0x2084);
					break;
			}

			//色を設定します。
			body = markingColorAction(body, target[k], strMarkerColor);
			var hiragana =  target[k].replace(/[ア-ン]/g, function(s) {
				   return String.fromCharCode(s.charCodeAt(0) - 0x60);
				});
			body = markingColorAction(body, hiragana, strMarkerColor);
			nMarkerColor++;
			if(nMarkerColor > 4){
				nMarkerColor = 0;
			}
		}
	}
	
	var resultBody = "";
	for (var k = 0; k < target.length; k++) {
		target[k] =target[k].replace("#space", " ");
		var strcount = body.search(target[k]);
		var baseBody = body;
		var startCount = strcount - 21;
		if(startCount < 0){
			startCount = 0;
		}
		targetBody = baseBody.substring(startCount, strcount + target[k].length + 21);
		if(strcount - 20 > 0){
			targetBody = "..." + targetBody;
		}
		if(strcount + target[k].length + 20 < baseLength){
			targetBody = targetBody + "...";
		}
		resultBody += targetBody;
	}
	resultBody = resultBody.replace(/\u2080/g, "<span class=\"backA\">");
	resultBody = resultBody.replace(/\u2081/g, "<span class=\"backB\">");
	resultBody = resultBody.replace(/\u2082/g, "<span class=\"backC\">");
	resultBody = resultBody.replace(/\u2083/g, "<span class=\"backD\">");
	resultBody = resultBody.replace(/\u2084/g, "<span class=\"backE\">");
	resultBody = resultBody.replace(/\u2085/g, "</span>");

	return resultBody;
}

function markingColorAction(body, target, strMarkerColor){
	var targetRegexp = new RegExp(target,'gi');
	var matchList = body.match(targetRegexp);
	if(matchList == null){
		return body;
	}
	var nonDuplicationlist = matchList.filter(function (x, i, self) {
		return self.indexOf(x) === i;
	});
	for (var t of nonDuplicationlist) {
		body = body.replaceAll(t,strMarkerColor +  t + String.fromCharCode(0x2085))
	}
	return body;
}

function changeHtml(htmlName) {
	$('#frame').attr("src", htmlName);
	viewHtml = htmlName;
	$('.topic').removeClass('thisTopic');
    $('#' + htmlName.replace(".html", "")).addClass('thisTopic');
    if(window.innerWidth <768){
   		$('nav.navbar-side').removeClass('open').addClass("in");
   		$('button.navbar-toggle').removeClass('open').addClass("collapsed")
	}
}
$('#frame').load(function(){
	$('#frame')[0].contentWindow.postMessage(searchStrs, "*");	// iframeの場合
});
var search=[{topicId:"guid-9230cc6c-ead3-3a7d-407c-2b4a40ff1150",body:"取扱説明書（WEB）取扱説明書（WEB）サーキュレーター型番：PCF-BC15TEC ［室内・家庭用］        このたびは、お買い上げいただきまことにありがとうございます。 一般家庭用以外でご使用にならないでください。 無償保証の対象外になることがあります。この取扱説明書をよくお読みになり、正しくお使いください。ご使用の前に「安全上の注意」を必ずお読みください。WEBマニュアルについては、「WEBマニュアルの使いかた」をご確認ください。 この商品は海外ではご使用になれません。 FOR USE IN JAPAN ONLY ",title:"取扱説明書（WEB）",HTMLFileName:"取扱説明書（WEB）_guid-9230cc6c-ead3-3a7d-407c-2b4a40ff1150_0.html"},{topicId:"guid-f9f557d3-43fa-43be-e1fd-2c624213c086",body:"WEBマニュアルの使いかたここでは「WEBマニュアル」の使いかたを案内します。 当サイトは下記のブラウザでの使用を推奨しています。 ・Microsoft Edgeブラウザ（最新版） ・Google Chromeブラウザ（最新版） －WEBマニュアルについて■スマートフォン   ■パソコン   ❶ メニュー一覧/検索 切替ボタン（スマートフォンのみ）  をタップするとメニュー一覧/検索画面が表示されます。  を押すと元の画面に戻ります。  ❷ 製品名、型番 お問い合わせ時には、製品名と型番をご連絡お願いいたします。  ❸ ページ内リンク 選択すると、ページ内の該当情報が表示されます。  ➍ 関連ページリンク 選択すると、WEBサイトやWEBマニュアル内の該当ページが表示されます。  ❺ メニュー 選択すると、メニュー一覧が表示されます。検索タブと切り替えて使用します。  ❻ メニューリスト メニュー一覧を表示させます。  ❼ 検索タブ 選択すると、目的の情報を検索できるようになります。メニュータブと切り替えて使用します。  －検索について■スマートフォン    ■パソコン  ❽ フリーワード検索 キーワードを入力することで、目的の情報を検索することができます。  ❾ 検索リスト 検索した結果が表示されます。選択すると、WEBマニュアル内の該当ページが表示されます。   デザインおよび仕様は予告なく変更することがあります。Microsoft Edge は Microsoft Corporation の商標です。Google Chrome は Google LLC の商標です。   ",title:"WEBマニュアルの使いかた",HTMLFileName:"WEBマニュアルの使いかた_guid-f9f557d3-43fa-43be-e1fd-2c624213c086_1.html"},{topicId:"guid-929c743b-75d3-5339-6cba-8c843ccbd68b",body:"安全上の注意最初に、この「安全上の注意」をよくお読みいただき、正しくお使いください。 人への危害や、財産への損害を未然に防止するため、必ず守る必要があることを説明しています。 → 警告 → 注意 図記号の意味注意を促す記号です。禁止を示す記号です。必ず行うことを示す記号です。  誤った取り扱いをすると、人が死亡または重傷を負うおそれがある内容を示しています。分解・修理・改造をしない 火災・感電・けがの原因になります。 修理については、お買い上げの販売店または修理専用コール（  電話をかける）にご相談ください。水まわり、風呂場など湿気のある場所では絶対に使用しない本体を水につけたり、本体に水をかけたりしない 火災・感電の原因になります。異常・故障時には、直ちに使用を中止し、電源を切り、電源プラグをコンセントから抜く 火災・感電・発煙のおそれがあります。 〔異常の例〕異常な音やにおいがする電源プラグ・電源コードが異常に熱くなる電源コードを動かすと、通電したりしなかったりする運転中時々止まる触れるとピリピリ電気を感じる使用を中止し、お買い上げの販売店またはアイリスコール（  電話をかける）へお問い合わせください。  電源プラグのほこりは定期的に取る ほこりがたまると、湿気などで絶縁不良になり、火災・感電の原因になります。電源プラグはコンセントの奥まで確実に差し込む ショートによる火災・感電の原因になります。 交流100V以外では使わない 火災の原因になります。電源コードや電源プラグが傷んだり、コンセントの差し込みがゆるいときは使用しない ショートによる火災・感電の原因になります。電源コードを束ねて使用しない 火災の原因になります。電源コードは必ずのばして使用してください。電源コードを傷付けない 傷付ける、加工する、無理に曲げる、引っ張る、ねじる、重いものを載せる、挟み込むなどしないでください。電源コードが破損し、火災・感電の原因になります。持ち運び時や収納時に電源コードを引っ張らない 火災・感電の原因になります。 お手入れや点検、移動の際は、必ず電源プラグをコンセントから抜く 感電・けがの原因になります。 ぬれた手で電源プラグの抜き差しをしない 感電・やけど・けがの原因になります。屋外では使用しない風の流れをさえぎるようなものの周囲で使用しない布や紙、ビニール袋などでおおったり、ふさいだりして運転しないほこり、粉じんの多い場所で使用しない ショートによる火災・感電の原因になります。スプレーをかけない（殺虫剤・整髪料・潤滑油など）引火性のもの（灯油・ガソリン・シンナーなど）、火の気のあるもの（たばこ・線香など）、可燃性のもののそばで使わない 火災の原因になります。風をストーブなどの燃焼器具に向けて使用しない 不完全燃焼や炎の飛散を引き起こし、一酸化炭素中毒や火災の原因になります。リモコンの電池は、幼児の手の届かないところに置く 誤飲の原因になります。万一飲み込んだ場合は、すぐに医師にご相談ください。      誤った取り扱いをすると、人がけがをしたり、財産の損害が発生する内容を示しています。 業務用など家庭用以外の用途に使用しない 本製品は家庭用として設計されています。業務用など家庭用以外の用途に使用すると、火災などの原因になります。子どもなど取り扱いに不慣れな方だけで使わせたり、幼児に触れさせたりしない乗ったり寄りかかったりしない 感電やけがのおそれがあります。引きずって移動しない 畳や床に傷が付きます。長時間、風を直接体に当て続けない 健康を害するおそれがあります。動植物に直接風を当てない 害を与えるおそれがあります。本体に強い衝撃を与えない 故障して、火災・感電の原因になります。羽根・前面ガード・背面ガードを取り付けずに運転しない 火災・感電・けがの原因になります。羽根の注意ラベルを剥がさない 事故防止のため、法で定められた表示です。 水平で安定した床の上で使用する 不安定な場所で使用すると転倒して、けがや周囲の物品の破損の原因になります。カーテンや巻き上げひもなどを巻き込まない場所へ設置する 周囲の物品の破損やけがの原因になります。 電源プラグを抜くときは、電源コードを持たずに必ず電源プラグを持って引き抜く 電源コードが破損し、火災・感電の原因になります。長期間使わないときは、必ず電源プラグをコンセントから抜く 絶縁低下により、火災・感電の原因になります。 電池を入れるときは、極性表示（プラス+とマイナス−の向き）に注意し、正しく入れる 間違えると、破裂・液もれにより、火災やけが、周囲を汚損する原因になります。長期間使用しないときは電池を取り出しておく 液がもれて、火災やけが、周囲の汚損の原因になります。液がもれた場合は、電池ケースについた液をよく拭き取ってから、新しい電池を入れてください。万一、もれた液が体についたときは、水でよく洗い流してください。電池を金属製の小物類と一緒に携帯・保管しない ショートして液もれや破裂の原因になります。指定以外の電池は使用しない電池を絶対に充電しない 破裂・液もれにより、火災・けが・やけど、周囲を汚損する原因になります。 ",title:"安全上の注意",HTMLFileName:"【共】安全上の注意_guid-929c743b-75d3-5339-6cba-8c843ccbd68b_2.html"},{topicId:"guid-0450f7b4-42da-1485-569b-159b376bcc62",body:"各部のなまえ■前面  ❶ リモコン ❷ 前面ガード ❸ 本体 ❹ ベース ❺ リモコン受光部 ❻ 操作部（→詳細はこちら） ❼ つまみねじ ❽ 羽根 ❾ スピンナー  ■背面 ❿ 取っ手 ⓫ リモコンホルダー ⓬ 背面ガード ⓭ 電源プラグ ⓮ 電源コード   　関連ページ操作部リモコンについて ",title:"各部のなまえ",HTMLFileName:"各部のなまえ_guid-0450f7b4-42da-1485-569b-159b376bcc62_3.html"},{topicId:"guid-9679f807-b3ac-6dc1-5664-e2f348effc21",body:"操作部              ❶ 電源ボタン ボタンを押すと、電源 入/切ができます。 ❷ 切タイマーボタン・ランプ 2/4/8時間後に停止を予約します。設定した切タイマーのランプが点灯します。 ・長押しするとランプの消灯モードを設定/解除ができます。（→消灯モード・消音モード） ❸ モードボタン・ランプ おやすみ運転とリズム運転を選びます。設定したモードランプが点灯します。 ・ おやすみ運転（→おやすみ運転） 30分ごとに風量を下げます。 ・ リズム運転（→リズム運転） 強さを変化させて自然に近い風を再現します。 ❹ 風量ボタン・ランプ お好みの風量を選びます。設定した分の風量ランプが点灯します。 ❺ 首ふりボタン・ランプ 上下・左右の首ふりを設定します。設定した首ふりランプが点灯します。 ・長押しすると、操作音の消音モードを設定/解除ができます。（→消灯モード・消音モード）   　関連ページ各部のなまえリモコンについて ",title:"操作部",HTMLFileName:"操作部_guid-9679f807-b3ac-6dc1-5664-e2f348effc21_4.html"},{topicId:"guid-a12a5687-7cef-e873-fb51-bc7cacf7ea8a",body:"リモコンについて電池の交換方法はこちらから → 電池の交換方法   使用開始前に電池の保護シートを引き抜いてください。 リモコンの赤外線発光部を、本体正面のリモコン受光部に向けて操作してください。   　   ❶ 赤外線発光部 ❷ 電源ボタン 前回使用したモードで運転が始まります。運転中に押すと運転を停止し電源が切れます。 ❸ 風量ボタン 運転中にお好みの風量を選んでください。 ❹ 左右・上下首ふりボタン 左右・上下の首ふりのオン／オフを切り替えます。 ❺ おやすみ運転ボタン おやすみ運転に切り替えます。 ❻ リズム運転ボタン リズム運転に切り替えます。 ❼ タイマーボタン 切タイマーの時間を設定します。解除するには、同じボタンをもう一度押してください。 ❽ ランプ消灯ボタン ランプの消灯モードを設定/解除できます。 ❾ 消音ボタン 操作音の消音モードを設定/解除できます。  － 電池の交換方法操作範囲がせまくなったり、操作ボタンを押しても動作しない場合は、新しい電池（CR2025）に交換してください。 電池を誤って取り扱うと、破裂・液漏れ・やけど・周囲の汚損の原因になります。「電池についての注意 」をよく読んで使用してください。   1電池ケースを引き抜くつめを矢印方向へ押さえながら、引き抜いてください。2新しい電池をセットする正しい向きにセットし、リモコン本体に差し込んでください。    電池の表裏を間違えないでください。使い終わった電池は、電池のパッケージに記載された廃棄方法、またはお住まいの自治体の取り決めにしたがって廃棄してください。  　関連ページ各部のなまえ操作部 ",title:"リモコンについて",HTMLFileName:"リモコンについて_guid-a12a5687-7cef-e873-fb51-bc7cacf7ea8a_5.html"},{topicId:"guid-e3731bdd-3244-b882-5106-b7f0b191fc7a",body:"設置場所－設置についての注意 直射日光やエアコン・暖房器具の温風が当たらないところに設置してください。 変形・変色したり、誤動作したりすることがあります。ラジオやテレビに近づけないでください。 ラジオやテレビにノイズが入る場合があります。水平で安定した床の上でご使用ください。カーテンや巻き上げひもなどを巻き込まない場所へ設置してください。 周囲の物品の破損やけがの原因になります。  －効果的な使いかた ※サーキュレーターのイラストは参考例です。   ■冷房時に清涼感をアップエアコンを背にして、下にたまる冷たい空気を循環させると、 気流ができて清涼感がアップします。    ■暖房時に足元を暖める部屋の角（エアコン）に風を送って、上にたまる 暖かい空気を循環させ、足元を暖めます。    ■循環させて温度むらを減少天井に風を送って空気を循環させ、 部屋の空気の温度むらを少なくします。    ■屋外・屋内の空気を換気屋外の空気を取り込んだり、屋内の空気を排出します。    ■隣の部屋の空気を循環二間続きの部屋の空気を循環させます。    ■風を当てて洗濯物の乾燥に直接風を当てることで乾きが早くなります。   ",title:"設置場所",HTMLFileName:"設置場所_guid-e3731bdd-3244-b882-5106-b7f0b191fc7a_6.html"},{topicId:"guid-1121721f-839f-7eca-45ff-7a0925a1a1ea",body:"使いかたご使用前に前面ガードを外し、スピンナーとつまみねじ(3か所)がしっかり締まっていることを確認してください。 →「前面ガード・羽根・背面ガードの取り外しかた」はこちら   1電源プラグをコンセントに差し込む 2本体の  またはリモコンの  を押すピッと鳴って、運転が始まります。※電源プラグを抜かずに再度電源を入れた場合、前回使用したモードで運転が始まります。 3本体の  またはリモコンの  を押してお好みの風量を選ぶ  －運転を停止するには本体の  またはリモコンの  を押してください。 ピーッと鳴って運転が停止し、電源が切れます。 電源プラグを抜くと、前回使用した設定はリセットされます。   　関連ページおやすみ運転リズム運転首ふり切タイマー設定消灯モード・消音モード ",title:"使いかた",HTMLFileName:"使いかた_guid-1121721f-839f-7eca-45ff-7a0925a1a1ea_7.html"},{topicId:"guid-fbeee07b-efc3-b1eb-7d44-ecd106a07461",body:"おやすみ運転30分ごとに風量を下げ、弱を継続します。 本体の  を1回押す、またはリモコンの  を押すと、ピッと鳴っておやすみランプが点灯し、おやすみ運転になります。 通常運転時の風量から、30分ごとに1段階ずつ風量が下がります。 弱まで下がると、弱が継続されます。 例）強の状態でおやすみ運転を開始した場合は、60分後に弱になります。おやすみ運転中はランプが減光モードになります。 消灯したい場合は、消灯モードを設定してください。（→消灯モード・消音モード）おやすみ運転中に本体の  またはリモコンの  を押すと風量を調節できます。 この場合、調節後から30分ごとに風量が1段階ずつ下がります。  －通常の運転に戻すには本体の  を2回押す、またはリモコンの  を押すと、ピピッと鳴って、通常の運転になります。（モードを切り替える前の風量で運転します。）   　関連ページ使いかたリズム運転首ふり切タイマー設定消灯モード・消音モード ",title:"おやすみ運転",HTMLFileName:"おやすみ_guid-fbeee07b-efc3-b1eb-7d44-ecd106a07461_8.html"},{topicId:"guid-dba8e1dc-7a47-f083-a828-6099c236fbb9",body:"リズム運転強さをゆっくり変化させて「自然に近い風」を再現します。 本体の  を2回押す、またはリモコンの  を押すと、ピッと鳴ってリズムランプが点灯し、リズム運転になります。 リズム運転中に風量の調節はできません。  －通常の運転に戻すには再度本体の  を1回押す、またはリモコンの  を押すと、ピピッと鳴って、通常の運転になります。（モードを切り替える前の風量で運転します。）   　関連ページ使いかたおやすみ運転首ふり切タイマー設定消灯モード・消音モード ",title:"リズム運転",HTMLFileName:"リズム_guid-dba8e1dc-7a47-f083-a828-6099c236fbb9_9.html"},{topicId:"guid-eda47ca7-657b-bc7b-fdd1-320496ddb1ba",body:"首ふり本体の  またはリモコンの  を押すと、ランプが点灯して左右・上下の首ふりを設定できます。 左右・上下両方のランプが点灯すると、左右と上下の首ふりが、同時に動作します。 本体の  を押すと、以下のように切り替わります。    手動で角度を変えることはできません。必ず首ふりボタンで、首ふり→停止の操作をして角度を変えてください。 －左右首ふり    －上下首ふり    　関連ページ使いかたおやすみ運転リズム運転切タイマー設定消灯モード・消音モード ",title:"首ふり",HTMLFileName:"首ふり_guid-eda47ca7-657b-bc7b-fdd1-320496ddb1ba_10.html"},{topicId:"guid-4b5736bb-4b4b-6e5d-df0a-185ff78ad329",body:"切タイマー設定本体の  を押すごとに、ピッと鳴って、次のようにランプが切り替わり、タイマーがスタートします。   　   リモコンの  で希望の時間を押しても設定できます。 解除するときは同じボタンをもう一度押してください。本体の切タイマーランプが消灯します。設定した時間が経過すると、ピーッと鳴って運転が停止し、電源が切れます。  　関連ページ使いかたおやすみ運転リズム運転首ふり消灯モード・消音モード ",title:"切タイマー設定",HTMLFileName:"切タイマー設定_guid-4b5736bb-4b4b-6e5d-df0a-185ff78ad329_11.html"},{topicId:"guid-fde0d0ae-5d04-d289-72c3-99bbd1f90ae2",body:"消灯モード・消音モード－消灯モード本体の  を長押し、またはリモコンの  を押すと消灯モードを設定できます。 なお、操作中は点灯し、最後の操作から10秒後に消灯します。 再度本体の  を長押し、またはリモコンの  を押すと、消灯モードを解除できます。   －消音モード 本体の  を長押し、またはリモコンの  を押すと消音モードを設定できます。 再度本体の  を長押し、またはリモコンの  を押すと、消音モードを解除できます。   　関連ページ使いかたおやすみ運転リズム運転首ふり切タイマー設定 ",title:"消灯モード・消音モード",HTMLFileName:"消灯・消音設定_guid-fde0d0ae-5d04-d289-72c3-99bbd1f90ae2_12.html"},{topicId:"guid-f5271746-0bdc-b74e-79b7-d68afd632b57",body:"前面ガード・羽根・背面ガードの取り外しかたほこりなどが付いたまま使用すると、故障の原因になります。 汚れ具合を見て、定期的にお手入れしてください。 お手入れするときは、必ず電源を切り、電源プラグをコンセントから抜いてください。使用直後はモーターが熱くなっています。冷めたことを確認してからお手入れしてください。  前面ガード・羽根・背面ガードの取り外しかた 1．前面ガード：ロック解除アイコンに合わせて前面ガードを取り外してください。     2．羽根：スピンナーを時計回りに回して取り外し、羽根を取り外してください。    3．背面ガード：つまみねじ（3か所）を取り外し、背面ガードを取り外してください。 ※つまみねじがかたい場合は、コインなどで取り外してください。   取り付ける際は取り外しと逆の順番で取り付けてください。   　関連ページお手入れ方法 ",title:"前面ガード・羽根・背面ガードの取り外しかた",HTMLFileName:"前面ガード・背面ガードの取り外しかた_guid-f5271746-0bdc-b74e-79b7-d68afd632b57_13.html"},{topicId:"guid-3ebf6f0f-039f-6927-7021-9ab94a20a67b",body:"お手入れ方法お手入れに、シンナー・アルコール・ベンジン・アルカリ性洗剤・漂白剤などを使用しないでください。変色・変形・変質・破損・故障の原因になります。   前面ガード・羽根・背面ガードの取り外しかた・取り付けかたはこちらからご確認ください。 →前面ガード・羽根・背面ガードの取り外しかた   ■本体内側掃除機でごみを取り除く （取り切れないところは、柔らかい布などで拭く）     ■本体外側・前面ガード・背面ガード・羽根・スピンナー柔らかい布でから拭きする （汚れが落ちにくいときは、薄めた中性洗剤を含ませた布で拭いたあと、かたくしぼった布などで洗剤分を拭き取る）   前面ガード・背面ガード・羽根・スピンナーは、汚れがひどいときは水洗いすることができます。 水洗いしたあとは、よく乾燥させてください。  ",title:"お手入れ方法",HTMLFileName:"お手入れ方法_guid-3ebf6f0f-039f-6927-7021-9ab94a20a67b_14.html"},{topicId:"guid-42606e04-0e2b-f439-79a1-a1fb872b0825",body:"故障かな？と思ったら使用中に異常が生じた場合は、修理を依頼される前に本書をよくお読みのうえ、以下の点を確認してください。   －運転しない →電源プラグがコンセントに正しく差し込まれていない可能性があります 電源プラグをコンセントに確実に差し込んでください。（→使いかた）   －リモコンで操作できない →リモコンの電池が消耗している可能性があります 新しい電池に交換してください。（→電池の交換方法） →電池の向きが間違っている可能性があります 電池を正しい向きにセットしてください。（→電池の交換方法） →リモコンの保護シートが引き抜かれていない可能性があります 保護シートを引き抜いてください。（→リモコンについて） →リモコン受光部とリモコンの間に障害物がありませんか？ 障害物を取り除いてください。 　 →リモコンが正しい方向を向いていない可能性があります 5m以内の距離で、リモコンの発光部を本体正面のリモコン受光部に向けて操作してください。 　 －他の製品のリモコンで作動する →他の製品のリモコンで作動する場合があります 反応する他の製品と離して使用してください。  －風量が少ない →ほこりがたまっていませんか？ お手入れし、ほこりを取り除いてください。（→お手入れ方法）   －風量の調節ができない －勝手に弱くなったり、強くなったりする →リズム運転になっていませんか？ 設定を確認してください。（→リズム運転）   －運転音が大きい →設置が悪くがたついている可能性があります 水平で安定した場所に設置してください。（→設置場所） →前面ガード・背面ガードがはまっていない可能性があります 前面ガード・背面ガードを正しく取り付けてください。（→前面ガード・羽根・背面ガードの取り外しかた） →スピンナーとつまみねじがゆるんでいませんか？ スピンナー・つまみねじをしっかり締めてください。（→前面ガード・羽根・背面ガードの取り外しかた）   －首ふり時にカタコト音がする →首ふり運転時にモーター特有の音が大きくなることがあります 異常ではありません。   －羽根が回らない、羽根の回転が遅い →羽根にごみがたまっていませんか？ 羽根をお手入れして、ごみを取り除いてください。（→お手入れ方法）   －前面ガード・羽根・背面ガードの取り外し・取り付けができない →「前面ガード・羽根・背面ガードの取り外しかた」をご確認ください。   －運転中、すべてのランプが消えている →ランプの消灯モードが設定されていませんか？ 本体の  を長押しするか、リモコンの  を押してください。（→消灯モード・消音モード）   －ランプの明るさが暗い（暗くなった） →おやすみ運転になっていませんか？ おやすみ運転中はランプが減光します。   －ランプが点灯してすぐに消える →ランプの消灯モードが設定されていませんか？ 本体の  を長押しするか、リモコンの  を押してください。（→消灯モード・消音モード）   －操作音がしなくなった・電源を入れてもピッと音がしない →消音モードが設定されていませんか？ 本体の  を長押しするか、リモコンの  を押してください。（→消灯モード・消音モード）   －背面ガードの穴にねじが入っていない →穴はありますが、部品不足ではありません。    それでも解決できないときは お買い上げの販売店、またはアイリスコール（ 電話をかける）へお問い合わせください。ご自分で分解・修理・改造はしないでください。  長年ご使用のサーキュレーターの点検を！ 愛情点検こんな症状はありませんか ボタンを押しても何も反応しない羽根が回るときに異常な音がする羽根が回るときにスピードが不規則に変化する電源コードが折れ曲がったり、破損したりしている電源コードに触れると電源が切れたり入ったりする焦げたようなにおいがするご使用中止故障や事故防止のため、使用を中止し、電源プラグを抜いて、お買い上げの販売店またはアイリスコール（  電話をかける） に点検をご依頼ください。  ",title:"故障かな？と思ったら",HTMLFileName:"故障かな？と思ったら_guid-42606e04-0e2b-f439-79a1-a1fb872b0825_15.html"},{topicId:"guid-0a19347c-0d1f-c73c-0e27-480e6398c536",body:"保管のしかた長期間使用しない場合は、本体にポリ袋などをかぶせて、直射日光の当たらない湿気の少ない場所に保管してください。    ",title:"保管のしかた",HTMLFileName:"保管のしかた-copy_guid-0a19347c-0d1f-c73c-0e27-480e6398c536_16.html"},{topicId:"guid-12f328b5-c26a-c74d-ec9b-33134bfc212d",body:"廃棄について製品や梱包材の廃棄については、お住まいの自治体の取り決めにしたがって処理してください。    ",title:"廃棄について",HTMLFileName:"廃棄について_guid-12f328b5-c26a-c74d-ec9b-33134bfc212d_17.html"},{topicId:"guid-31a2f488-2e75-330a-1ad2-2c7a9f1422f6",body:"長期使用製品について経年劣化による発火・けがなどの事故に至るおそれがあることを注意喚起するために、電気用品安全法で義務付けられた以下の内容を、製品本体に表示しています。 【製造年】 【設計上の標準使用期間】   ■ 設計上の標準使用期間についてJIS基準に基づく標準的な使用条件下で使用した場合に、安全上支障なく使用することができる標準的な期間を、製品本体に表示してあります。 環境条件電圧AC100V周波数50/60Hz温度30℃湿度65%設置本書に基づく設置負荷条件本製品の最大定格での運転想定時間運転時間8h/日運転回数5回/日運転日数110日/年スイッチ操作回数550回/年  製品の劣化や故障は様々な要因に影響されます。表記の標準使用期間に満たないときでも、異常が見られたときには、ただちに使用を中止し、お買い上げの販売店またはアイリスコール（ 電話をかける）にご相談ください。        ",title:"長期使用製品について",HTMLFileName:"長期使用製品について_guid-31a2f488-2e75-330a-1ad2-2c7a9f1422f6_18.html"},{topicId:"guid-3694bae4-bc05-5077-3acb-282da9c9e27f",body:"仕様定格電圧AC100V定格周波数50／60Hz定格消費電力38／35W適用床面積（目安）※118畳電源コード長さ約1.4m製品寸法（本体）幅210×奥行210×高さ309㎜（電源コード含まず）製品質量約1.8kg※1 適用床面積は目安です。室温などの環境や建物の構造によっても異なります。 ※ 製品の仕様は予告なく変更することがあります。  ",title:"仕様",HTMLFileName:"仕様_guid-3694bae4-bc05-5077-3acb-282da9c9e27f_19.html"},{topicId:"guid-04d468b8-0885-84ed-552a-c89776b92220",body:"保証とアフターサービス－保証書 お買い上げの際に、所定の事項が記入されている保証書をお買い上げの販売店より必ずお受け取りください。 保証書がないと、保証期間内でも代金を請求させていただく場合がありますので、大切に保管してください。 保証書は「かんたん操作ガイド」の裏面にあります。  －保証期間保証期間は、保証書に記載されています。 保証期間内に故障した場合は、保証規定にしたがって修理させていただきます。 ただし、一般家庭以外でのご使用など、保証期間内においても無償保証の対象外になる場合がございます。 詳しくは保証規定を参照ください。  －保証期間経過後の修理お買い上げの販売店またはアイリスコール（ 電話をかける）にご相談ください。 修理により製品の機能が維持できる場合は、ご要望により有料にて修理いたします。   －補修用性能部品の保有期間について当社はこの製品の補修用性能部品を製造打ち切り後、8年間保有しています。 性能部品とは、その製品の機能を維持するために必要な部品です。  －アフターサービスについてご不明な点はお買い上げの販売店またはアイリスコール（ 電話をかける）にお問い合わせください。  ",title:"保証とアフターサービス",HTMLFileName:"保証とアフターサービス_guid-04d468b8-0885-84ed-552a-c89776b92220_20.html"},{topicId:"guid-1d7a5e87-6ecb-7b5e-b60b-0633dc4ee12a",body:"保証規定取扱説明書、本体貼付ラベルなどの注意書きにしたがった正常な使用状態で故障及び損傷した場合には、弊社が無料にて修理または交換いたします。  保証期間内に、故障などによる無料修理をお受けになる場合には、お買い上げの販売店にて、保証書をご提示のうえ、修理をご依頼ください。  保証内容は本製品自体の無料修理に限ります。保証期間内においても、その他の保証はいたしかねます。  ご転居や贈答品などで保証書に記入してある販売店に修理をご依頼になれない場合には、アイリスコール（  電話をかける）にお問い合わせください。  保証期間内におきましても次の場合には有料修理になります。 ① 使用上の誤り、不当な修理、改造などによる故障及び損傷 ② お買い上げ後の落下などによる故障及び損傷 ③ 火災、地震、その他の天災地変による故障及び損傷 ④ 一般家庭用以外（たとえば業務用の長時間使用、車両・船舶への搭載など）に使用された場合の故障及び損傷 ⑤ お買い上げ後の移動、輸送または什器・備品などとの接触による故障及び損傷 ⑥ 保証書の提示がない場合 ⑦ 保証書にお買い上げ年月日、お客様名、販売店名の記入のない場合、あるいは字句を書き換えられた場合  保証書は日本国内においてのみ有効です。  保証書は再発行いたしませんので紛失しないよう大切に保管してください。 ",title:"保証規定",HTMLFileName:"保証規定_guid-1d7a5e87-6ecb-7b5e-b60b-0633dc4ee12a_21.html"},{topicId:"guid-b5b6b698-ce40-b6ce-592c-8ea52994eb3e",body:"お問い合わせお問い合わせについてはこちら●お問い合わせの際は、製品の型番をお調べいただき、取扱説明書・購入履歴の分かるもの・メモのご用意をお願いします。製品に関するお問い合わせアイリスコール：0120-311-564（通話料無料） 9:00～17:00（年末年始・会社都合による休日を除く）   修理に関するお問い合わせ修理専用コール：0800-170-7070（通話料無料） 9:00～17:00（年末年始・会社都合による休日を除く）   お客様サポートはこちら  https://www.irisohyama.co.jp/support/  専用パーツはこちら  https://www.irisohyama.co.jp/support/parts/  製品の最新情報はこちらhttps://www.irisohyama.co.jp/",title:"お問い合わせ",HTMLFileName:"お問い合わせ_小型生活家電共通_guid-b5b6b698-ce40-b6ce-592c-8ea52994eb3e_22.html"}]