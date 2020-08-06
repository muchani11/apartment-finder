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
aptIDs = []

id_26west = 1
id_block = 2
id_crest = 3
id_callaway = 4
id_castilian = 5
id_texan_vintage = 6
id_riowest = 7
id_skyloft = 8
id_2215 = 9
id_21rio = 10
id_9rio = 11
id_quarters_nueces = [12, 13, 14, 15, 16, 17]


def site_init(url):
    driver.get(url)
    time.sleep(2)


def insert_data(name, bed, bath, price, wait, unit, size, dep, link, apt_complex, image, currId):
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
    aptIDs.append(currId)
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
    elif price.find("–") > -1:
        price = price.replace(" ", "")
        price = price.replace("$", "")
        price = price.replace(",", "")
        min_price = int(float(price[0:price.find("–")]))
        max_price = int(float(price[price.find("–") + 1:]))
        min_prices.append(min_price)
        max_prices.append(max_price)
    else:
        price = price.replace("$", "")
        price = price.replace(" ", "")
        price = price.replace(",", "")
        price = int(float(price))
        min_prices.append(price)
        max_prices.append(price)

    if size.find("–") > -1:
        size = size.replace(" ", "")
        size = size.replace(",", "")
        min_size = int(float(size[0:size.find("–")]))
        max_size = int(float(size[size.find("–") + 1:]))
        min_sizes.append(min_size)
        max_sizes.append(max_size)
    elif size.find('-') > -1:
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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.11627248781!2d-97.74586208492458!3d30.290751381793395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b578e657244f%3A0x6de775e1eb3b500a!2s26%20West!5e0!3m2!1sen!2sus!4v1595050345489!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_26west)


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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.2959461004248!2d-97.74890928492472!3d30.285635481795275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b54a4d30ff83%3A0xd277e60fc8ccafd4!2sThe%20Block%20on%20Pearl%20South!5e0!3m2!1sen!2sus!4v1595055068597!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_block)


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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.2845587021834!2d-97.74569063410682!3d30.285959741773237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b578073cb2ef%3A0x3ed073bdee1d9e85!2sCrest%20at%20Pearl!5e0!3m2!1sen!2sus!4v1595055162635!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_crest)


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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.3227548314526!2d-97.74566498492474!3d30.284872081795445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b577c8476ae1%3A0x14e5f8aadf76c05a!2sThe%20Callaway%20House%20Austin!5e0!3m2!1sen!2sus!4v1595055224429!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_callaway)


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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.234495119047!2d-97.74468298492465!3d30.287385281794514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b577f7e5a8f5%3A0x32d900e927d36037!2sThe%20Castilian!5e0!3m2!1sen!2sus!4v1595055264872!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_castilian)


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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.236616351739!2d-97.74458038492466!3d30.28732488179459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b5781c5c5f63%3A0xd9dc07203f55082f!2sTexan%20%26%20Vintage%20West%20Campus!5e0!3m2!1sen!2sus!4v1595055303478!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_texan_vintage)


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
            map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.052128547562!2d-97.74653228492454!3d30.29257758179265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b5781a69f3bd%3A0x37dd7aa4753d7c4a!2sRio%20West%20Student%20Living!5e0!3m2!1sen!2sus!4v1595055346658!5m2!1sen!2sus"
            insert_data(name, bed, bath, rent, wait, units, feet, dep, link, apt_name, image, id_riowest)
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
            if dep == 'N/A' or dep == '—':
                dep = 0
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            site_init(link)
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            print(rent)
                #.find_element_by_class_name('radio') rent = rent.find_element_by_tag_name('label').get_attribute('innerHTML')
            if rent.find('$') > -1:
                rent = rent[rent.rfind('$'):]
            image = driver.find_element_by_tag_name('img').get_attribute('src')
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            apt_name = "Skyloft"
            map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.2705731134893!2d-97.74569568492471!3d30.28635798179501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b577fca21c09%3A0xea44e613999fb295!2sSkyloft%20Austin!5e0!3m2!1sen!2sus!4v1595055388001!5m2!1sen!2sus"
            insert_data(name, bed, bath, rent, wait, units, feet, dep, link, apt_name, image, id_skyloft)
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
        map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.2642166115716!2d-97.74674228492472!3d30.28653898179494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b57777af2db1%3A0x448b1a1f25beb08c!2sTwenty%20Two%2015!5e0!3m2!1sen!2sus!4v1595055428053!5m2!1sen!2sus"
        insert_data(name, bed, bath, price, wait, units, sqft, dep, temp_url, apt_name, image, id_2215)
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
            map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.337307284444!2d-97.74708138492475!3d30.284457681795605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b576fde23075%3A0xfda2d2f607ef31fd!2s21%20Rio!5e0!3m2!1sen!2sus!4v1595055484058!5m2!1sen!2sus"
            insert_data(name, bed, bath, price, must_wait, units, size, dep, link, apt_name, image, id_21rio)
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
            map_src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.343568576401!2d-97.74753758492479!3d30.284279381795717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b5b1983e72e1%3A0xc5314299021d0301!2sThe%20Nine%20at%20Rio!5e0!3m2!1sen!2sus!4v1595055525566!5m2!1sen!2sus"
            wait = 0
            dep = 0
            insert_data(name, bed, bath, price, wait, units, size, dep, link, apt_name, image, id_9rio)

        site_init(url)


