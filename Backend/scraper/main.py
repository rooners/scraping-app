import asyncio
from playwright.async_api import async_playwright
import json
import os
from amazon import get_product as get_amazon_product
from john_lewis import get_product as get_john_lewis_product
from costco import get_product as get_costco_product
from argos import get_product as get_argos_product
from requests import post

AMAZON = "https://amazon.ca"
JOHN_LEWIS = "https://www.johnlewis.com"
COSTCO = "https://www.costco.ca"
ARGOS = "https://www.argos.co.uk"

URLS = {
    AMAZON: {
        "search_field_query": 'input[name="field-keywords"]',
        "search_button_query": 'input[value="Go"]',
        "product_selector": "div.s-card-container"
    },
    JOHN_LEWIS: {
        "search_field_query": 'input[name="search-term"]',
        "search_button_query": 'button[type="submit"]',
        "product_selector": "div.product-card"
    },
    COSTCO: {
        "search_field_query": 'input[name="search-term"]',
        "search_button_query": 'button[type="submit"]',
        "product_selector": "div.product-card"
    },
    ARGOS: {
        "search_field_query": 'input[name="search-term"]',
        "search_button_query": 'button[type="submit"]',
        "product_selector": "div.product-card"
    }
}

available_urls = URLS.keys()


async def search(metadata, page, search_text):
    print(f"Searching for {search_text} on {page.url}")
    search_field_query = metadata.get("search_field_query")
    search_button_query = metadata.get("search_button_query")

    if search_field_query and search_button_query:
        print("Filling input field")
        search_box = await page.wait_for_selector(search_field_query)
        await search_box.type(search_text)
        print("Pressing search button")
        button = await page.wait_for_selector(search_button_query)
        await button.click()
    else:
        raise Exception("Could not search.")

    await page.wait_for_load_state()
    return page


async def get_products(page, search_text, selector, get_product):
    print("Retreiving products.")
    product_divs = await page.query_selector_all(selector)
    valid_products = []
    words = search_text.split(" ")

    async with asyncio.TaskGroup() as tg:
        for div in product_divs:
            async def task(p_div):
                product = await get_product(p_div)

                if not product["price"] or not product["url"]:
                    return

                for word in words:
                    if not product["name"] or word.lower() not in product["name"].lower():
                        break
                else:
                    valid_products.append(product)
            tg.create_task(task(div))

    return valid_products


def save_results(results):
    data = {"results": results}
    FILE = os.path.join("Scraper", "results.json")
    with open(FILE, "w") as f:
        json.dump(data, f)


def post_results(results, endpoint, search_text, source):
    headers = {
        "Content-Type": "application/json"
    }
    data = {"data": results, "search_text": search_text, "source": source}

    print("Sending request to", endpoint)
    response = post("http://localhost:5000" + endpoint,
                    headers=headers, json=data)
    print("Status code:", response.status_code)


async def main(url, search_text, response_route):
    metadata = URLS.get(url)
    if not metadata:
        print("Invalid URL.")
        return

    async with async_playwright() as pw:
        print('Connecting to browser.')
        browser = await pw.chromium.launch()
        page = await browser.new_page()
        print("Connected.")
        await page.goto(url, timeout=120000)
        print("Loaded initial page.")
        search_page = await search(metadata, page, search_text)

        def func(x): return None
        if url == AMAZON:
            func = get_amazon_product
        elif url == JOHN_LEWIS:
            func = get_john_lewis_product
        elif url == COSTCO:
            func = get_costco_product
        elif url == ARGOS:
            func = get_argos_product
        else:
            raise Exception('Invalid URL')

        results = await get_products(search_page, search_text, metadata["product_selector"], func)
        print("Saving results.")
        post_results(results, response_route, search_text, url)

        await browser.close()

if __name__ == "__main__":
    # test script
    asyncio.run(main(AMAZON, "ryzen 9 3950x"))
