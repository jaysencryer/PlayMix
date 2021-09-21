const axios = require('axios');

const spotGet = async () => {
  const response = await axios.post(
    'https://api.spotify.com/v1/users/123543387/playlists',
    { name: 'test playlist' },
    {
      headers: {
        Authorization:
          'Bearer BQBIrKxuuTAvZnLXBUJ0oMnwqD-wBH27tmWMA64pXw4mI2Mz3joe5W1js_bA72pTa1toSYUvsd-Rw-wJsKjaG5Yb7Ja36fq1i2ii1O4VFzS6X_RuF4zB_sv59TmeYzVgmehCFvChg_oeb9eGKEZO4Qq0LTSuIhroynf0W9IqM64-q8_rAdoUtA4zmaSqkPRzg1ncRNHZTT_Ntqc',
      },
    },
  );
  console.log(response);
};

spotGet();
