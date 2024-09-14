// /* eslint-disable @typescript-eslint/restrict-plus-operands */
import { type Page, type ViewportSize, type Browser } from '@playwright/test'
import { logger } from '../ui-automation-core/utilities/logUtils'

let defaultTimeout: 30000
let formedSelector: string = ''

export enum ElementWaitState {
  PRESENT = 1,
  VISIBLE = 2,
  INVISIBLE = 3
}

export const pageFixture = {
  page: undefined as unknown as Page,
  browser: undefined as unknown as Browser,

  async setViewport (width: number, height: number): Promise<void> {
    try {
      const viewport: ViewportSize = { width, height }
      await this.page.setViewportSize(viewport)
      logger.info(
        'Screen resolution set successfully to ' + String(width) + 'x' + String(height)
      )
    } catch (error) {
      logger.error('Unable to set the viewport: ' + String(error))
    }
  },

  /**
   * Opens the specified URL in the current page.
   * @param url - The URL to open.
   */
  async open (url: string): Promise<void> {
    try {
      await this.page.goto(url)
      logger.info('Opened URL: ' + url)
      this.page.setDefaultTimeout(100000)
    } catch (error) {
      logger.error('Error occurred while opening the URL: ' + String(error))
    }
  },

  /**
   * Closes the current window.
   */
  async close (): Promise<void> {
    try {
      await this.page.close()
      logger.info('Successfully closed the window')
    } catch (error) {
      logger.error(
        'Error occurred while closing the window: ' +
          String(error)
      )
      throw error
    }
  },

  /**
   * Retrieves the title of the current page.
   * Returns the page title.
   */
  async getPageTitle (): Promise<string> {
    try {
      await this.page.waitForLoadState('load')
      const pageTitle = await this.page.title()
      logger.info(`Page title: ${pageTitle}`)
      return pageTitle
    } catch (error) {
      logger.error('Error occurred while retrieving page title:', error)
      throw error
    }
  },

  /**
   * Retrieves the title of the specified page.
   * @param page - The page to retrieve the title from.
   * @returns the page title.
   * @throws Error if an error occurs while retrieving the page title.
   */
  async getSpecificPageTitle (page: Page): Promise<string> {
    try {
      const pageTitle = await page.title()
      logger.info(`Page title: ${pageTitle}`)
      return pageTitle
    } catch (error) {
      logger.error('Error occurred while retrieving page title:', error)
      throw error
    }
  },

  /**
   * Retrieves the current URL of the page.
   * @returns the current URL
   */
  async getCurrentUrl (): Promise<string> {
    try {
      const url = this.page.url()
      logger.info('Current URL has been retrieved successfully: ' + String(url))
      return url
    } catch (error) {
      logger.error('Error occurred while getting the current URL: ' + String(error))
      throw error
    }
  },

  /**
   * Wait for the element to be in the specified state.
   * @param selector - The selector of the element to wait for.
   * @param waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @throws Error if an error occurs while waiting for the element.
   */
  async waitForElementState (selector: string, waitState: ElementWaitState, timeoutMs?: number): Promise<void> {
    try {
      formedSelector = await pageFixture.formSelector(selector)
      let waitForSelectorPromise
      const timeout = timeoutMs !== undefined && timeoutMs > 0 ? timeoutMs : defaultTimeout

      switch (waitState) {
        case ElementWaitState.PRESENT:
          waitForSelectorPromise = this.page.waitForSelector(formedSelector)
          break
        case ElementWaitState.INVISIBLE:
          waitForSelectorPromise = this.page.waitForSelector(formedSelector, { state: 'hidden' })
          break
        case ElementWaitState.VISIBLE:
          waitForSelectorPromise = this.page.waitForSelector(formedSelector, { state: 'visible' })
          break
        default:
          throw new Error('Invalid waitState')
      }
      await Promise.race([waitForSelectorPromise, this.page.waitForTimeout(timeout)])
    } catch (error) {
      logger.error(`Error occurred while waiting for element '${selector}' with state '${waitState}':`, error)
      throw error
    }
  },

  /**
   * Sets the specified text in the element with the given selector.
   * @param selector - The selector of the element to set the text in.
   * @param text - The text to set in the element.
   * @param delay - Optional delay between key presses (in milliseconds). Defaults to 0.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   */
  async setText (selector: string, text: string, delay: number = 0, timeoutMs?: number): Promise<void> {
    try {
      await pageFixture.waitForElementState(selector, ElementWaitState.VISIBLE, timeoutMs)
      await pageFixture.clearText(selector, ElementWaitState.VISIBLE, timeoutMs)
      await this.page.type(formedSelector, text, { delay })
      logger.info(
        `Typed the text on element with selector '${selector}'.`)
    } catch (error) {
      logger.error('Error occurred while typing text: ' + String(error))
    }
  },

  /**
    * Clears the text content of the element with the given selector.
   * @param selector - The selector of the element to clear the text content from.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @throws Error if not able to clear the text
   */
  async clearText (selector: string, waitState?: ElementWaitState, timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.fill('')
        logger.info(`Cleared text in element with selector '${selector}'.`)
      } else {
        throw new Error(`Element with selector '${selector}' not found.`)
      }
    } catch (error) {
      logger.error(`Error occurred while clearing text in element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Presses and releases the key in the element with the given selector.
   * @param selector - The selector of the element to press and release the key.
   * @param key - The key to press and release.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @throws Error if the element is not found.
  */
  async keyPress (selector: string, key: string, waitState?: ElementWaitState, timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.press(key)
        logger.info(`Performed key operations in element with selector '${selector}'.`)
      } else {
        throw new Error(`Element with selector '${selector}' not found.`)
      }
    } catch (error) {
      logger.error('Error occurred while deleting a character: ' + String(error))
      throw error
    }
  },

  /**
   * Retrieves the text content of the element with the given selector.
   * @param selector - The selector of the element to retrieve the text content from.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to the text content of the element.
   * @throws Error if the element is not found.
   */
  async getText (selector: string, waitState?: ElementWaitState, timeoutMs?: number): Promise<string> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        const textContent = await element.textContent()
        logger.info(`Successfully fetched the text content of the selector '${selector}'`)
        return textContent
      } else {
        throw new Error(`Element with selector '${selector}' not found.`)
      }
    } catch (error) {
      logger.error(`Error occurred while retrieving text content of element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Performs a click action on the element with the given selector.
   * @param selector - The selector of the element to click on.
   * @param modifiers - Optional array of keyboard modifiers to hold while clicking. Defaults to an empty array.
   * @param button - Optional mouse button to use for the click action. Defaults to 'left'.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @throws Error if an error occurs while clicking on the element.
   */
  async click (selector: string, modifiers = [], button: string = 'left', waitState?: ElementWaitState, timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.click({ modifiers, button })
        logger.info(`Clicked on element with selector '${selector}'.`)
      }
    } catch (error) {
      logger.error(`Error occurred while clicking on element '${selector}':`, error)
      throw error
    }
  },

  /**
   * Performs a double click action on the element with the given selector.
   * @param selector - The selector of the element to double click on.
   * @param button - Optional mouse button to use for the double click action. Defaults to 'left'.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @throws Error if an error occurs while double clicking on the element.
   */
  async doubleClick (selector: string, button: string = 'left', waitState?: ElementWaitState, timeoutMs?: number) {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.dblclick({ button })
        logger.info(`Double clicked on element with selector '${selector}'.`)
      }
    } catch (error) {
      logger.error(`Error occurred while double clicking on element '${selector}':`, error)
      throw error
    }
  },

  /**
   * Retrieves the element with the given selector.
   * @param selector - The selector of the element to retrieve.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Possible values are ElementWaitState.PRESENT, ElementWaitState.VISIBLE, ElementWaitState.INVISIBLE.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to returning the element
   * @throws Error if an error occurs while retrieving the element.
   */
  async getElement (selector: string, waitState?: ElementWaitState, timeoutMs?: number): Promise<any> {
    try {
      const timeout = timeoutMs !== undefined && timeoutMs > 0 ? timeoutMs : defaultTimeout
      const elementWaitState = waitState ?? ElementWaitState.VISIBLE

      await pageFixture.waitForElementState(selector, elementWaitState, timeout)

      const element = await this.page.$(formedSelector)
      logger.info(`Element with selector '${formedSelector}' has been found.`)
      return element
    } catch (error) {
      logger.error(`Error occurred while retrieving element '${formedSelector}':`, error)
      throw error
    }
  },

  /**
   * Retrieves multiple elements with the given selector.
   * @param selector - The selector of the elements to retrieve.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Possible values are ElementWaitState.PRESENT, ElementWaitState.VISIBLE, ElementWaitState.INVISIBLE.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to an array of elements
   * @throws Error if an error occurs while retrieving the elements.
   */
  async getElements (selector: string, waitState?: ElementWaitState, timeoutMs?: number): Promise<any> {
    try {
      const timeout = timeoutMs !== undefined && timeoutMs > 0 ? timeoutMs : defaultTimeout
      const elementWaitState = waitState ?? ElementWaitState.VISIBLE

      await pageFixture.waitForElementState(selector, elementWaitState, timeout)

      const elements = await this.page.$$(formedSelector)
      logger.info(`Elements with selector '${formedSelector}' has been found.`)
      return elements
    } catch (error) {
      logger.error(`Error occurred while retrieving elements '${formedSelector}':`, error)
      throw error
    }
  },

  /**
   * Retrieves the value of the specified attribute for the element with the given selector.
   * @param selector - The selector of the element.
   * @param attributeName - The name of the attribute to retrieve the value from.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to the attribute value
   * @throws Error if an error occurs while retrieving the attribute value.
   */
  async getPropertyValue (selector: string, attributeName: string, waitState?: ElementWaitState,
    timeoutMs?: number): Promise<string> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      const property = await element.getProperty(attributeName)
      const propertyValue = await property.jsonValue()
      if (propertyValue !== null) {
        logger.info(`Successfully fetched the attribute '${attributeName}' value for element with selector '${selector}'.`)
        return propertyValue
      } else {
        throw new Error(`Unable to fetch the attriubte for the element with selector '${selector}'.`)
      }
    } catch (error) {
      logger.error(`Error occurred while retrieving attribute '${attributeName}' value for element '${selector}':`, error)
      throw error
    }
  },

  /**
   * Checks the presence of the element with the given selector.
   * @param selector - The selector of the element to check.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to a boolean value indicating the presence of the element.
   * @throws Error if an error occurs while checking the presence of the element.
   */
  async isElementPresent (selector: string, timeoutMs?: number): Promise<boolean> {
    try {
      const element = await pageFixture.getElement(selector, ElementWaitState.PRESENT, timeoutMs)
      if (element !== null) {
        logger.info(`Element with selector '${selector}' is present:`)
        return true
      } else {
        logger.error(`Element with selector '${selector}' was not present.`)
        return false
      }
    } catch (error) {
      logger.error(`Error occurred while checking presence of element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Checks the visibility of the element with the given selector.
   * @param selector - The selector of the element to check visibility.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to a boolean value indicating the visibility of the element.
   * @throws Error if an error occurs while checking the visibility of the element.
   */
  async isElementVisible (selector: string, timeoutMs?: number): Promise<boolean> {
    try {
      const element = await pageFixture.getElement(selector, ElementWaitState.VISIBLE, timeoutMs)
      if (element != null) {
        const isElementVisible = await element.isVisible()
        if (isElementVisible === true) {
          logger.info(`Element with selector '${selector}' is visible:`)
          return isElementVisible
        } else {
          logger.error(`Element with selector '${selector}' was not visible.`)
          return false
        }
      } else {
        throw new Error(`Element with selector '${selector}' was not present.`)
      }
    } catch (error) {
      logger.error(`Error occurred while checking visibility of element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Checks the enabled status of the element with the given selector.
   * @param selector - The selector of the element to check the enabled status.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns Promise that resolves to a boolean value indicating the enabled status of the element.
   * @throws Error if an error occurs while checking the enabled status of the element.
   */
  async isElementEnabled (selector: string, timeoutMs?: number): Promise<boolean> {
    try {
      const element = await pageFixture.getElement(selector, ElementWaitState.VISIBLE, timeoutMs)
      if (element !== null) {
        const isEnabled = await element.isEnabled()
        if (isEnabled === true) {
          logger.info(`Element with selector '${selector}' is enabled.`)
          return true
        } else {
          logger.info(`Element with selector '${selector}' is disabled.`)
          return false
        }
      } else {
        throw new Error(`Element with selector '${selector}' was not present.`)
      }
    } catch (error) {
      logger.error(`Error occurred while checking the enabled status of element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Checks if an element specified by the given selector is checked.
   * @param selector - The selector of the element to check.
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns A promise that resolves to a boolean indicating whether the element is checked.
   */
  async isElementChecked (selector: string, timeoutMs?: number): Promise<boolean> {
    try {
      const element = await pageFixture.getElement(selector, ElementWaitState.VISIBLE, timeoutMs)
      if (element !== null) {
        const isChecked = await this.page.$eval(selector, (element: any) => element.checked)
        if (isChecked === true) {
          logger.info(`Element with selector '${selector}' is checked.`)
          return true
        } else {
          logger.info(`Element with selector '${selector}' is not checked.`)
          return false
        }
      } else {
        throw new Error(`Element with selector '${selector}' was not present.`)
      }
    } catch (error) {
      logger.error(`Error occurred while checking check status of element with selector '${selector}':`, error)
      throw error
    }
  },

  /**
   * Selects a checkbox element specified by the given selector.
   * @param selector - The CSS selector of the checkbox element to select.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns A promise that resolves once the checkbox has been selected.
   */
  async selectCheckbox (selector: string, waitState?: ElementWaitState,
    timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.check()
        logger.info(`Checkbox with selector '${selector}' has been selected.`)
      }
    } catch (error) {
      logger.error(`Error occurred while selecting checkbox with selector '${selector}':`, error)
    }
  },

  /**
   * Unselects a checkbox element specified by the given selector.
   * @param selector - The selector of the checkbox element to unselect.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns A promise that resolves once the checkbox has been unselected.
   */
  async unselectCheckbox (selector: string, waitState?: ElementWaitState,
    timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        await element.uncheck()
        logger.info(`Checkbox with selector '${selector}' has been unselected.`)
      }
    } catch (error) {
      logger.error(`Error occurred while unselecting checkbox with selector '${selector}':`, error)
    }
  },

  /**
   * Selects an option from a dropdown element specified by the given selector.
   * @param selector - The selector of the dropdown element.
   * @param option - The value or label of the option to select.
   * @waitState - The wait state of the element to retrieve. Defaults to ElementWaitState.VISIBLE. Choose state from ElementWaitState Enum
   * @timeoutMs - The timeout in milliseconds to wait for the element to be retrieved. Defaults to the default timeout(30seconds).
   * @returns A promise that resolves once the option has been selected from the dropdown.
   */
  async selectDropdownOption (selector: string, option: string, waitState?: ElementWaitState,
    timeoutMs?: number): Promise<void> {
    try {
      const element = await pageFixture.getElement(selector, waitState, timeoutMs)
      if (element != null) {
        const optionSelector = `option[value="${option}"], option[label="${option}"]`
        await element.selectOption({ optionSelector })
        logger.info(`Selected option '${option}' from dropdown with selector '${selector}'.`)
      }
    } catch (error) {
      logger.error(`Error occurred while selecting option '${option}' from dropdown with selector '${selector}':`, error)
    }
  },

  /**
   * Retrieves all open windows in the current context of the browser.
   * @returns A promise that resolves to an array containing all open windows.
   */
  async getAllWindows (): Promise<any[]> {
    try {
      const [multipleWindows] = await Promise.all([this.page.waitForEvent('popup')])
      await multipleWindows.waitForLoadState()
      const pages = this.page.context().pages()
      logger.info('Total windows found are: ' + String(pages.length))
      return pages
    } catch (error) {
      logger.error('An error occurred while getting all windows:', error)
      throw error
    }
  },

  /**
   * Switches to the specified window.
   * @param targetWindow - The target window to switch to.
   * @returns A promise that resolves once the switch to the target window is complete.
   */
  async switchToWindow (targetWindow: Page): Promise<void> {
    try {
      const pages = this.page.context().pages()
      const targetPage = pages.find((page) => page === targetWindow)

      if (targetPage != null) {
        await targetPage.bringToFront()
        logger.info('Switched to the target window')
      } else {
        logger.error('Target window not found')
      }
    } catch (error) {
      logger.error('An error occurred while switching windows:', error)
      throw error
    }
  },

  /**
   * Switches to a child window and returns the parent window.
   * @returns A promise that resolves to the parent window after switching to the child window.
   * @throws Error if the child window is not found.
   */
  async switchToChildWindow (): Promise<Page> {
    try {
      const parentWindow = this.page
      const allWindows = this.page.context().pages()

      const childWindow = allWindows.find((window) => window !== parentWindow)

      if (childWindow != null) {
        await childWindow.bringToFront()
        logger.info('Switched to the child window')
        return parentWindow
      } else {
        throw new Error('Child window not found')
      }
    } catch (error) {
      logger.error('An error occurred while switching windows:', error)
      throw error
    }
  },

  /**
   * Forms the selector based on the prefix of the selector string.
   * @param selector - The selector to form.
   * @returns The formed selector.
   * @throws Error if the selector is invalid.
   */
  async formSelector (selector: string): Promise<string> {
    const xpathPattern = /^(\/\/|\()/

    if (selector.startsWith('#')) {
      const dataTestId = selector.slice(1)
      return `[data-testid="${dataTestId}"]`
    } else if (xpathPattern.test(selector)) {
      return selector
    } else {
      throw new Error(`Invalid selector format: ${selector}`)
    }
  },

  /**
   * Hovers over the element with the given selector.
   * @param selector - The selector of the element to hover over.
   * @returns A promise that resolves once the hover is complete.
   * @throws Error if an error occurs while hovering over the element.
   */
  async mouseHover (selector: string): Promise<void> {
    try {
      await this.page.hover(selector)
      logger.info('Mouse hovered on element with selector: ' + selector)
    } catch (error) {
      logger.error('Error occurred while hovering over the element: ' + String(error))
      throw error
    }
  },

  /**
   * Waits for the specified amount of time.
   * @param ms - The amount of time to wait in milliseconds.
   * @returns A promise that resolves once the wait is complete.
   * @throws Error if an error occurs while waiting.
   */
  async waitFor (ms: number): Promise<void> {
    try {
      await this.page.waitForTimeout(ms)
      logger.info(`Waited for ${ms} milliseconds`)
    } catch (error) {
      logger.error(`Error occurred while waiting for ${ms} milliseconds:`, error)
      throw error
    }
  },

  /**
   * Quits the browser.
   */
  async quit (): Promise<void> {
    try {
      await pageFixture.browser.close()
      logger.info('Successfully closed the browser')
    } catch (error) {
      logger.error(
        'Error occurred while closing the browser: ' +
          String(error)
      )
    }
  }
}
