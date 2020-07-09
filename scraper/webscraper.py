from datetime import datetime
import time

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import requests
import json
import mysql.connector
from mysql.connector import Error
from mysql.connector import errorcode
from login import host, database, user, password

model_names = []
beds = []
baths = []
min_prices = []
max_prices = []
min_sizes = []
max_sizes = []
waitlist = []
apt = []
available_units = []
links = []
deposits = []
images = []


def site_init(url):
    driver.get(url)
    time.sleep(2)


def insert_data(name, bed, bath, price, wait, unit, size, dep, link, apt_complex, image):
    model_names.append(name)
    if bed == 'Studio':
        bed = 0
    if name.find('Studio') > -1:
        bed = 0
    beds.append(bed)
    baths.append(bath)
    waitlist.append(wait)
    available_units.append(unit)
    deposits.append(dep)
    links.append(link)
    apt.append(apt_complex)
    images.append(image)
    if price == '':
        price = '0'
    if size == '':
        size = '0'
    if price.find("-") > -1:
        price = price.replace(" ", "")
        price = price.replace("$", "")
        price = price.replace(",", "")
        min_price = int(float(price[0:price.find("-")]))
        max_price = int(float(price[price.find("-")+1:]))
        min_prices.append(min_price)
        max_prices.append(max_price)
    else:
        price = price.replace("$", "")
        price = price.replace(" ", "")
        price = price.replace(",", "")
        price = int(float(price))
        min_prices.append(price)
        max_prices.append(price)

    if size.find("-") > -1:
        size = size.replace(" ", "")
        size = size.replace(",", "")
        min_size = int(float(size[0:size.find("-")]))
        max_size = int(float(size[size.find("-") + 1:]))
        min_sizes.append(min_size)
        max_sizes.append(max_size)
    else:
        size = size.replace(" ", "")
        size = size.replace(",", "")
        size = int(float(size))
        min_sizes.append(size)
        max_sizes.append(size)


def extract_26west():
    url = 'https://www.americancampus.com/student-apartments/tx/austin/26-west/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        size = '0'
        dep = 0
        units = ''
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        image = item.find_element_by_tag_name('img').get_attribute('src')
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        if wait.find('Waitlist') != -1:
            wait = 1
        else:
            wait = 0
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        if name.find('Studio') > -1:
            bed = 0
        apt_name = '26 West'
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_blockonpearl():
    #date = str(datetime.date(datetime.now()))
    #date = date[5:7] + '/' + date[8:10] + '/' + date[0:4]
    url = 'https://www.theblockwestcampus.com/floor-plans.aspx?beds=all&baths=all&moveindate=08/15/2020'
    site_init(url)
    time.sleep(20)
    models = driver.find_elements_by_class_name("rpfp-card")
    for item in models:
        units = item.get_attribute('data-availableunits')
        if units == '0':
            continue
        info = item.find_element_by_xpath('div/div[2]/div[2]')
        bed = info.find_element_by_xpath('span[1]/strong').get_attribute('innerHTML')
        if bed == 'Studio':
            bed = 0
        bed = int(bed)
        bath = info.find_element_by_xpath('span[2]/strong').get_attribute('innerHTML')
        size = info.find_element_by_xpath('span[3]/strong').get_attribute('innerHTML')
        qual_info = item.find_element_by_xpath('div/div[2]/div[1]')
        name = qual_info.find_element_by_xpath('div[1]').get_attribute('innerHTML')
        price = qual_info.find_element_by_xpath('div[2]').get_attribute('innerHTML')
        image = item.find_element_by_class_name('rpfp-image').get_attribute('style')
        image_start = image.find('(') + 2
        image_end = image.find(';') - 2
        image = image[image_start:image_end]
        link = item.find_element_by_class_name('rpfp-button').get_attribute('data-src')
        link = 'https://www.theblockwestcampus.com/' + link
        wait = 0
        dep = 0
        apt_name = "The Block"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_crestatpearl():
    url = 'https://www.americancampus.com/student-apartments/tx/austin/crest-at-pearl/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        units = ''
        size = '0'
        dep = 0
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        image = item.find_element_by_tag_name('img').get_attribute('src')
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        if wait.find('Waitlist') != -1:
            wait = 1
        else:
            wait = 0
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        if name.find('Studio') > -1:
            bed = 0
        apt_name = "Crest at Pearl"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_callaway():
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-callaway-house-austin/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        units = ''
        size = '0'
        price = '0'
        dep = 0
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]

        image = item.find_element_by_tag_name('img').get_attribute('src')
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        if wait.find('Waitlist') != -1:
            wait = 1
        else:
            wait = 0
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        if name.find('Studio') > -1:
            bed = 0
        apt_name = "The Callaway House"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_castilian():
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-castilian/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        units = ''
        size = '0'
        dep = 0
        price = '0'
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        image = item.find_element_by_tag_name('img').get_attribute('src')
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        if wait.find('Waitlist') != -1:
            wait = 1
        else:
            wait = 0
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        if name.find('Studio') > -1:
            bed = 0

        apt_name = "The Castilian"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_texan_vintage():
    url = 'https://www.americancampus.com/student-apartments/tx/austin/texan-and-vintage-west-campus/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        units = ''
        size = '0'
        dep = 0
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        image = item.find_element_by_tag_name('img').get_attribute('src')
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        if wait.find('Waitlist') != -1:
            wait = 1
        else:
            wait = 0

        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        if name.find('Studio') > -1:
            bed = 0
        apt_name = "Texan & Vintage"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)


