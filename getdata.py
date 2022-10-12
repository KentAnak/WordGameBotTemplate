
from urllib.request import urlopen
from bs4 import BeautifulSoup
import json

#The sample is a list of Japanese prime ministers.
#html = urlopen("https://trc-adeac.trc.co.jp/Html/SystemRef/nsd.html")
html = urlopen("Here's the source of the list you want to scrape")
bsObj = BeautifulSoup(html, "html.parser")

table = bsObj.findAll("table")[0]
rows = table.findAll("tr")

names=[]
for row in rows:
    cells = row.findAll(["td","th"])
    #名前は2列目
    names.append(cells[1].get_text())
#重複削除
uniquenames = set(names)
#指定ヘダー削除
uniquenames.remove('姓名')
uniquenames.remove('年号')
tmpdata=[]
for name in uniquenames:
    #全角空白削除
    tmpdata.append({"name":name.replace("　",""), "flag":0})

with open("./api/souri.json",'w',encoding='utf-8') as file:
    json.dump(tmpdata,file,indent=4,ensure_ascii=False)





