*** Settings ***
Resource          resources/common.robot
Suite Setup       Open Browser    ${BASE_URL}/dca    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Go To    ${BASE_URL}/dca

*** Variables ***
${DCA_URL}    ${BASE_URL}/dca

*** Test Cases ***
Page title heading is visible
    Wait Until Page Contains Element    xpath=//h4[normalize-space()='DCA Calculator']

Inputs panel is visible
    Page Should Contain    Inputs

Start age field has default value 25
    Element Attribute Value Should Be
    ...    xpath=(//input[@type='number'])[1]    value    25

End age field has default value 40
    Element Attribute Value Should Be
    ...    xpath=(//input[@type='number'])[2]    value    40

Retire age field has default value 60
    Element Attribute Value Should Be
    ...    xpath=(//input[@type='number'])[3]    value    60

Annual return rate field has default value 7
    Page Should Contain Element    xpath=//input[@value='7']

Stat cards for principal, profit, and balance are rendered
    Wait Until Page Contains    Total Principal
    Page Should Contain    Total Profit
    Page Should Contain    Total Balance

Expected passive income section is visible
    Page Should Contain    Expected Passive Income

Balance growth chart title is visible
    Page Should Contain    Balance Growth Over Years

Changing start age updates the stat cards
    Clear Element Text    xpath=(//input[@type='number'])[1]
    Input Text    xpath=(//input[@type='number'])[1]    30
    Wait Until Page Contains    Total Balance