def extract_riowest():
    url = 'https://www.rioweststudentliving.com/austin-austin-texas/rio-west-rio-west-student-apartments/'
    site_init(url)
    models = driver.find_elements_by_class_name("fp-group-list")
    for i in range(len(models)):
        models = driver.find_elements_by_class_name("fp-group-list")
        sections = models[i]
        size = len(sections.find_elements_by_class_name('fp-group-item'))
        for j in range(size):
            models = driver.find_elements_by_class_name("fp-group-list")
            sections = models[i]
            wait = 0
            units = ''
            curr = sections.find_element_by_xpath('li[' + str(j+1) + ']')
            name = curr.find_element_by_xpath('div/h4/a').get_attribute('innerHTML')
            bed = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bed = bed[0:bed.find('<')]
            bath = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bath = bath[(bath.find('/ ')+2):]
            bath = bath[0:bath.find('<')]
            dep = curr.find_element_by_xpath('div/div[2]/div[3]/span[2]').get_attribute('innerHTML')
            if dep[0] == '$':
                dep = int(dep[1:])
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')

            site_init(link)
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            rent = rent.replace('&nbsp;', ' ')
            if rent.find("<") > -1:
                rent = '0'
            image_holder = driver.find_element_by_class_name('galleria-images').find_element_by_xpath('div[2]')
            image = image_holder.find_element_by_tag_name('img').get_attribute('src')
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            apt_name = "Rio West"
            insert_data(name, bed, bath, rent, wait, units, feet, dep, link, apt_name, image)
            site_init(url)



def extract_skyloft():
    url = 'https://skyloftaustin.com/'
    site_init(url)
    frame = driver.find_element_by_id('website_678753')
    driver.switch_to.frame(frame)
    display_all = driver.find_element_by_class_name('btn')
    display_all.click()
    time.sleep(10)
    models = driver.find_elements_by_class_name("fp-group-list")
    print(len(models))
    for i in range(len(models)):
        models = driver.find_elements_by_class_name("fp-group-list")
        sections = models[i]
        size = len(sections.find_elements_by_class_name('fp-group-item'))
        for j in range(size):
            models = driver.find_elements_by_class_name("fp-group-list")
            sections = models[i]
            wait = 0
            units = ''
            curr = sections.find_element_by_xpath('li[' + str(j + 1) + ']')
            name = curr.find_element_by_xpath('div/h4/a').get_attribute('innerHTML')
            bed = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bed = bed[0:bed.find('<')]
            if bed.find('Studio') != -1:
                bed = 0
            bath = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bath = bath[(bath.find('/ ') + 2):]
            bath = bath[0:bath.find('<')]
            dep = curr.find_element_by_xpath('div/div[2]/div[3]/span[2]').get_attribute('innerHTML')
            if dep == 'N/A':
                dep = 0
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            site_init(link)
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').find_element_by_class_name('radio')
            rent = rent.find_element_by_tag_name('label').get_attribute('innerHTML')
            if rent.find('$') > -1:
                rent = rent[rent.rfind('$'):]
            image = driver.find_element_by_tag_name('img').get_attribute('src')
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            apt_name = "Skyloft"
            insert_data(name, bed, bath, rent, wait, units, feet, dep, link, apt_name, image)
            site_init(url)
            frame = driver.find_element_by_id('website_678753')
            driver.switch_to.frame(frame)
            display_all = driver.find_element_by_class_name('btn')
            display_all.click()
            time.sleep(5)


