#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path')
const rsync = require('rsyncwrapper')
const yaml = require('js-yaml')

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


const yargv = require('yargs')
.alias('v','verbose').count('verbose')
//.alias('i','instance_name')
.argv;

//const new_product_folder = 'dkz-product';
const new_product_folder = yargv._[0];

console.log('rsync-pull (ultimheat.co.th new-products)');

//const new_product_folder = 'Cat32-Ultimheat-EN-P65-P66-BM-20200107';

rsync_pull(new_product_folder);

// ============================================================================


// console.log('rsync:', rsync)


function rsync_pull(np_folder) {
  rsync({
    src: path.join('dkz@caltek.net:/home/ya-bkk/ftp/files',np_folder),
    dest: './tmp',
    recursive: true
  }, async (error, stdout, stderr, cmd)=>{
    console.log({error})
    console.log({stdout})
    console.log({stderr})
    console.log({cmd})
    /*
       Explore .md file
       ATT: here should be an iterative on each folder (product) in ./tmp
       Then an iterative on files in each product.
    */

    // here, we traite 1 product....
    const files = fs.readdirSync(path.join('./tmp',np_folder))
    console.log(files)

    const md =[];
    const pdf = [];
    const jpeg = [];
    const other_fn = [];

    files.forEach(fn=>{
      if (fn.endsWith('.md')) md.push(fn)
      else if (fn.endsWith('.jpg')) jpeg.push(fn)
      else if (fn.endsWith('.pdf')) pdf.push(fn)
      else other_fn.push(fn)
    })
    if (md.length >1) {
      console.log('ALERT Multiple .MD length:',md.length)
    }

    /*
        MD
    */

    console.log({md})
    const v = fs.readFileSync(path.join('./tmp',np_folder,md[0]),'utf8').split('---');
    console.log(v[1])
    const metadata = yaml.safeLoad(v[1])
    console.log({metadata})

    const md_fn = path.join('./tmp',np_folder, md[0]);
    const retv = await rsync_move_file(md_fn,`/www/ultimheat.co.th/en/new_products.html-${metadata.article_id}.yaml`); // should be MD.
    console.log({retv})


    /*
        move PDF if exists.
    */
    if (pdf.length >0) {
      const pdf_fn = path.join('./tmp',np_folder,pdf[0]);
      const {err} = await rsync_move_file(pdf_fn,'/www/ultimheat.co.th/en/pdf');
      console.log({err1})
    }

    /*
        jpeg
    */
    if (jpeg.length >0) {
      const jpeg_fn = path.join('./tmp',np_folder,jpeg[0]);
      const {err} = await rsync_move_file(jpeg_fn,'/www/ultimheat.co.th/new_images');
      console.log({err2})
    }


  }) // rsync
  console.log('rsync-pull started - going async.')
}

async function rsync_move_file(src,dest) {
  return new Promise((resolve,reject) =>{
    rsync({
      src, dest
//      recursive: true
    }, (error, stdout, stderr, cmd)=>{
      if (error) {
        console.log({error})
        console.log({cmd})
        reject(error);
        return;
      }
      resolve({error,stdout,stderr,cmd})
    }) // rsync
  }) // promise
} // rsync_mode
