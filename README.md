# Website Form Automation

A robust, end-to-end test automation framework built with [Playwright](https://playwright.dev/) and TypeScript. This repository automates complex web application forms and third-party payment gateway integrations to ensure seamless user experiences.

## 🚀 Project Overview

This project simulates real-world user interactions across various insurance and product application workflows. 

**Key Features:**
* **Dynamic Data Generation:** Utilizes `@faker-js/faker` to inject randomized, realistic test data (names, addresses, vehicle details) into forms.
* **Sequential E2E Flows:** Leverages `test.describe.serial` and shared browser contexts to test continuous multi-page journeys (e.g., submitting an application and proceeding directly to a payment gateway).
* **Sandbox Integration:** Includes automated handling of the Brankas payment sandbox, managing dynamic login states, and conditional account selections.
* **Rich Reporting:** Automatically captures screenshots and generates an interactive HTML report upon test completion.

## ⚙️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* Git

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/arrapatricia/website-form-automation.git](https://github.com/arrapatricia/website-form-automation.git)
