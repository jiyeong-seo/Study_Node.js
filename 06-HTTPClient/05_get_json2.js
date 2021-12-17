const axios = require("axios");

const 접속주소 = "http://itpaper.co.kr/demo/covid19/now.php";

(async () => {
  let json = null;
  try {
    // axios를 활용하여 json 데이터 요청
    const response = await axios.get(접속주소);
    json = response.data;
  } catch (error) {
    const errorMessage = `[${error.response.status}] ${error.response.statusText}`;
    console.error(errorMessage);
    return;
  }

  let total = 0;

  json.state.map((v, i) => {
    const confirmed = v.confirmed - v.confirmed_prev;
    console.log(`[${v.region}] 확진자 : ${confirmed}`);
    total += confirmed;
  });

  console.log("오늘 총 확진자 수: %d", total);
})();
