import json

def main():
	# using the 'count' function we discovered the following 10 most popular hashtags
    chosen_hashtags = ['#vivoazzurro', '#azzurri', '#ita', '#mancini', '#rinascimentoazzurro', '#insigne', '#eng',
                       '#euro2020final', '#olimpiadetokyo2020', '#italy']
    # extraction of the tweets' hashtags from the json file                  
    with open('tweets.json', 'r') as json_file:
        data = json.load(json_file)
    # creation of a new json file, to filter the tweets' hashtags of interest
    with open('data.json', 'a', encoding='utf-8') as outfile:
        for i in data:
            if i['text'] in chosen_hashtags:
                json.dump({'time': i['time'], 'hashtag': i['text']}, outfile, ensure_ascii=False,indent=2)
                outfile.write(",")
                outfile.write("\n")

if __name__ == "__main__":
    main()