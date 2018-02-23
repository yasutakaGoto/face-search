var s3BucketName = env.s3Bucket
var s3RegionName = env.s3Region
var collectionId = env.collectionId

AWS.config.update({
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
    region: s3RegionName
});

var rekognition = new AWS.Rekognition({
    region: s3RegionName
});

var s3 = new AWS.S3({
    params: {
        Bucket: s3BucketName,
        Region: s3RegionName
    }
});

$('#imgFile').change(function(){
  $('#loading_wall').css('display', 'block')
  $('#input_box').hide()
  uploadFile();
});

/********************************/
// Rekognition-画像認識(元画像と似ている画像を探す)
/********************************/
var searchImg = function (imgFile) {

    var params = {
        CollectionId: collectionId,
        Image: {
            S3Object: {
                Bucket: s3BucketName,
                Name: imgFile
            }
        },
        FaceMatchThreshold: 70.0,  //これより信頼度の低いものは返さない
        MaxFaces: 1  //マッチした画像を返す最大数
    };
    rekognition.searchFacesByImage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            showImgs(data);
        }
    });
}

/********************************/
//画像表示処理(画像認識結果)
/********************************/
function showImgs(data) {
  
    var result_html ="";
    
    if (data.FaceMatches.length > 0) {
    
      var image_id = data.FaceMatches[0].Face.ExternalImageId

      //URL取得
      var paramsSource = {
          Bucket: s3BucketName,
          Key: image_id
      };
      
      // s3から画像URLを取得
      var sourceUrl = s3.getSignedUrl('getObject', paramsSource);
      
      // プロフィールデータの取得
      var profile = getProfile(image_id.slice(0, -4))
      
      result_html += "<p class='name_line'><span class='name'>" + profile["LastName"] + " " + profile["FirstName"] + " " + "</span><span class='name_kana'>" + profile["LastNamePhonetic"] + " " + profile["FirstNamePhonetic"] + "</span></p>"
        + "<dl><dt>信頼度</dt><dd>" + Math.floor(data.FaceMatches[0].Similarity) + "%</dd></dl>"
        + "<dl><dt>社員番号</dt><dd>" + profile["EmployeeID"] + "</dd></dl>"
        + "<dl><dt>性別</dt><dd>" + profile["Gender"] + "</dd></dl>"
        + "<dl><dt>年齢</dt><dd>" + profile["Age"] + "歳</dd></dl>"
        + "<dl><dt>所属</dt><dd>" + profile["Development"] + " " + profile["Team"] + "</dd></dl>"
        + "<dl><dt>雇用区分</dt><dd>" + profile["HieredSegment"] + "</dd></dl>"
        + "<dl><dt>役職</dt><dd>" + profile["Post"] + "</dd></dl>"
        + "<dl><dt>生年月日</dt><dd>" + profile["BirthDay"] + "</dd></dl>"
        + "<dl><dt>勤続年数</dt><dd>" + profile["Term"] + "年</dd></dl>"
        + "<dl><dt>資格</dt><dd>" + profile["Qualification"] + "</dd></dl>";
        + "<dl><dt>電話番号</dt><dd>" + profile["Phone"] + "</dd></dl>"
        + "<dl><dt>メールアドレス</dt><dd>" + profile["Email"] + "</dd></dl>"

      $("#facepic").attr({'src': sourceUrl});
      $("#search_result_inner .profile-detail").append(result_html);
      
      $('#facepic').bind("load", function(){
        $("#loading_wall").hide();
      })

    } else {
      result_html += "<div class='err_msg'><p>該当者が見つかりません。</p><p class='err_detail'>※認証の信頼度が70%未満です。</p></div>"
      $("#search_result_inner").append(result_html);
      $("#loading_wall").hide();
    }
}

/********************************/
//S3アップロード
/********************************/
function uploadFile() {
    
  //s3オブジェクトのキー名。ユニークになるように現在時刻を付与
  var keyName = 'search_' + $.now();
  var file = $('#imgFile').prop('files')[0];  
    
  var params = {
   Bucket: s3BucketName,
   Key: keyName,
   Body: file,
   ContentType: "image/jpeg",
  };
    
  s3.putObject(params, function(err, data) {
    if(err){
      console.log(err, err.stack);
    } else {
      searchImg(keyName);
    }
  });
    
}

/********************************/
//プロフィールデータ取得
/********************************/
function getProfile(image_id) {
  
  var data = getData()
  
  for (key in data){
    if(key == image_id){
      return data[image_id]
    }
  }
  
}

/********************************/
//データ
/********************************/
function getData() {
    
   return {
        "4": {
          "EmployeeID": 10054,
          "LastName": "宮田",
          "FirstName": "広輔",
          "LastNamePhonetic": "みやた",
          "FirstNamePhonetic": "こうすけ",
          "Gender": "男性",
          "Age": 35,
          "BirthDay": "1982/09/21",
          "Term": 8,
          "HieredSegment": "正社員",
          "Development": "営業本部",
          "Team": "第2グループ",
          "Post": "一般",
          "Qualification": "実用英語技能検定3級",
          "Phone": "090-6724-853X",
          "Email": "kosuke.miyata@demo.com"
        },
        "12": {
          "EmployeeID": 10119,
          "LastName": "川内",
          "FirstName": "江梨子",
          "LastNamePhonetic": "かわうち",
          "FirstNamePhonetic": "えりこ",
          "Gender": "女性",
          "Age": 24,
          "BirthDay": "1993/09/21",
          "Term": 3,
          "HieredSegment": "正社員",
          "Development": "マーケティング本部",
          "Team": "WEBマーケティンググループ",
          "Post": "一般",
          "Qualification": "普通自動車免許",
          "Phone": "090-4422-123X",
          "Email": "eriko.kawauchi@demo.com"
        },
        "goto": {
          "EmployeeID": 10054,
          "LastName": "宮田",
          "FirstName": "広輔",
          "LastNamePhonetic": "みやた",
          "FirstNamePhonetic": "こうすけ",
          "Gender": "男性",
          "Age": 35,
          "BirthDay": "1982/09/21",
          "Term": 8,
          "HieredSegment": "正社員",
          "Development": "営業本部",
          "Team": "第2グループ",
          "Post": "一般",
          "Qualification": "実用英語技能検定3級",
          "Phone": "090-6724-853X",
          "Email": "kosuke.miyata@demo.com"
        },
        "nakano": {
          "EmployeeID": 10011,
          "LastName": "中野",
          "FirstName": "将太",
          "LastNamePhonetic": "なかの",
          "FirstNamePhonetic": "しょうた",
          "Gender": "男性",
          "Age": 30,
          "BirthDay": "1987/09/21",
          "Term": 6,
          "HieredSegment": "派遣社員",
          "Development": "総務部",
          "Team": "第1グループ",
          "Post": "一般",
          "Qualification": "簿記3級",
          "Phone": "090-9942-007X",
          "Email": "shota.nakano@demo.com"
        }
    }
}
