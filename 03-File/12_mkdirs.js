// 사용자 정의 모듈
var fileHelper = require("../helper/FileHelper");
var path = require("path");

// 상대경로 방식으로 폴더 생성하기
// -> vscode가 열고 있는 프로젝트 폴더 기준.
var target1 = "./test/dir/make";
console.log(target1);
fileHelper.mkdirs(target1);

// 절대경로 방식으로 폴더 생성하기
// __dirname -> 이 소스파일이 위치하는 디렉토리의 절대경로 값
// __filename -> 이 소스파일이 위치하는 절대경로 값
var tartget2 = path.join(__dirname, "hello/node/js");
console.log(target2);
console.log(__dirname);
fileHelper.mkdirs(target2);
