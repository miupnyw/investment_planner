*** Settings ***
Resource          resources/common.robot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Go To    ${BASE_URL}

*** Test Cases ***
Home navigation link is present
    Page Should Contain Element    xpath=//a[normalize-space()='Home']

DCA Calculator navigation link is present
    Page Should Contain Element    xpath=//a[normalize-space()='DCA Calculator']

Portfolio navigation link is present
    Page Should Contain Element    xpath=//a[normalize-space()='Portfolio']

THB currency toggle button is present
    Page Should Contain Element    xpath=//button[normalize-space()='THB']

USD currency toggle button is present
    Page Should Contain Element    xpath=//button[normalize-space()='USD']

Language select dropdown is present
    Page Should Contain Element    tag:select

Theme toggle button is present
    Page Should Contain Element    xpath=//button[@aria-label='Dark mode' or @aria-label='Light mode' or @title='Dark mode' or @title='Light mode']

Clicking DCA Calculator link navigates to DCA page
    Click Element    xpath=//a[normalize-space()='DCA Calculator']
    Wait Until Page Contains Element    xpath=//h4[normalize-space()='DCA Calculator']

Clicking Home link navigates back to home page
    Go To    ${BASE_URL}/dca
    Click Element    xpath=//a[normalize-space()='Home']
    Wait Until Page Contains    Take Control of Your Financial Future

Clicking USD toggles currency to USD
    Click Element    xpath=//button[normalize-space()='USD']
    Element Should Be Visible    xpath=//button[normalize-space()='THB']

Clicking THB switches currency back to THB
    Click Element    xpath=//button[normalize-space()='USD']
    Click Element    xpath=//button[normalize-space()='THB']
    Element Should Be Visible    xpath=//button[normalize-space()='USD']