def extract_quarters_nueces():
    url = 'https://quartersoncampus.com/floor-plans/'
    site_init(url)
    houses = driver.find_element_by_id('floorplan-triggers').find_elements_by_tag_name('a')
    for i in range(len(houses)):
        apt_name = houses[i].get_attribute('innerHTML')
        relHouse = apt_name[0:apt_name.find('House') - 1].lower()
        models = driver.find_element_by_id('floorplan-' + relHouse).find_elements_by_class_name('et_pb_text_inner')
        print(apt_name)
        for j in range(len(models)):
            item = models[j]
            try:
                item.find_element_by_class_name('floorplan__title')
            except NoSuchElementException as e:
                continue

            name = item.find_element_by_class_name('floorplan__title').get_attribute('innerHTML')
            info = item.find_element_by_class_name('floorplan__info').get_attribute('innerHTML')
            info = info.split('<br>')

            bed = None
            bath = None
            size = None
            if info[0].find('Studio') > -1:
                bed = 0
                bath = 1
            else:
                bedIndex = info[0].split(" ")
                bed = bedIndex[0]
                bath = bedIndex[len(bedIndex) - 2]

            sizeIndex = info[1]
            size = sizeIndex[0: sizeIndex.find("Sq") - 1]
            price = item.find_element_by_class_name('floorplan__info--optional').get_attribute('innerHTML')
            if price.find('Sold Out') > -1:
                continue

            price = price[price.find("$"):]
            image = item.find_element_by_xpath('p[2]/a').get_attribute('href')
            wait = 0
            units = ''
            dep = 0
            link = url

            size = size.replace('–', '-')
            price = price.replace('–', '-')
            insert_data(name, bed, bath, price, wait, units, size, dep, link, 'The Quarters at ' + apt_name, image, id_quarters_nueces[i])



def connect():
    connection = None
    try:
        connection = mysql.connector.connect(host=host, database=database, user=user, password=password)
        if connection.is_connected():
            print('Connected to MySQL database')

    except Error as e:
        print(e)

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
        apt_id = aptIDs[i]
        args = (name, bed, bath, min_pr, max_pr, dep, wait, unit, min_si, max_si, link, apartment, image, apt_id)
        try:
            mySql_insert_query = "INSERT INTO apartment_data (Name, Beds, Baths, MinPrice, MaxPrice, Deposits, Waitlist, Available_Units, MinSize, MaxSize, Link, Apartment, Image, AptID) \
             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor = connection.cursor()
            cursor.execute(mySql_insert_query, args)
            connection.commit()
            print(cursor.rowcount, "Record inserted successfully into Apartment table")
            cursor.close()
        except Error as e:
            print(e)

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

#extract_26west()
#connect()
#extract_blockonpearl()
#connect()
#extract_crestatpearl()
#connect()
#extract_callaway()
#connect()
#extract_castilian()
#connect()
#extract_texan_vintage()
#connect()
#extract_riowest()
#connect()
# extract_skyloft()
# connect()
# extract_21rio()
# connect()
# extract_9rio()
# connect()
# extract_twentytwo15()
# connect()
extract_quarters_nueces()
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