def extract_twentytwo15():
    url = 'https://www.2215west.com/Floor-plans.aspx'
    site_init(url)

    models = driver.find_elements_by_class_name('floorplan-block')
    for i in range(len(models)):
        models = driver.find_elements_by_class_name('floorplan-block')
        item = models[i]
        price = '0'
        units = ''
        wait = 0
        bed = item.get_attribute('data-bed')
        if bed == 'S':
            bed = 0
        bath = item.get_attribute('data-bath')
        sqft = item.get_attribute('data-sqft')
        name = item.get_attribute('data-floorplan-name')
        link_path = item.find_element_by_class_name('li_print').find_element_by_class_name('tip_down').get_attribute('onclick')
        link_path = link_path[link_path.find(" ")+1:]
        site_id = link_path[0:link_path.find(",")]
        link_path = link_path[link_path.find(",")+2:]
        model_id = link_path[0:link_path.find(",")]
        name = name.replace(" ", "-")

        temp_url = 'https://www.2215west.com/Brochure/' + name + '?siteId=' + site_id + '&fId=' + model_id
        site_init(temp_url)
        dep_path = driver.find_element_by_id('p_lt_zoneMiddleRight_WebPartLoader_ctl00_flpDetails')
        dep = dep_path.find_element_by_xpath('//ul/li[4]/span').get_attribute('innerHTML')
        dep = dep[dep.find(" ")+1:]
        if dep[0] == '$':
            dep = int(dep[1:])
        image_holder = driver.find_element_by_class_name('fpContent')
        image = None
        try:
            image = image_holder.find_element_by_tag_name('img').get_attribute('src')
        except NoSuchElementException:
            image = 'https://dubsism.files.wordpress.com/2017/12/image-not-found.png?w=768'
        apt_name = "Twenty Two 15"
        insert_data(name, bed, bath, price, wait, units, sqft, dep, temp_url, apt_name, image)
        site_init(url)


def extract_21rio():
    url = 'https://www.21rio.com/austin/21-rio/'
    site_init(url)
    tabs = driver.find_elements_by_class_name('fp-grid-list')
    for i in range(len(tabs)):
        tabs = driver.find_elements_by_class_name('fp-grid-list')
        items = tabs[i].find_elements_by_class_name('fp-grid-item')
        for j in range(len(items)):
            tabs = driver.find_elements_by_class_name('fp-grid-list')
            items = tabs[i].find_elements_by_class_name('fp-grid-item')
            name = items[j].find_element_by_class_name('fp-name-link').get_attribute('innerHTML')
            link = items[j].find_element_by_class_name('fp-name-link').get_attribute('href')

            site_init(link)
            bed = driver.find_element_by_class_name('beds').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            bath = driver.find_element_by_class_name('baths').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            size = driver.find_element_by_class_name('sq-feet').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            price = driver.find_element_by_class_name('radio').find_element_by_tag_name('label').get_attribute('innerHTML')
            price = price[price.find('$')+1:]
            image = driver.find_elements_by_class_name('galleria-image')
            wait = image
            print(len(image))
            if len(image) >= 1:
                image = image[len(image)-1].find_element_by_tag_name('img').get_attribute('src')
                wait = wait[len(wait)-1].find_element_by_tag_name('img').get_attribute('alt')
            else:
                image = image.find_element_by_tag_name('img').get_attribute('src')
                wait = wait.find_element_by_tag_name('img').get_attribute('alt')

            must_wait = None
            if wait.lower().find('waitlist') > -1:
                must_wait = 1
            else:
                must_wait = 0

            units = wait.lower()
            if units.find('less than') > -1:
                units = "<" + units[units.find('less than') + 10:]
            else:
                units = ''

            apt_name = "21 Rio"
            dep = 0
            insert_data(name, bed, bath, price, must_wait, units, size, dep, link, apt_name, image)
            site_init(url)


