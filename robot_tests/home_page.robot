*** Settings ***
Resource          resources/common.robot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Go To    ${BASE_URL}

*** Test Cases ***
Hero headline is visible
    Page Should Contain Element
    ...    xpath=//h2[normalize-space()='Take Control of Your Financial Future']

Hero subtitle is visible
    Page Should Contain    track portfolios, set goals

Get Started button is present
    Page Should Contain Element    xpath=//button[normalize-space()='Get Started']

Features section title is visible
    Wait Until Page Contains    Everything You Need to Invest Smarter

All four feature cards are rendered
    Page Should Contain    Portfolio Tracking
    Page Should Contain    Goal Planning
    Page Should Contain    Risk Analysis
    Page Should Contain    Smart Insights

CTA banner is visible
    Page Should Contain    Ready to Start Investing?

Footer shows copyright notice
    Page Should Contain Element    xpath=//*[contains(translate(normalize-space(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'all rights reserved')]

Clicking Get Started navigates to DCA page
    Click Element    xpath=(//button[normalize-space()='Get Started'])[1]
    Wait Until Page Contains Element    xpath=//h4[normalize-space()='DCA Calculator']
