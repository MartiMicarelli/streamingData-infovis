#import pandas as pd
import json

def main():
    #colnames = ['hashtag']
    #hashtags = pd.read_csv('df.csv', names=colnames, delimiter=' ').hashtag.tolist()
    #chosen_hashtags = hashtags[:10]
    #print(chosen_hashtags)
    chosen_hashtags = ['#vivoazzurro', '#azzurri', '#ita', '#mancini', '#rinascimentoazzurro', '#insigne', '#eng',
                       '#euro2020final', '#olimpiadetokyo2020', '#italy']
    with open('tweets.json', 'r') as json_file:
        data = json.load(json_file)
    with open('data.json', 'a', encoding='utf-8') as outfile:
        for i in data:
            if i['text'] in chosen_hashtags:
                json.dump({'time': i['time'], 'hashtag': i['text']}, outfile, ensure_ascii=False,indent=2)
                outfile.write(",")
                outfile.write("\n")

if __name__ == "__main__":
    main()