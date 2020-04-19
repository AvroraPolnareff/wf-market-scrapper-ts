import {Riven} from "../models/Riven";
import {RivenWithDetails} from "../models/RivenWithDetails";

import {parseRivenPage} from "./parseRivenPage";


export const getRivenDetails = async (riven: Riven, browser) => {
    try {
        const url = riven.link

        const page = await browser.newPage()
        await page.goto(url)
        const allContent = await page.content()

        await page.close()

        return {...riven,...parseRivenPage(allContent)} as RivenWithDetails
    } catch (e) {
        console.log(e)
    }

}


