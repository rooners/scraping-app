from asyncio import gather


async def get_product(product_div):
    # Query for all elements at once
    image_element_future = product_div.query_selector('img')
    name_element_future = product_div.query_selector('h1')
    price_element_future = product_div.query_selector('.pdp-right h2')
    url_element_future = product_div.query_selector('a')

    # Await all queries at once
    image_element, name_element, price_element, url_element = await gather(
        image_element_future,
        name_element_future,
        price_element_future,
        url_element_future,
    )

    # Fetch all attributes and text at once
    image_url = await image_element.get_attribute('src') if image_element else None
    product_name = await name_element.inner_text() if name_element else None
    try:
        product_price = float((await price_element.inner_text()).replace("£", "").replace(",", "").strip()) if price_element else None
    except:
        product_price = None
    product_url = await url_element.get_attribute('href') if url_element else None

    return {"img": image_url, "name": product_name, "price": product_price, "url": product_url}
