from datetime import datetime
import pandas as pd
import json


def main():
	threshold = 3600 # one hour
	df = pd.DataFrame(columns=["hashtag", "count", "last_usage"])
	with open("tweets.json", "r") as json_file:
		data = json.load(json_file)
	for i in data:
		hashtag = i['text']
		time = i['time']
		indexes = df.loc[df['hashtag'] == hashtag].index.tolist()
		if len(indexes) != 0:
			timestring_last_usage = df.iloc[indexes[0]]['last_usage'][11:19]
			pt = datetime.strptime(timestring_last_usage, '%H:%M:%S')
			seconds_last_usage = pt.second + pt.minute*60 + pt.hour*3600

			timestring_actual = time[11:19]
			pt = datetime.strptime(timestring_actual, '%H:%M:%S')
			seconds_actual = pt.second + pt.minute*60 + pt.hour*3600

			diff = seconds_actual - seconds_last_usage
			if diff >= threshold:
				df.at[indexes[0], 'count'] = 1
				df.at[indexes[0], 'last_usage'] = time
			else:
				df.iloc[indexes[0]]['count'] += 1
				df.at[indexes[0], 'last_usage'] = time

		else:
			df = df.append({'hashtag': hashtag, 'count': 1, 'last_usage': time}, ignore_index=True)

	last_element = data[-1]
	last_time = last_element['time'][11:19]
	pt = datetime.strptime(last_time, '%H:%M:%S')
	seconds = pt.second + pt.minute*60 + pt.hour*3600

	for index, row in df.iterrows():
		timestring_last_usage = row['last_usage'][11:19]
		pt = datetime.strptime(timestring_last_usage, '%H:%M:%S')
		seconds_last_usage = pt.second + pt.minute*60 + pt.hour*3600
		diff = seconds - seconds_last_usage
		if diff >= threshold:
			df.at[index, 'count'] = 0

	df.sort_values(by=['count'], ascending = False, inplace = True)
	df.to_csv('dfHashtags.csv', index=False, sep='\t', mode='a')


if __name__ == "__main__":
	main()