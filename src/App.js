import { useQuery, gql } from '@apollo/client';
import logo from './logo.svg';
import './App.css';

const GET_ACCOUNT = gql`
  query BasicAccountQuery {
    account {
      name
    }
  }
`;
// const authorizationCode = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMzgsImFwcF9pZCI6Ijc2YTViYzQ1LThiODEtNGI1NC1iNjAxLWExOTU4MzEzYzY3MSIsInNjb3BlcyI6IiIsImV4cCI6MTY4OTI4MjYwOH0.CZKcj_nIb1jrWZWqH0VUsiSl9NEp-VKlxq_Bs6P7Hlc";
const clientSecret = "7969b68752fd22a219744a56db95c45b92cddc33ce9ab0f98a8fc95db6ad24b3";
const clientId = "76a5bc45-8b81-4b54-b601-a1958313c671";

function App() {
  const { loading, error, data } = useQuery(GET_ACCOUNT);

  if (loading) return <p>Loading...</p>;
  if (error) {
    const authCodeFromStorage = localStorage.getItem('authCode');
    const authCodeExpiry = localStorage.getItem('authCodeExpiry');
    const queryParameters = new URLSearchParams(window.location.search);

    const nowDateTime = new Date();
    if ((!authCodeFromStorage || (authCodeExpiry && Date.parse(authCodeExpiry) < Date.parse(nowDateTime.toString()))) && !queryParameters.get("code")) {
      console.log("Removing from storage");
      localStorage.removeItem("authCode");
      localStorage.removeItem("authCodeExpiry");
      window.location.href = `http://localhost.test:3000/api/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:3002`;
    }

    if (queryParameters.get("code")) {
      const newAuthCodeExpiryDate = new Date();
      newAuthCodeExpiryDate.setHours(newAuthCodeExpiryDate.getHours() + 1);
      localStorage.setItem("authCode", queryParameters.get("code"));
      localStorage.setItem("authCodeExpiry", newAuthCodeExpiryDate.toString());
    }

    const xmlHttp = new XMLHttpRequest();
    const authorizationURL = `http://localhost.test:3000/api/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${authCodeFromStorage}`
    xmlHttp.open( "POST", authorizationURL, false ); // false for synchronous request
    xmlHttp.send( null );
    if (xmlHttp.responseText.match(/access_token/)) {
      const responseWithAccessToken = JSON.parse(xmlHttp.responseText);
      localStorage.setItem('token', responseWithAccessToken["access_token"]);
    }

    return <p>Error : {error.message}</p>;
  }

  return (
    <div className="App">
      <div>Jobbler</div>
      <div>{`Account Name: ${JSON.stringify(data)}`}</div>
    </div>
  );
}

export default App;
