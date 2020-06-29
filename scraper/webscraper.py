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


def site_init(url):
    driver.get(url)
    time.sleep(2)


def extract_26west(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/26-west/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append(0)
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        image = item.find_element_by_tag_name('img').get_attribute('src')
        images.append(image)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('26_west')



def extract_blockonpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    #date = str(datetime.date(datetime.now()))
    #date = date[5:7] + '/' + date[8:10] + '/' + date[0:4]
    url = 'https://www.theblockwestcampus.com/floor-plans.aspx?beds=all&baths=all&moveindate=08/15/2020'
    site_init(url)
    time.sleep(20)
    driver.refresh()
    time.sleep(40)
    models = driver.find_elements_by_class_name("rpfp-card")
    for item in models:
        units = item.get_attribute('data-availableunits')
        if units == '0':
            continue
        available_units.append(units)
        info = item.find_element_by_xpath('div/div[2]/div[2]')
        bed = info.find_element_by_xpath('span[1]/strong').get_attribute('innerHTML')
        beds.append(bed)
        bath = info.find_element_by_xpath('span[2]/strong').get_attribute('innerHTML')
        baths.append(bath)
        feet = info.find_element_by_xpath('span[3]/strong').get_attribute('innerHTML')
        sq_feet.append(feet)
        qual_info = item.find_element_by_xpath('div/div[2]/div[1]')
        name = qual_info.find_element_by_xpath('div[1]').get_attribute('innerHTML')
        model_names.append(name)
        price = qual_info.find_element_by_xpath('div[2]').get_attribute('innerHTML')
        prices.append(price)
        apt.append('block_on_pearl')
        image = item.find_element_by_class_name('rpfp-image').get_attribute('style')
        image_start = image.find('(') + 2
        image_end = image.find(';') - 2
        image = image[image_start:image_end]
        images.append(image)
        link = item.find_element_by_class_name('rpfp-button').get_attribute('data-src')
        link = 'https://www.theblockwestcampus.com/' + link
        links.append(link)
        waitlist.append(0)
        deposits.append(0)


def extract_crestatpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/crest-at-pearl/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append(0)
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        image = item.find_element_by_tag_name('img').get_attribute('src')
        images.append(image)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('crest_at_pearl')


def extract_callaway(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-callaway-house-austin/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        prices.append('')
        deposits.append(0)
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        beds.append(bed)
        baths.append(bath)
        image = item.find_element_by_tag_name('img').get_attribute('src')
        images.append(image)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('callaway')


def extract_castilian(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-castilian/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append(0)
        prices.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        beds.append(bed)
        baths.append(bath)
        image = item.find_element_by_tag_name('img').get_attribute('src')
        images.append(image)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('castilian')


def extract_texan_vintage(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/texan-and-vintage-west-campus/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append(0)
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        image = item.find_element_by_tag_name('img').get_attribute('src')
        images.append(image)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('texan_and_vintage')


def extract_riowest(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
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
            waitlist.append(0)
            available_units.append('')
            apt.append('rio_west')
            curr = sections.find_element_by_xpath('li[' + str(j+1) + ']')
            name = curr.find_element_by_xpath('div/h4/a').get_attribute('innerHTML')
            model_names.append(name)
            bed = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bed = bed[0:bed.find('<')]
            beds.append(bed)
            bath = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bath = bath[(bath.find('/ ')+2):]
            bath = bath[0:bath.find('<')]
            baths.append(bath)
            dep = curr.find_element_by_xpath('div/div[2]/div[3]/span[2]').get_attribute('innerHTML')
            if dep[0] == '$':
                dep = int(dep[1:])
            deposits.append(dep)
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            links.append(link)

            site_init(links[len(links)-1])
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            rent = rent.replace('&nbsp;', ' ')
            if rent.find("<") > -1:
                rent = ''
            prices.append(rent)
            image_holder = driver.find_element_by_class_name('galleria-images').find_element_by_xpath('div[2]')
            image = image_holder.find_element_by_tag_name('img').get_attribute('src')
            images.append(image)
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            sq_feet.append(feet)
            site_init(url)


def extract_skyloft(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://skyloftaustin.com/'
    site_init(url)
    frame = driver.find_element_by_id('website_678753')
    driver.switch_to.frame(frame)
    display_all = driver.find_element_by_class_name('btn')
    display_all.click()
    time.sleep(2)
    models = driver.find_elements_by_class_name("fp-group-list")
    print(len(models))
    for i in range(len(models)):
        models = driver.find_elements_by_class_name("fp-group-list")
        sections = models[i]
        size = len(sections.find_elements_by_class_name('fp-group-item'))
        for j in range(size):
            models = driver.find_elements_by_class_name("fp-group-list")
            sections = models[i]
            waitlist.append(0)
            available_units.append('')
            apt.append('skyloft')
            curr = sections.find_element_by_xpath('li[' + str(j + 1) + ']')
            name = curr.find_element_by_xpath('div/h4/a').get_attribute('innerHTML')
            model_names.append(name)
            bed = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bed = bed[0:bed.find('<')]
            if bed.find('Studio') != -1:
                bed = bed[0:bed.find('&')]
            beds.append(bed)
            bath = curr.find_element_by_xpath('div/div[2]/div[1]/span[2]').get_attribute('innerHTML')
            bath = bath[(bath.find('/ ') + 2):]
            bath = bath[0:bath.find('<')]
            baths.append(bath)
            dep = curr.find_element_by_xpath('div/div[2]/div[3]/span[2]').get_attribute('innerHTML')
            if dep == 'N/A':
                dep = 0
            deposits.append(dep)
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            links.append(link)

            site_init(links[len(links) - 1])
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            rent = rent[0:rent.find('<')]
            prices.append(rent)
            image = driver.find_element_by_tag_name('img').get_attribute('src')
            images.append(image)
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            sq_feet.append(feet)
            site_init(url)
            frame = driver.find_element_by_id('website_678753')
            driver.switch_to.frame(frame)
            display_all = driver.find_element_by_class_name('btn')
            display_all.click()
            time.sleep(2)


def extract_twentytwo15(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.2215west.com/Floor-plans.aspx'
    site_init(url)

    models = driver.find_elements_by_class_name('floorplan-block')
    for i in range(len(models)):
        models = driver.find_elements_by_class_name('floorplan-block')
        item = models[i]
        prices.append('')
        available_units.append('')
        waitlist.append(0)
        apt.append('twenty_two_15')
        bed = item.get_attribute('data-bed')
        if bed == 'S':
            bed = 'Studio'
        beds.append(bed)
        bath = item.get_attribute('data-bath')
        baths.append(bath)
        sqft = item.get_attribute('data-sqft')
        sq_feet.append(sqft)
        name = item.get_attribute('data-floorplan-name')
        model_names.append(name)
        link_path = item.find_element_by_class_name('li_print').find_element_by_class_name('tip_down').get_attribute('onclick')
        link_path = link_path[link_path.find(" ")+1:]
        site_id = link_path[0:link_path.find(",")]
        link_path = link_path[link_path.find(",")+2:]
        model_id = link_path[0:link_path.find(",")]
        name = name.replace(" ", "-")

        temp_url = 'https://www.2215west.com/Brochure/' + name + '?siteId=' + site_id + '&fId=' + model_id
        links.append(temp_url)
        site_init(temp_url)
        dep_path = driver.find_element_by_id('p_lt_zoneMiddleRight_WebPartLoader_ctl00_flpDetails')
        dep = dep_path.find_element_by_xpath('//ul/li[4]/span').get_attribute('innerHTML')
        dep = dep[dep.find(" ")+1:]
        if dep[0] == '$':
            dep = int(dep[1:])
        deposits.append(dep)
        image_holder = driver.find_element_by_class_name('fpContent')
        image = None
        try:
            image = image_holder.find_element_by_tag_name('img').get_attribute('src')
        except NoSuchElementException:
            image = "None"
        images.append(image)
        site_init(url)


def extract_21rio(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
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
            model_names.append(name)
            link = items[j].find_element_by_class_name('fp-name-link').get_attribute('href')
            links.append(link)

            site_init(link)
            bed = driver.find_element_by_class_name('beds').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            bath = driver.find_element_by_class_name('baths').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            size = driver.find_element_by_class_name('sq-feet').find_element_by_class_name('stat-value').get_attribute('innerHTML')
            price = driver.find_element_by_class_name('radio').find_element_by_tag_name('label').get_attribute('innerHTML')
            price = price[price.find('$')+1:]
            image = driver.find_elements_by_class_name('galleria-image')
            wait = image
            if len(image) > 1:
                image = image[len(image)-1].find_element_by_tag_name('img').get_attribute('src')
                wait = wait[len(wait)-1].find_element_by_tag_name('img').get_attribute('alt')
            else:
                image = image.find_element_by_tag_name('img').get_attribute('src')
                wait = wait.find_element_by_tag_name('img').get_attribute('alt')

            if wait.lower().find('waitlist') > -1:
                waitlist.append(1)
            else:
                waitlist.append(0)

            units = wait.lower()
            if units.find('less than') > -1:
                units = "<" + units[units.find('less than') + 10:]
                available_units.append(units)
            else:
                available_units.append('')
            beds.append(bed)
            baths.append(bath)
            sq_feet.append(size)
            prices.append(price)
            images.append(image)
            apt.append('21rio')
            deposits.append(0)
            site_init(url)


def extract_9rio(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    url = 'https://www.the9rio.com/floorplans/'
    site_init(url)
    models = driver.find_element_by_id('accordion').find_elements_by_class_name('card')
    for i in range(len(models)):
        models = driver.find_element_by_id('accordion').find_elements_by_class_name('card')
        item = models[i]
        available = item.find_element_by_class_name('card-link-text').get_attribute('innerHTML').lower()
        if (available == 'sold out'):
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
            model_names.append(name)
            beds.append(bed)
            baths.append(bath)
            prices.append(price)
            sq_feet.append(size)
            images.append(image)
            apt.append('9rio')
            links.append(link)
            available_units.append(units)
            waitlist.append(0)
            deposits.append(0)

        site_init(url)


def connect(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images):
    connection = None
    try:
        connection = mysql.connector.connect(host=host, database=database, user=user, password=password)
        if connection.is_connected():
            print('Connected to MySQL database')

        for i in range(len(model_names)):
            name = model_names[i]
            bed = beds[i]
            bath = baths[i]
            price = prices[i]
            wait = waitlist[i]
            unit = available_units[i]
            size = sq_feet[i]
            dep = deposits[i]
            link = links[i]
            apartment = apt[i]
            image = images[i]
            args = (name, bed, bath, price, dep, wait, unit, size, link, apartment, image)
            mySql_insert_query = "INSERT INTO apartment_data (Name, Beds, Baths, Price, Deposits, Waitlist, Available_Units, Size, Link, Apartment, Image) \
             VALUES(%s, %d, %d, %s, %d, %d, %d, %s, %s, %s, %s)"
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
driver = webdriver.Chrome("/mnt/c/Program Files (x86)/Google/Chrome/Application/chromedriver.exe")
model_names = []
beds = []
baths = []
prices = []
waitlist = []
apt = []
available_units = []
sq_feet = []
links = []
deposits = []
images = []
extract_26west(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_blockonpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_crestatpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_callaway(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_castilian(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_texan_vintage(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_riowest(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_skyloft(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_twentytwo15(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_21rio(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
extract_9rio(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
driver.close()
connect(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt, images)
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





