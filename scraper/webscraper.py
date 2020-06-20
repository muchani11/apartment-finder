from datetime import datetime
import time

from bs4 import BeautifulSoup
from selenium import webdriver
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


def site_init(url):
    driver.get(url)
    time.sleep(2)


def extract_26west(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/26-west/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('26_west')



def extract_blockonpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
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
        link = item.find_element_by_class_name('rpfp-button').get_attribute('data-src')
        link = 'https://www.theblockwestcampus.com/' + link
        links.append(link)
        waitlist.append('')
        deposits.append('0')


def extract_crestatpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/crest-at-pearl/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('crest_at_pearl')


def extract_callaway(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-callaway-house-austin/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        prices.append('')
        deposits.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        beds.append(bed)
        baths.append(bath)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('callaway')


def extract_castilian(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/the-castilian/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append('')
        prices.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        beds.append(bed)
        baths.append(bath)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('castilian')


def extract_texan_vintage(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.americancampus.com/student-apartments/tx/austin/texan-and-vintage-west-campus/floor-plans'
    site_init(url)
    models = driver.find_elements_by_class_name("floor-plan-container")
    for item in models:
        available_units.append('')
        sq_feet.append('')
        deposits.append('')
        bed = item.get_attribute('data-beds')
        bath = item.get_attribute('data-baths')
        rel = bath.find('.')
        if rel != -1:
            bath = bath[0:rel]
        price = item.get_attribute('data-price')
        beds.append(bed)
        baths.append(bath)
        prices.append(price)
        link = item.find_element_by_xpath('div/div/a').get_attribute('href')
        links.append(link)
        wait = item.find_element_by_xpath('div/div/a/img').get_attribute('src')
        waitlist.append(1) if (wait.find('Waitlist') != -1) else waitlist.append(0)
        name = item.find_element_by_xpath('div/div/a/img').get_attribute('title')
        model_names.append(name)
        apt.append('texan_and_vintage')


def extract_riowest(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.rioweststudentliving.com/austin-austin-texas/rio-west-new-rio-west-student-apartments/'
    site_init(url)
    models = driver.find_elements_by_class_name("fp-group-list")
    for i in range(len(models)):
        models = driver.find_elements_by_class_name("fp-group-list")
        sections = models[i]
        size = len(sections.find_elements_by_class_name('fp-group-item'))
        for j in range(size):
            models = driver.find_elements_by_class_name("fp-group-list")
            sections = models[i]
            waitlist.append('')
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
            deposits.append(dep)
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            links.append(link)

            site_init(links[len(links)-1])
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            rent = rent.replace('&nbsp;', ' ')
            prices.append(rent)
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            sq_feet.append(feet)
            site_init(url)


def extract_skyloft(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
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
            waitlist.append('')
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
            deposits.append(dep)
            link = curr.find_element_by_xpath('div/h4/a').get_attribute('href')
            links.append(link)

            site_init(links[len(links) - 1])
            stats = driver.find_element_by_class_name('fp-stats-list')
            rent = stats.find_element_by_xpath('li[1]/span[2]').get_attribute('innerHTML')
            rent = rent[0:rent.find('<')]
            prices.append(rent)
            feet = stats.find_element_by_xpath('li[4]/span[2]').get_attribute('innerHTML')
            sq_feet.append(feet)
            site_init(url)
            frame = driver.find_element_by_id('website_678753')
            driver.switch_to.frame(frame)
            display_all = driver.find_element_by_class_name('btn')
            display_all.click()
            time.sleep(2)


def extract_twentytwo15(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt):
    url = 'https://www.2215west.com/Floor-plans.aspx'
    site_init(url)

    models = driver.find_elements_by_class_name('floorplan-block')
    for i in range(len(models)):
        models = driver.find_elements_by_class_name('floorplan-block')
        item = models[i]
        prices.append('')
        available_units.append('')
        waitlist.append('')
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
        deposits.append(dep)
        site_init(url)



def extract_21rio(model_names, plans, prices):
    tabs = driver.find_elements_by_css_selector('.fp-tab-item')
    names = driver.find_elements_by_class_name('fp-name-link')
    print(len(names))
    for i in range(len(tabs)):
        prefix = 'fp-tab-' + str(i+1)
        for j in range(len(names)):
            if len(names[i].text) > 0:
                model_names.add(names[i].text)

        next_page = driver.find_element_by_id(prefix)
        next_page.click()


options = webdriver.ChromeOptions()
options.add_argument('headless')
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
extract_26west(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_blockonpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_crestatpearl(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_callaway(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_castilian(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_texan_vintage(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_riowest(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_skyloft(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
extract_twentytwo15(model_names, beds, baths, prices, waitlist, available_units, sq_feet, deposits, links, apt)
driver.close()


df = pd.DataFrame({'Name': model_names, 'Beds': beds, 'Baths': baths, 'Price:': prices, 'Deposit': deposits,
                   'Waitlist': waitlist, 'Available Units': available_units, 'Size (sq feet)': sq_feet, 'Link': links, 'Apartment': apt})
df.to_csv('apartments.csv', index=False, encoding='utf-8')





