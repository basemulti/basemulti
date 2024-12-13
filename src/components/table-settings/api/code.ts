import { url } from "@/lib/utils";

export function getData({
  baseId,
  tableName
}: {
  baseId: string,
  tableName: string
}) {
  return [
    {
      name: "Shell",
      color: '#89e051',
      codes: [
        {
          name: "Bash",
          code: `curl --request GET \\
  --url '${url(`api/bases/${baseId}/tables/${tableName}/records`)}' \\
  --header 'x-bm-token: YOUR_API_TOKEN'`
        }
      ]
    },
    {
      name: "Typescript",
      color: '#007acc',
      codes: [{
        name: "fetch",
        code: `const options = {
  method: 'GET',
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

fetch('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }, {
        name: "axios",
        code: `import axios from 'axios';

const options = {
  method: 'GET',
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

axios('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }, {
        name: "ky",
        code: `import ky from 'ky';

const options = {
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

ky('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .json()
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }]
    },
    {
      name: "Javascript", color: '#f1e05a',
      codes: [{
        name: "fetch",
        code: `const options = {
  method: 'GET',
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

fetch('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }, {
        name: "axios",
        code: `import axios from 'axios';

const options = {
  method: 'GET',
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

axios('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }, {
        name: "Node.js",
        code: `const options = {
  method: 'GET',
  headers: {
    'x-bm-token': 'YOUR_API_TOKEN'
  }
};

fetch('${url(`api/bases/${baseId}/tables/${tableName}/records`)}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`
      }]
    },
    {
      name: "PHP", color: '#4f5d95',
      codes: [{
        name: "Default",
        code: `<?php
  
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "${url(`api/bases/${baseId}/tables/${tableName}/records`)}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
        "x-bm-token: YOUR_API_TOKEN"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo "cURL Error #:" . $err;
} else {
    echo $response;
}`
      }, {
        name: "Guzzle",
        code: `use GuzzleHttp\\Client;

$client = new Client();
$response = $client->request('GET', '${url(`api/bases/${baseId}/tables/${tableName}/records`)}', [
    'headers' => [
        'x-bm-token' => 'YOUR_API_TOKEN'
    ]
]);`
      }]
    },
    {
      name: "Python", color: '#3572a5',
      codes: [{
        name: "Requests",
        code: `import requests
  
url = "${url(`api/bases/${baseId}/tables/${tableName}/records`)}"

querystring = {}

headers = {"x-bm-token": "YOUR_API_TOKEN"}

response = requests.request("GET", url, headers=headers, params=querystring)

print(response.text)`
      }]
    },
    {
      name: "Ruby", color: '#701516',
      codes: [{
        name: 'Default',
        code: `require 'uri'
require 'net/http'
require 'openssl'

url = URI("${url(`api/bases/${baseId}/tables/${tableName}/records`)}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Get.new(url)
request["x-bm-token"] = 'YOUR_API_TOKEN'

response = http.request(request)
puts response.read_body`
      }]
    },
    {
      name: "Java", color: '#b07219',
      codes: [{
        name: 'Default',
        code: `HttpResponse<String> response = Unirest.get("${url(`api/bases/${baseId}/tables/${tableName}/records`)}")
  .header("x-bm-token", "YOUR_API_TOKEN")
  .asString();`
      }]
    },
    {
      name: "Go",
      color: '#00ADD8',
      codes: [{
        name: 'Default',
        code: `package main
  
import (
  "io/ioutil"
  "net/http"
  "net/url"
  "strings"
)

func main() {
  u, _ := url.Parse("${url(`api/bases/${baseId}/tables/${tableName}/records`)}")
  req, _ := http.NewRequest("GET", u.String(), nil)
  req.Header.Add("x-bm-token", "YOUR_API_TOKEN")
  client := &http.Client{}
  resp, _ := client.Do(req)
  body, _ := ioutil.ReadAll(resp.Body)
  fmt.Println(strings.ReplaceAll(string(body), "\n", ""))
}`
      }]
    },
    {
      name: "Rust",
      color: '#dea584',
      codes: [{
        name: 'Default',
        code: `use reqwest::blocking::Client;
use reqwest::header::HeaderMap;

let mut headers = HeaderMap::new();
headers.insert("x-bm-token", "YOUR_API_TOKEN".parse().unwrap());

let client = Client::builder()
    .default_headers(headers)
    .build();

let response = client.get("${url(`api/bases/${baseId}/tables/${tableName}/records`)}")
    .send()
    .unwrap();`
      }]
    },
  ];
}