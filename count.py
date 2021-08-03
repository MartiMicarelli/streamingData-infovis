from datetime import datetime
import pandas as pd
import json


def main():
	threshold = 3600 # seconds for one hour
	# creation of an empty pandas dataframe
	df = pd.DataFrame(columns=["hashtag", "count", "last_usage"])
	# extraction of the tweets from the json file
	with open("tweets.json", "r") as json_file:
		data = json.load(json_file)
	# iteration on each json object
	for i in data:
		hashtag = i['text']
		time = i['time']
		# is the hashtag already present in the dataframe?
		indexes = df.loc[df['hashtag'] == hashtag].index.tolist()
		# if so, the necessary update is the following
		if len(indexes) != 0:
			# extraction of the time substring from the last_usage datetime string of the hashtag
			timestring_last_usage = df.iloc[indexes[0]]['last_usage'][11:19]
			# conversion in seconds
			pt = datetime.strptime(timestring_last_usage, '%H:%M:%S')
			seconds_last_usage = pt.second + pt.minute*60 + pt.hour*3600

			# extraction of the time substring from the datetime string of the current json object
			timestring_actual = time[11:19]
			# conversion in seconds
			pt = datetime.strptime(timestring_actual, '%H:%M:%S')
			seconds_actual = pt.second + pt.minute*60 + pt.hour*3600

			# calculation of the seconds' difference to see if it is necessary to reset the count for that hashtag
			diff = seconds_actual - seconds_last_usage
			# if necessary the new count will be 1
			if diff >= threshold:
				df.at[indexes[0], 'count'] = 1
				df.at[indexes[0], 'last_usage'] = time
			# if not necessary, the count is incremented by 1
			else:
				df.iloc[indexes[0]]['count'] += 1
				df.at[indexes[0], 'last_usage'] = time

		# if the hashtag was not present yet in the dataframe, append a new line
		else:
			df = df.append({'hashtag': hashtag, 'count': 1, 'last_usage': time}, ignore_index=True)

	# at the end, use the time string of the last object of the json file to see if any other count reset is necessary
	last_element = data[-1]
	last_time = last_element['time'][11:19]
	pt = datetime.strptime(last_time, '%H:%M:%S')
	seconds = pt.second + pt.minute*60 + pt.hour*3600

	for index, row in df.iterrows():
		timestring_last_usage = row['last_usage'][11:19]
		pt = datetime.strptime(timestring_last_usage, '%H:%M:%S')
		seconds_last_usage = pt.second + pt.minute*60 + pt.hour*3600
		diff = seconds - seconds_last_usage
		# if necessary, the count for that hashtag is reset
		if diff >= threshold:
			df.at[index, 'count'] = 0

	# the dataframe is then sorted in descending order
	df.sort_values(by=['count'], ascending = False, inplace = True)
	df.to_csv('dfHashtags.csv', index=False, sep='\t', mode='a')


if __name__ == "__main__":
	main()