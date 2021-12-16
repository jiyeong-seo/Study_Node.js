/** (1) 모듈 참조하기 */
const qs = require("querystring");
const url = require("url");

/** (2) URL에서 querystring 부분만 추출 */
// 분석할 URL에서 쿼리부분만 추출하기
const address = "p://www.itpaper.co.kr:8765/hello/world.html?a=123&b=456";
// 비구조화 할당
const { query } = url.parse(address);
console.debug(query);

/** (3) 추출한 querystring을 JSON객체로 변환 */
const mydata = qs.parse(query);
console.debug(mydata);
// URL에서 추출한 모든 변수는 string타입이다.
console.debug("요청 파라미터 중 a의 값 : %s (%s)", mydata.a, typeof mydata.a);
console.debug("요청 파라미터 중 b의 값 : %s (%s)", mydata.b, typeof mydata.b);

/** (4) JSON객체를 QueryString 문자열로 변환 */
// URL에 포함될 수 없는 글자는 자동으로 Encodin처리 함
const obj = { name: "hello", nick: "world", address: "서울시 서초구" };
const str = qs.stringify(obj);
console.log("조합된 요청 파라미터 : %s", str);
