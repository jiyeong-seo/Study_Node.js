var fs = require("fs");
var target = "./docs";

if (!fs.existsSync(target)) {
  fs.mkdir(target, function (error) {
    if (error) {
      return console.lof(error);
    }
    // 생성된 폴더에 대한 퍼미션 설정
    fs.chmodSync(target, 0777);
    console.log("새로운 %s 폴더를 만들었습니다.", target);
  });

  console.log("%s 폴더의 생성을 요청했습니다", target);
} else {
  // 파일 삭제 -> 비어있지 않은 폴더는 삭제 못함
  fs.rmdir(target, function (err) {
    if (error) {
      return console.log(error);
    }
    console.log("%s 폴더를 삭제했습니다.", target);
  });

  console.log("%s 폴더의 삭제를 요청했습니다.", target);
}
