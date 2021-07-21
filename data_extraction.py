import requests
import os
import json
import string

# To set environment variables in terminal run the following line:
os.environ['BEARER_TOKEN'] = 'AAAAAAAAAAAAAAAAAAAAACDsRAEAAAAAkR94dXh3%2F8b2LKp6IN5A6asIp44%3DjWLJi2cAAgS63GpWnVgZu4iMBOLj5wimdT8jKdDWw1Uwqt2Umx'

#os.environ['BEARER_TOKEN'] = 'AAAAAAAAAAAAAAAAAAAAAESKRQEAAAAAkGQXa7aXSm2m1qn6m%2BRCiwxbR5s%3DyVtu10NDjIHkIJcmC2EUrgXeLoJfnANzz8AOO3pi21quYBU6kp'


def create_headers(bearer_token):
    headers = {"Authorization": "Bearer {}".format(bearer_token)}
    return headers


def get_rules(headers):
    response = requests.get(
        "https://api.twitter.com/2/tweets/search/stream/rules?tweet.fields=created_at", headers=headers
    )
    if response.status_code != 200:
        raise Exception(
            "Cannot get rules (HTTP {}): {}".format(response.status_code, response.text)
        )
    print(json.dumps(response.json()))
    return response.json()


def delete_all_rules(headers, rules):
    if rules is None or "data" not in rules:
        return None

    ids = list(map(lambda rule: rule["id"], rules["data"]))
    payload = {"delete": {"ids": ids}}
    response = requests.post(
        "https://api.twitter.com/2/tweets/search/stream/rules?tweet.fields=created_at",
        headers=headers,
        json=payload
    )
    if response.status_code != 200:
        raise Exception(
            "Cannot delete rules (HTTP {}): {}".format(
                response.status_code, response.text
            )
        )
    print(json.dumps(response.json()))


def set_rules(headers):
    sample_rules = [
        {"value": "#euro2020 has:hashtags", "tag": "euro2020 hashtag"}
    ]
    payload = {"add": sample_rules}
    response = requests.post(
        "https://api.twitter.com/2/tweets/search/stream/rules?tweet.fields=created_at",
        headers=headers,
        json=payload,
    )
    if response.status_code != 201:
        raise Exception(
            "Cannot add rules (HTTP {}): {}".format(response.status_code, response.text)
        )
    print(json.dumps(response.json()))


def get_stream(headers):
    response = requests.get(
        "https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at", headers=headers, stream=True,
    )
    print(response.status_code)
    if response.status_code != 200:
        raise Exception(
            "Cannot get stream (HTTP {}): {}".format(
                response.status_code, response.text
            )
        )
    for response_line in response.iter_lines():
        if response_line:
            json_response = json.loads(response_line)
            print(json.dumps(json_response, indent=4, sort_keys=True))
            value = json_response['data']['id']
            with open('idsEuro2020.txt', 'a+') as file:
                file.seek(0)  # set position to start of file
                lines = file.read().splitlines()
                if value not in lines:
                    file.write(value + "\n")
                    hashtags = []
                    # filter for printable characters then
                    a = ''.join(filter(lambda x: x in string.printable, json_response['data']['text'].lower()))
                    for i in a.split(' '):
                        if i.startswith('#'):
                            hashtags.append(i.strip(','))
                    with open('hashtagsEuro2020.json', 'a',  encoding='utf-8') as outfile:
                        for tag in hashtags:
                            if tag != '#euro2020':
                                json.dump({'time': json_response['data']['created_at'], 'text': tag}, outfile, ensure_ascii=False, indent=2)
                                outfile.write(",")
                                outfile.write("\n")


def main():
    bearer_token = os.environ.get("BEARER_TOKEN")
    headers = create_headers(bearer_token)
    rules = get_rules(headers)
    delete_all_rules(headers, rules)
    set_rules(headers)
    get_stream(headers)


if __name__ == "__main__":
    main()