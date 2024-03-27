# Serverless Nest JS API to generate PDF by URL

## English (EN)

This is a serverless RESTful API built with [Nest JS](https://nestjs.com/) and [Puppeteer](https://github.com/puppeteer/puppeteer) to generate PDF by URL.

### Setup

1. Install the dependencies: `yarn`
2. Create a `.env` file based on `.env.sample` and set the environment variables as needed
3. Deploy the API: `sls deploy`

### Usage

The API has one endpoint:

#### POST /getProductPDF

The request body contains:

* `url`: the URL to generate the PDF
* `override`: indicates if the file need to be overrited on storage (local or S3)

The response will be url for the PDF.

The filename is calculated using sha1.