def extract_9rio():
    url = 'https://www.the9rio.com/floorplans/'
    site_init(url)
    models = driver.find_element_by_id('accordion').find_elements_by_class_name('card')
    for i in range(len(models)):
        models = driver.find_element_by_id('accordion').find_elements_by_class_name('card')
        item = models[i]
        available = item.find_element_by_class_name('card-link-text').get_attribute('innerHTML').lower()
        if available == 'sold out':
            continue

        link = item.find_element_by_class_name('card-link').get_attribute('href')

        site_init(link)
        relId = link[link.find('#')+1:]
        apts = driver.find_element_by_id(relId).find_elements_by_class_name('text-center')

        for j in range(len(apts)):
            isSold = apts[j].find_element_by_class_name('fp-notice').find_element_by_tag_name('span').get_attribute('innerHTML')
            if isSold.lower() == 'sold out':
                continue
            image = apts[j].find_element_by_class_name('fp-image').get_attribute('src')
            name = apts[j].find_element_by_class_name('fp-name').get_attribute('innerHTML')
            bed = apts[j].find_element_by_class_name('fp-beds').get_attribute('innerHTML')
            bed = bed[0:bed.find(" ")]
            bath = apts[j].find_element_by_class_name('fp-baths').get_attribute('innerHTML')
            bath = bath[0:bath.find(" ")]
            size = apts[j].find_element_by_class_name('fp-sqft').get_attribute('innerHTML')
            size = size[0:size.find(" ")]
            price = apts[j].find_element_by_class_name('fp-price').get_attribute('innerHTML')
            price = price[price.rfind("$")+1:price.rfind("/")]
            units = isSold[0:isSold.find(" ")]
            apt_name = "The Nine at Rio"
            wait = 0
            dep = 0
            insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image)

        site_init(url)


def connect():
    connection = None
    try:
        connection = mysql.connector.connect(host=host, database=database, user=user, password=password)
        if connection.is_connected():
            print('Connected to MySQL database')

        print("length issss: ", len(model_names))
        for i in range(len(model_names)):
            name = model_names[i]
            bed = beds[i]
            bath = baths[i]
            min_pr = min_prices[i]
            max_pr = max_prices[i]
            wait = waitlist[i]
            unit = available_units[i]
            min_si = min_sizes[i]
            max_si = max_sizes[i]
            dep = deposits[i]
            link = links[i]
            apartment = apt[i]
            image = images[i]
            args = (name, bed, bath, min_pr, max_pr, dep, wait, unit, min_si, max_si, link, apartment, image)
            mySql_insert_query = "INSERT INTO apartment_data (Name, Beds, Baths, MinPrice, MaxPrice, Deposits, Waitlist, Available_Units, MinSize, MaxSize, Link, Apartment, Image) \
             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor = connection.cursor()
            cursor.execute(mySql_insert_query, args)
            connection.commit()
            print(cursor.rowcount, "Record inserted successfully into Apartment table")
            cursor.close()

    except Error as e:
        print(e)

    finally:
        if connection is not None and connection.is_connected():
            connection.close()
            print('Closed')


# def insert(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
#


#     for i in range(len(model_names)):
#         name = model_names[i]
#         bed = beds[i]
#         bath = baths[i]
#         price = prices[i]
#         wait = waitlist[i]
#         unit = available_units[i]
#         size = sq_feet[i]
#         dep = deposits[i]
#         link = links[i]
#         apartment = apt[i]
#         args = (name, bed, bath, price, wait, unit, size, dep, link, apartment)
#         cursor = connection.cursor()
#         query = "INSERT INTO apartments_data(names, beds, baths, price, waitlist, available_units, sq_feet, link, apartment_name_id)" \
#         "VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)"


options = webdriver.ChromeOptions()
options.add_argument('headless')
driver = webdriver.Chrome("/mnt/c/Program Files (x86)/Google/Chrome/Application/chromedriver.exe")

extract_26west()
extract_blockonpearl()
extract_crestatpearl()
extract_callaway()
extract_castilian()
extract_texan_vintage()
extract_riowest()
extract_skyloft()
extract_21rio()
extract_9rio()
extract_twentytwo15()
driver.close()
connect()

# try:
#     connection = mysql.connector.connect(host='localhost',
#                                          database='apartments',
#                                          user='root',
#                                          password='password')
#     mySql_insert_query = """CREATE TABLE Apartments (
#                             Name varchar(255),
#                             Beds int,
#                             Baths int,
#                             Price double,
#                             Deposits int,
#                             Waitlist int,
#                             Available Units int,
#                             Size int,
#                             Link varchar(255)
#                         );"""
#

#
# except mysql.connector.Error as error:
#     print("Failed to insert record into Laptop table {}".format(error))
#
# finally:
#     if connection.is_connected():
#         connection.close()
#         print("MySQL connection is closed")

#df = pd.DataFrame({'Name': model_names, 'Beds': beds, 'Baths': baths, 'Price:': prices, 'Deposit': deposits,
#                   'Waitlist': waitlist, 'Available Units': available_units, 'Size (sq feet)': sq_feet, 'Link': links, 'Apartment': apt,
#                   'Image': images})
#df.to_csv('apartments.csv', index=False, encoding='utf-8')





