#!/usr/bin/env node

const fs = require('fs-extra');
const rsync = require('rsyncwrapper')


/*
    rsync-pull data for /www/ultimheat.co.th/en/new-products.html

    Connect to a transit folder (local - remote)
    ya-bkk@caltek.net ~/ftp/files/new-products

    folder new-products in transit contains temporary folders
    with (jpeg, pdf, md) and docx.

    For each folder: ex: Y2K1 : move to ultimheat.co.th
      - pdf => /www/ultimheat.co.th/en/pdf
      - jpeg => /www/ultimheat.co.th/new-images
      - md => /www/ultimheat.co.th/en/new-products.html-Y2K1.md

    Rules:
    (1) [Y2K1] is found in md/metadata.article_id
    (2) If article_id not set => default to folder name.
    (3) /www/ultimheat.co.th/en/new-products.js is the driver with config
          and sets pdf destination, jpeg destination.
    (4) if (3) is missing, check for metadata in new-products.html
*/


console.log('rsync-pull (ultimheat.co.th new-products)');

rsync_pull('/www/ultimheat.co.th/en/new-products.html');

// ============================================================================


// console.log('rsync:', rsync)

function rsync_pull(html_file) {
  rsync({
    src: 'dkz@caltek.net:/home/ya-bkk/ftp/files/Cat11-Ultimheat-EN-P90-Y3L4-20200107',
    dest: './tmp',
    recursive: true
  }, (error, stdout, stderr, cmd)=>{
    console.log({error})
    console.log({stdout})
    console.log({stderr})
    console.log({cmd})
    /*
       Explore .md file
    */
    const files = fs.readdirSync('./tmp/Cat11-Ultimheat-EN-P90-Y3L4-20200107')
    console.log(files)
    let md = files.filter(fn=>fn.endsWith('.md')) // always array.
    if (Array.isArray(md) ) {
      console.log('ALERT Multiple .MD length:',md.length)
      md = md[0]
    }
    console.log({md})
  })
  console.log('rsync-pull started - going async.')
}
