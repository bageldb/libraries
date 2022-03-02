import requests

token = "REPLACE_ME!!!"

link = 'https://api.bagelstudio.co/api/public/collection/companies/items/5fa4180b49919e9e7a095389/image?imageSlug=logo'

files = {'imageLink':"https://dl.airtable.com/.attachments/6efaa93c7f0ae57a4bf5e05954436b25/4d75dc6e/webcam-115202041318PM.png"}
headers = {'Accept-Version':'v1', 'Authorization': 'Bearer ' + token}
r = requests.put(link, data=files, headers=headers)
print(r.status_code)
print(r.text)
print(r.headers)
